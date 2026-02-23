# Catus

A fast, private, offline Text-to-Speech desktop app powered by [KittenTTS Nano](https://huggingface.co/KittenML/kitten-tts-nano-0.8-int8) — running entirely in Rust, no Python, no GPU, no cloud.

![Catus Screenshot](public/logo.png)

---

## What is Catus?

Catus is an open-source desktop TTS app built with **Tauri v2** (Rust backend) and **React 19 + TypeScript** (frontend). It runs the KittenTTS Nano 0.8 model locally on your CPU, producing high-quality speech audio without sending a single byte to the internet.

- **100% offline** — your text never leaves your machine
- **No Python runtime** — the entire inference pipeline is pure Rust
- **No GPU required** — CPU-only via ONNX Runtime
- **Lightweight** — ~25MB INT8 quantized ONNX model

---

## Model: KittenTTS Nano 0.8

Catus uses the **[kitten-tts-nano-0.8-int8](https://huggingface.co/KittenML/kitten-tts-nano-0.8-int8)** model by [KittenML](https://huggingface.co/KittenML).

- **Architecture:** StyleTTS 2
- **Parameters:** ~15 million
- **Format:** ONNX INT8 quantized (~24MB)
- **Output:** 24kHz mono WAV
- **License:** Apache 2.0

### Available Voices

| Name   | Gender |
|--------|--------|
| Jasper | Male   |
| Bella  | Female |
| Luna   | Female |
| Bruno  | Male   |
| Rosie  | Female |
| Hugo   | Male   |
| Kiki   | Female |
| Leo    | Male   |

---

## Features

- **Studio** — type or paste text, pick a voice, adjust speed, generate WAV audio with a waveform player
- **History** — all generations saved locally with search, playback, download, and delete
- **Settings** — set default voice and output directory
- **Waveform player** — 48-bar animated waveform with seek, play/pause, download
- **Speed control** — 0.5x to 2.0x
- **Stability Boost** — reduces artifacts in long-form text

---

## Tech Stack

| Layer     | Technology                                      |
|-----------|-------------------------------------------------|
| UI        | React 19, TypeScript, Tailwind CSS v3, Vite     |
| Desktop   | Tauri v2                                        |
| TTS engine | Rust, ONNX Runtime (`ort` crate), `ndarray`    |
| Audio     | Web Audio API (frontend), `hound` (WAV encoding)|
| Phonemizer | espeak-ng (subprocess)                         |
| Fonts     | Space Grotesk, Nunito, Material Symbols         |

---

## Prerequisites

- [Rust](https://rustup.rs/) (stable)
- [Node.js](https://nodejs.org/) 18+ and [pnpm](https://pnpm.io/)
- [Tauri v2 prerequisites](https://tauri.app/start/prerequisites/) for your OS
- **Windows:** [eSpeak NG](https://github.com/espeak-ng/espeak-ng/releases) installed at `C:\Program Files\eSpeak NG\`
- **Linux/macOS:** `espeak-ng` available on PATH

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/your-username/catus.git
cd catus/catus-desktop
```

### 2. Download the model files

Download from [KittenML/kitten-tts-nano-0.8-int8](https://huggingface.co/KittenML/kitten-tts-nano-0.8-int8) and place them in `catus-desktop/models/`:

```
models/
├── kitten_tts_nano_v0_8.onnx
├── voices.npz
└── config.json
```

### 3. Get the ONNX Runtime DLL (Windows)

Download `onnxruntime.dll` v1.22.x and place it at:

```
catus-desktop/src-tauri/onnxruntime.dll
```

Prebuilt binaries: https://github.com/microsoft/onnxruntime/releases/tag/v1.22.0

### 4. Install frontend dependencies

```bash
pnpm install
```

### 5. Run in development

```bash
# Windows (Command Prompt)
set ORT_DYLIB_PATH=<absolute-path-to>\catus-desktop\src-tauri\onnxruntime.dll
pnpm tauri dev

# Windows (PowerShell)
$env:ORT_DYLIB_PATH="<absolute-path-to>\catus-desktop\src-tauri\onnxruntime.dll"
pnpm tauri dev
```

### 6. Build for production

```bash
pnpm tauri build
```

The installer will be output to `src-tauri/target/release/bundle/`.

---

## Project Structure

```
catus-desktop/
├── public/
│   └── logo.png                  # App icon (orange cat)
├── src/
│   ├── App.tsx                   # Root component, settings state
│   ├── components/
│   │   └── Sidebar.tsx           # Navigation sidebar
│   └── pages/
│       ├── Studio.tsx            # Main TTS workspace
│       ├── History.tsx           # Generation history
│       └── Settings.tsx          # App settings
├── src-tauri/
│   ├── src/
│   │   ├── lib.rs                # Tauri commands: init_tts, generate_speech, get_voices, save_audio
│   │   ├── tts.rs                # Full TTS pipeline (phonemize → tokenize → ONNX → WAV)
│   │   └── main.rs
│   ├── onnxruntime.dll           # ORT 1.22.0 (not committed — download separately)
│   ├── Cargo.toml
│   └── tauri.conf.json
├── models/                       # Model files (not committed — download separately)
├── tailwind.config.js
└── package.json
```

---

## How the TTS Pipeline Works

```
Text input
    │
    ▼
espeak-ng subprocess  →  IPA phonemes
    │
    ▼
TextCleaner           →  token IDs  →  wrap with [0, ..., 10, 0]
    │
    ▼
voices.npz lookup     →  style vector (float32[1, style_dim])
    │
    ▼
ONNX Runtime (CPU)    →  waveform (float32, 24kHz)
    │
    ▼
trim last 5000 samples  →  encode WAV  →  base64 to frontend
    │
    ▼
Web Audio API         →  playback + waveform visualization
```

---

## Contributing

Contributions are very welcome! Catus is fully open source under the MIT License.

### Ways to contribute

- **Bug reports** — open an issue with steps to reproduce
- **New features** — open an issue first to discuss, then submit a PR
- **Linux / macOS support** — the Rust backend is mostly cross-platform; help with testing and espeak-ng path handling is appreciated
- **MP3 / OGG export** — currently WAV-only; encoding support would be great
- **Better phonemization** — replace espeak-ng subprocess with a native Rust phonemizer
- **UI improvements** — design tweaks, accessibility, dark mode
- **Documentation** — more detailed setup guides, especially for Linux/macOS

### Development workflow

1. Fork the repo and create a branch: `git checkout -b feat/your-feature`
2. Make your changes
3. Run `npx tsc --noEmit` to check TypeScript
4. Run `cargo check` inside `src-tauri/` to check Rust
5. Test with `pnpm tauri dev`
6. Open a pull request with a clear description of what and why

---

## License

This project is licensed under the **MIT License**.

The bundled model ([kitten-tts-nano-0.8-int8](https://huggingface.co/KittenML/kitten-tts-nano-0.8-int8)) is licensed under the **Apache 2.0 License** by [KittenML](https://huggingface.co/KittenML).

---

## Acknowledgements

- [KittenML](https://huggingface.co/KittenML) for the KittenTTS Nano model
- [StyleTTS 2](https://github.com/yl4579/StyleTTS2) — the architecture behind KittenTTS
- [ort](https://github.com/pykeio/ort) — Rust ONNX Runtime bindings
- [Tauri](https://tauri.app/) — the desktop framework
- [espeak-ng](https://github.com/espeak-ng/espeak-ng) — phonemization
