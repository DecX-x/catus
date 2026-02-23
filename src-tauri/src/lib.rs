use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::sync::{Mutex, OnceLock};
use tauri::Manager;

mod tts;
use tts::{TtsEngine, AVAILABLE_VOICES};

// ─────────────────────────────────────────────────────────────────────────────
// Global TTS engine (lazy-initialized, protected by Mutex)
// ─────────────────────────────────────────────────────────────────────────────

static TTS_ENGINE: OnceLock<Mutex<TtsEngine>> = OnceLock::new();

fn get_engine() -> Result<&'static Mutex<TtsEngine>, String> {
    TTS_ENGINE
        .get()
        .ok_or_else(|| "TTS engine not initialized".to_string())
}

// ─────────────────────────────────────────────────────────────────────────────
// Tauri Commands
// ─────────────────────────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize)]
pub struct GenerateResult {
    /// Base64-encoded WAV audio data
    pub audio_base64: String,
    /// Duration in seconds
    pub duration_secs: f64,
}

/// Generate speech from text. Returns base64-encoded WAV audio.
#[tauri::command]
fn generate_speech(text: String, voice: String, speed: f32) -> Result<GenerateResult, String> {
    let engine = get_engine()?;
    let mut lock = engine
        .lock()
        .map_err(|e| format!("Engine lock error: {e}"))?;

    let wav_bytes = lock.generate(&text, &voice, speed)?;

    // Calculate duration from WAV bytes (44-byte header, 16-bit mono 24kHz)
    let num_samples = wav_bytes.len().saturating_sub(44) / 2;
    let duration_secs = num_samples as f64 / 24000.0;

    let audio_base64 = base64_encode(&wav_bytes);

    Ok(GenerateResult {
        audio_base64,
        duration_secs,
    })
}

/// Get list of available voice names.
#[tauri::command]
fn get_voices() -> Vec<String> {
    AVAILABLE_VOICES.iter().map(|s| s.to_string()).collect()
}

/// Save audio (base64 WAV) to a file path.
#[tauri::command]
fn save_audio(audio_base64: String, output_path: String) -> Result<(), String> {
    let wav_bytes = base64_decode(&audio_base64)?;
    std::fs::write(&output_path, &wav_bytes).map_err(|e| format!("Failed to write file: {e}"))?;
    Ok(())
}

/// Initialize the TTS engine. Call this on app startup.
#[tauri::command]
fn init_tts(app: tauri::AppHandle) -> Result<String, String> {
    if TTS_ENGINE.get().is_some() {
        return Ok("already_initialized".to_string());
    }

    let resource_dir = app
        .path()
        .resource_dir()
        .map_err(|e| format!("Resource dir error: {e}"))?;

    // Exe directory — models are bundled here in production
    let exe_dir = std::env::current_exe()
        .ok()
        .and_then(|p| p.parent().map(|d| d.to_path_buf()))
        .unwrap_or_default();

    // Try several paths (production bundled first, then dev fallbacks)
    let candidates = [
        resource_dir.join("models"), // Tauri bundled resource dir
        exe_dir.join("models"),      // next to exe (production install)
        PathBuf::from("../models"),  // dev: relative to src-tauri/
        PathBuf::from("models"),     // dev: cwd
    ];

    let models_dir = candidates
        .iter()
        .find(|p| p.join("kitten_tts_nano_v0_8.onnx").exists())
        .cloned()
        .ok_or_else(|| {
            format!(
                "Models directory not found. Tried: {}",
                candidates
                    .iter()
                    .map(|p| p.display().to_string())
                    .collect::<Vec<_>>()
                    .join(", ")
            )
        })?;

    let model_path = models_dir.join("kitten_tts_nano_v0_8.onnx");
    let voices_path = models_dir.join("voices.npz");

    if !voices_path.exists() {
        return Err(format!(
            "voices.npz not found at: {}",
            voices_path.display()
        ));
    }

    let engine = TtsEngine::new(&model_path, &voices_path)?;

    TTS_ENGINE
        .set(Mutex::new(engine))
        .map_err(|_| "Engine already set".to_string())?;

    Ok("initialized".to_string())
}

// ─────────────────────────────────────────────────────────────────────────────
// Base64 helpers (no external dep, simple implementation)
// ─────────────────────────────────────────────────────────────────────────────

const B64_CHARS: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

fn base64_encode(data: &[u8]) -> String {
    let mut out = String::with_capacity((data.len() + 2) / 3 * 4);
    for chunk in data.chunks(3) {
        let b0 = chunk[0] as usize;
        let b1 = if chunk.len() > 1 {
            chunk[1] as usize
        } else {
            0
        };
        let b2 = if chunk.len() > 2 {
            chunk[2] as usize
        } else {
            0
        };
        out.push(B64_CHARS[b0 >> 2] as char);
        out.push(B64_CHARS[((b0 & 3) << 4) | (b1 >> 4)] as char);
        out.push(if chunk.len() > 1 {
            B64_CHARS[((b1 & 0xf) << 2) | (b2 >> 6)] as char
        } else {
            '='
        });
        out.push(if chunk.len() > 2 {
            B64_CHARS[b2 & 0x3f] as char
        } else {
            '='
        });
    }
    out
}

fn base64_decode(s: &str) -> Result<Vec<u8>, String> {
    let decode_char = |c: char| -> Result<u8, String> {
        match c {
            'A'..='Z' => Ok(c as u8 - b'A'),
            'a'..='z' => Ok(c as u8 - b'a' + 26),
            '0'..='9' => Ok(c as u8 - b'0' + 52),
            '+' => Ok(62),
            '/' => Ok(63),
            '=' => Ok(0),
            _ => Err(format!("Invalid base64 char: {c}")),
        }
    };

    let chars: Vec<char> = s.chars().filter(|c| !c.is_whitespace()).collect();
    let mut out = Vec::with_capacity(chars.len() / 4 * 3);

    for chunk in chars.chunks(4) {
        if chunk.len() < 4 {
            break;
        }
        let a = decode_char(chunk[0])?;
        let b_val = decode_char(chunk[1])?;
        let c_val = decode_char(chunk[2])?;
        let d = decode_char(chunk[3])?;
        out.push((a << 2) | (b_val >> 4));
        if chunk[2] != '=' {
            out.push((b_val << 4) | (c_val >> 2));
        }
        if chunk[3] != '=' {
            out.push((c_val << 6) | d);
        }
    }
    Ok(out)
}

// ─────────────────────────────────────────────────────────────────────────────
// Tauri App Entry Point
// ─────────────────────────────────────────────────────────────────────────────

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Resolve onnxruntime.dll path — works both in dev and production:
    //   dev:        src-tauri/onnxruntime.dll  (CARGO_MANIFEST_DIR)
    //   production: <exe-dir>/onnxruntime.dll  (bundled resource next to exe)
    let ort_dll = std::env::current_exe()
        .ok()
        .and_then(|p| p.parent().map(|d| d.join("onnxruntime.dll")))
        .filter(|p| p.exists())
        .unwrap_or_else(|| PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("onnxruntime.dll"));

    if ort_dll.exists() {
        std::env::set_var("ORT_DYLIB_PATH", ort_dll.to_str().unwrap());
    }

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            generate_speech,
            get_voices,
            save_audio,
            init_tts,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
