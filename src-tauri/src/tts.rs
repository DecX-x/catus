use hound::{SampleFormat, WavSpec, WavWriter};
use ndarray::{Array1, Array2};
use ort::session::{builder::GraphOptimizationLevel, Session};
use ort::value::Tensor;
use std::collections::HashMap;
use std::io::{Cursor, Read};
use std::path::PathBuf;
use std::process::Command;
use zip::ZipArchive;

const SAMPLE_RATE: u32 = 24000;
const TRIM_SAMPLES: usize = 5000;

// ─────────────────────────────────────────────────────────────────────────────
// Vocab / TextCleaner
// ─────────────────────────────────────────────────────────────────────────────

/// Build the char → token-id map.
/// Matches TextCleaner in kittentts/onnx_model.py exactly.
fn build_vocab() -> HashMap<char, i64> {
    let pad = "$";
    let punctuation = ";:,.!?¡¿—…\"«»\"\" ";
    let letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    // IPA characters — must match the Python string character-for-character
    let letters_ipa = "ɑɐɒæɓʙβɔɕçɗɖðʤəɘɚɛɜɝɞɟʄɡɠɢʛɦɧħɥʜɨɪʝɭɬɫɮʟɱɯɰŋɳɲɴøɵɸθœɶʘɹɺɾɻʀʁɽʂʃʈʧʉʊʋⱱʌɣɤʍχʎʏʑʐʒʔʡʕʢǀǁǂǃˈˌːˑʼʴʰʱʲʷˠˤ˞↓↑→↗↘\u{0027}\u{0329}\u{2019}\u{1D7B}";

    let mut all = String::new();
    all.push_str(pad);
    all.push_str(punctuation);
    all.push_str(letters);
    all.push_str(letters_ipa);

    let mut vocab = HashMap::new();
    for (i, ch) in all.chars().enumerate() {
        vocab.insert(ch, i as i64);
    }
    vocab
}

// ─────────────────────────────────────────────────────────────────────────────
// Voice mapping & speed priors
// ─────────────────────────────────────────────────────────────────────────────

pub const AVAILABLE_VOICES: &[&str] = &[
    "Bella", "Jasper", "Luna", "Bruno", "Rosie", "Hugo", "Kiki", "Leo",
];

pub fn resolve_voice(name: &str) -> &'static str {
    match name {
        "Bella" => "expr-voice-2-f",
        "Jasper" => "expr-voice-2-m",
        "Luna" => "expr-voice-3-f",
        "Bruno" => "expr-voice-3-m",
        "Rosie" => "expr-voice-4-f",
        "Hugo" => "expr-voice-4-m",
        "Kiki" => "expr-voice-5-f",
        "Leo" => "expr-voice-5-m",
        _ => "expr-voice-5-m",
    }
}

fn speed_prior(voice: &str) -> f32 {
    match voice {
        "expr-voice-2-f" => 0.8,
        "expr-voice-2-m" => 0.8,
        "expr-voice-3-m" => 0.8,
        "expr-voice-3-f" => 0.8,
        "expr-voice-4-m" => 0.9,
        "expr-voice-4-f" => 0.8,
        "expr-voice-5-m" => 0.8,
        "expr-voice-5-f" => 0.8,
        _ => 1.0,
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Phonemization via espeak-ng subprocess
// ─────────────────────────────────────────────────────────────────────────────

fn phonemize(text: &str) -> Result<String, String> {
    let candidates = [
        r"C:\Program Files\eSpeak NG\espeak-ng.exe",
        r"C:\Program Files (x86)\eSpeak NG\espeak-ng.exe",
        "espeak-ng",
    ];
    let espeak = candidates
        .iter()
        .find(|p| std::path::Path::new(p).exists() || **p == "espeak-ng")
        .copied()
        .ok_or("espeak-ng not found")?;

    let output = Command::new(espeak)
        .args(["--ipa", "-q", "-l", "en-us", text])
        .output()
        .map_err(|e| format!("Failed to run espeak-ng: {e}"))?;

    if !output.status.success() {
        let err = String::from_utf8_lossy(&output.stderr);
        return Err(format!("espeak-ng error: {err}"));
    }

    Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
}

// ─────────────────────────────────────────────────────────────────────────────
// Tokenization
// ─────────────────────────────────────────────────────────────────────────────

/// Convert IPA phonemes to token IDs.
/// Python: tokens split on whitespace/punct, joined with space, then char-mapped.
fn tokenize(phonemes: &str, vocab: &HashMap<char, i64>) -> Vec<i64> {
    // Replicate Python's `basic_english_tokenize` + `' '.join()` + TextCleaner
    let words: Vec<&str> = phonemes.split_whitespace().collect();
    let joined = words.join(" ");

    let mut ids = vec![0i64]; // start token ($)
    for ch in joined.chars() {
        if let Some(&id) = vocab.get(&ch) {
            ids.push(id);
        }
    }
    ids.push(10); // "…" end token
    ids.push(0); // trailing pad ($)
    ids
}

// ─────────────────────────────────────────────────────────────────────────────
// voices.npz loading
// ─────────────────────────────────────────────────────────────────────────────

/// Load one row of a voice embedding from voices.npz.
/// `ref_id = min(text_len, n_rows - 1)` — matches Python exactly.
fn load_voice(voices_path: &PathBuf, voice: &str, text_len: usize) -> Result<Vec<f32>, String> {
    let file =
        std::fs::File::open(voices_path).map_err(|e| format!("Cannot open voices.npz: {e}"))?;
    let mut archive = ZipArchive::new(file).map_err(|e| format!("zip error: {e}"))?;

    let entry_name = format!("{voice}.npy");
    let mut entry = archive
        .by_name(&entry_name)
        .map_err(|_| format!("Voice '{voice}' not in voices.npz"))?;

    let mut bytes = Vec::new();
    entry
        .read_to_end(&mut bytes)
        .map_err(|e| format!("Read error: {e}"))?;

    parse_npy_row_f32(&bytes, text_len)
}

/// Parse a 2-D float32 .npy buffer and return one row.
fn parse_npy_row_f32(data: &[u8], row_idx: usize) -> Result<Vec<f32>, String> {
    if data.len() < 10 || &data[0..6] != b"\x93NUMPY" {
        return Err("Not a valid .npy file".into());
    }
    let major = data[6];
    let (header_len, data_offset) = if major == 1 {
        (u16::from_le_bytes([data[8], data[9]]) as usize, 10usize)
    } else {
        (
            u32::from_le_bytes([data[8], data[9], data[10], data[11]]) as usize,
            12usize,
        )
    };
    let header = std::str::from_utf8(&data[data_offset..data_offset + header_len])
        .map_err(|_| "Invalid NPY header")?;

    let shape = parse_shape(header)?;
    if shape.len() != 2 {
        return Err(format!("Expected 2D, got {}D", shape.len()));
    }
    let (n_rows, n_cols) = (shape[0], shape[1]);
    let row = row_idx.min(n_rows.saturating_sub(1));

    let raw = &data[data_offset + header_len..];
    let byte_off = row * n_cols * 4;
    if raw.len() < byte_off + n_cols * 4 {
        return Err("NPY data truncated".into());
    }
    let floats = raw[byte_off..byte_off + n_cols * 4]
        .chunks_exact(4)
        .map(|b| f32::from_le_bytes([b[0], b[1], b[2], b[3]]))
        .collect();
    Ok(floats)
}

fn parse_shape(header: &str) -> Result<Vec<usize>, String> {
    let start = header.find("'shape':").ok_or("No 'shape' in NPY header")?;
    let rest = &header[start + 8..];
    let l = rest.find('(').ok_or("No '(' in shape")?;
    let r = rest.find(')').ok_or("No ')' in shape")?;
    let dims = rest[l + 1..r]
        .split(',')
        .filter_map(|s| s.trim().parse::<usize>().ok())
        .collect();
    Ok(dims)
}

// ─────────────────────────────────────────────────────────────────────────────
// Text chunking
// ─────────────────────────────────────────────────────────────────────────────

fn ensure_punct(s: &str) -> String {
    let s = s.trim();
    match s.chars().last() {
        Some(c) if matches!(c, '.' | '!' | '?' | ',' | ';' | ':') => s.to_string(),
        _ => format!("{s},"),
    }
}

fn chunk_text(text: &str) -> Vec<String> {
    const MAX: usize = 400;
    let mut chunks = Vec::new();
    let mut cur = String::new();

    for ch in text.chars() {
        cur.push(ch);
        let end = matches!(ch, '.' | '!' | '?') || cur.len() >= MAX;
        if end {
            let t = cur.trim().to_string();
            if !t.is_empty() {
                chunks.push(ensure_punct(&t));
            }
            cur.clear();
        }
    }
    let t = cur.trim().to_string();
    if !t.is_empty() {
        chunks.push(ensure_punct(&t));
    }
    if chunks.is_empty() && !text.trim().is_empty() {
        chunks.push(ensure_punct(text.trim()));
    }
    chunks
}

// ─────────────────────────────────────────────────────────────────────────────
// WAV encoding
// ─────────────────────────────────────────────────────────────────────────────

fn encode_wav(samples: &[f32]) -> Result<Vec<u8>, String> {
    let spec = WavSpec {
        channels: 1,
        sample_rate: SAMPLE_RATE,
        bits_per_sample: 16,
        sample_format: SampleFormat::Int,
    };
    let mut buf = Vec::new();
    let cursor = Cursor::new(&mut buf);
    let mut writer = WavWriter::new(cursor, spec).map_err(|e| format!("WAV writer: {e}"))?;
    for &s in samples {
        let clamped = s.clamp(-1.0, 1.0);
        let pcm: i16 = if clamped < 0.0 {
            (clamped * 32768.0) as i16
        } else {
            (clamped * 32767.0) as i16
        };
        writer
            .write_sample(pcm)
            .map_err(|e| format!("WAV write: {e}"))?;
    }
    writer
        .finalize()
        .map_err(|e| format!("WAV finalize: {e}"))?;
    Ok(buf)
}

// ─────────────────────────────────────────────────────────────────────────────
// TtsEngine
// ─────────────────────────────────────────────────────────────────────────────

pub struct TtsEngine {
    session: Session,
    vocab: HashMap<char, i64>,
    voices_path: PathBuf,
}

impl TtsEngine {
    pub fn new(model_path: &PathBuf, voices_path: &PathBuf) -> Result<Self, String> {
        let session = Session::builder()
            .map_err(|e| format!("ORT builder: {e}"))?
            .with_optimization_level(GraphOptimizationLevel::Level1)
            .map_err(|e| format!("ORT opt: {e}"))?
            .with_intra_threads(4)
            .map_err(|e| format!("ORT threads: {e}"))?
            .commit_from_file(model_path)
            .map_err(|e| format!("ORT load model: {e}"))?;

        Ok(TtsEngine {
            session,
            vocab: build_vocab(),
            voices_path: voices_path.clone(),
        })
    }

    pub fn generate(
        &mut self,
        text: &str,
        voice_name: &str,
        speed: f32,
    ) -> Result<Vec<u8>, String> {
        let voice_key = resolve_voice(voice_name);
        let eff_speed = speed * speed_prior(voice_key);

        let mut all_samples = Vec::<f32>::new();
        for chunk in chunk_text(text) {
            let samples = self.generate_chunk(&chunk, voice_key, eff_speed)?;
            all_samples.extend_from_slice(&samples);
        }

        encode_wav(&all_samples)
    }

    fn generate_chunk(
        &mut self,
        text: &str,
        voice_key: &str,
        speed: f32,
    ) -> Result<Vec<f32>, String> {
        // 1. Phonemize
        let phonemes = phonemize(text)?;

        // 2. Tokenize
        let ids = tokenize(&phonemes, &self.vocab);
        let seq_len = ids.len();

        // 3. Voice embedding
        let ref_id = text.len();
        let style_vec = load_voice(&self.voices_path, voice_key, ref_id)?;
        let style_dim = style_vec.len();

        // 4. Build Tensor values from ndarray
        let input_ids_arr = Array2::from_shape_vec((1, seq_len), ids)
            .map_err(|e| format!("input_ids shape: {e}"))?;
        let style_arr = Array2::from_shape_vec((1, style_dim), style_vec)
            .map_err(|e| format!("style shape: {e}"))?;
        let speed_arr = Array1::from_vec(vec![speed]);

        let t_input_ids =
            Tensor::from_array(input_ids_arr).map_err(|e| format!("input_ids tensor: {e}"))?;
        let t_style = Tensor::from_array(style_arr).map_err(|e| format!("style tensor: {e}"))?;
        let t_speed = Tensor::from_array(speed_arr).map_err(|e| format!("speed tensor: {e}"))?;

        // 5. Run inference — ort::inputs! returns Vec in rc.10
        let outputs = self
            .session
            .run(ort::inputs![
                "input_ids" => t_input_ids,
                "style"     => t_style,
                "speed"     => t_speed
            ])
            .map_err(|e| format!("inference: {e}"))?;

        // 6. Extract waveform
        let waveform = outputs["waveform"]
            .try_extract_array::<f32>()
            .map_err(|e| format!("extract waveform: {e}"))?;

        let flat: Vec<f32> = waveform.iter().copied().collect();

        // 7. Trim last 5000 samples (Python: audio[..., :-5000])
        let trimmed = if flat.len() > TRIM_SAMPLES {
            flat[..flat.len() - TRIM_SAMPLES].to_vec()
        } else {
            flat
        };

        Ok(trimmed)
    }
}
