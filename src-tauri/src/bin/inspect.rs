// Model inspector binary — for development use.
// Run with: cargo run --bin inspect (from src-tauri directory)
// Requires ORT_DYLIB_PATH to point to the correct onnxruntime.dll.

use ort::session::Session;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Set ORT dylib path if not already set
    if std::env::var("ORT_DYLIB_PATH").is_err() {
        let dll = std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("onnxruntime.dll");
        if dll.exists() {
            std::env::set_var("ORT_DYLIB_PATH", dll);
        }
    }

    let session = Session::builder()?.commit_from_file("../models/kitten_tts_nano_v0_8.onnx")?;

    println!("=== MODEL INPUTS ===");
    for (i, input) in session.inputs.iter().enumerate() {
        println!("[{i}] name: {:?}  type: {:?}", input.name, input.input_type);
    }

    println!("\n=== MODEL OUTPUTS ===");
    for (i, output) in session.outputs.iter().enumerate() {
        println!(
            "[{i}] name: {:?}  type: {:?}",
            output.name, output.output_type
        );
    }

    Ok(())
}
