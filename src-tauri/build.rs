use std::{ env, fs, path::PathBuf, };

fn main() {
    let out_dir = PathBuf::from(env::var_os("OUT_DIR").unwrap());

    let manifest_dir = PathBuf::from(env::var_os("CARGO_MANIFEST_DIR").unwrap());

    let src_conf = manifest_dir.join("tauri.conf.json");
    let dst_conf = out_dir.join("tauri.conf.json");
    fs::create_dir_all(&out_dir).unwrap();
    fs::copy(&src_conf, &dst_conf)
        .expect("failed to copy tauri.conf.json into OUT_DIR");

    env::set_current_dir(&out_dir).unwrap();

    tauri_build::build()
}
