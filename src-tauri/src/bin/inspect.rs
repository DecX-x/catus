use ort::session::Session;

fn main() {
    let session = Session::builder()
        .unwrap()
        .commit_from_file("../models/kitten_tts_nano_v0_8.onnx")
        .unwrap();

    println!("=== MODEL INPUTS ===");
    for (i, input) in session.inputs().iter().enumerate() {
        println!(
            "[{}] name: {:?}  type: {:?}",
            i,
            input.name(),
            input.input_type()
        );
    }

    println!("\n=== MODEL OUTPUTS ===");
    for (i, output) in session.outputs().iter().enumerate() {
        println!(
            "[{}] name: {:?}  type: {:?}",
            i,
            output.name(),
            output.output_type()
        );
    }
}
