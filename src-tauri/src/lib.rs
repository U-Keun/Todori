// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
mod commands;
use commands::*;
use tauri::{ Manager };

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let data_path = app
                .path()
                .app_local_data_dir()
                .expect("failed to resolve local data dir")
                .join("tasks.json");

            app.manage(TaskPath(data_path));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            load_root_tasks,
            load_subtasks,
            add_task,
            update_task,
            toggle_complete,
            remove_task,
            move_task,
            reorder_children,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
