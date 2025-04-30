// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use serde::{ Deserialize, Serialize };
use std::{ fs, path::PathBuf };
use tauri::{ State, Manager };

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
struct Todo {
    id: String,
    text: String,
    done: bool,
    order: u32,
    sub_todos: Option<Vec<SubTodo>>,
}

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
struct SubTodo {
    id: String,
    text: String,
    done: bool,
}

#[derive(Default)]
struct TodoPath(PathBuf);

#[tauri::command]
fn save_todos(path: State<TodoPath>, items: Vec<Todo>) -> tauri::Result<()> {
    if let Some(parent) = path.0.parent() {
        fs::create_dir_all(parent)?;
    }

    fs::write(&path.0, serde_json::to_string_pretty(&items)?)?;
    Ok(())
}

#[tauri::command]
fn load_todos(path: State<TodoPath>) -> tauri::Result<Vec<Todo>> {
    if path.0.exists() {
        Ok(serde_json::from_str(&fs::read_to_string(&path.0)?)?)
    } else {
        Ok(Vec::new())
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let data_path = app
                .path()
                .app_local_data_dir()
                .expect("failed to resolve local data dir")
                .join("todos.json");

            app.manage(TodoPath(data_path));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![save_todos, load_todos])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
