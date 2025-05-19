use serde::{ Deserialize, Serialize };
use std::{fs, path::PathBuf, io::{Error as IoError, ErrorKind}};
use std::collections::HashMap;
use tauri::State;

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Task {
    pub id: String,
    pub title: String,
    pub completed: bool,
    pub children: Vec<Task>,   
    #[serde(default)]
    pub order: usize,
}

#[derive(Default)]
pub struct TaskPath(pub PathBuf);

impl TaskPath {
    fn read_all(&self) -> tauri::Result<Vec<Task>> {
        if self.0.exists() {
            let s = fs::read_to_string(&self.0)?;
            let mut tasks: Vec<Task> = serde_json::from_str(&s)?;
            tasks.sort_by_key(|t| t.order);
            fn sort_rec(tasks: &mut [Task]) {
                for t in tasks.iter_mut() {
                    t.children.sort_by_key(|c| c.order);
                    sort_rec(&mut t.children);
                }
            }
            sort_rec(&mut tasks);
            Ok(tasks)
        } else {
            Ok(Vec::new())
        }
    }

    fn write_all(&self, tasks: &Vec<Task>) -> tauri::Result<()> {
        if let Some(parent) = self.0.parent() {
            fs::create_dir_all(parent)?;
        }

        let mut tasks_to_write = tasks.clone();
        fn assign_order(tasks: &mut [Task]) {
            for (idx, t) in tasks.iter_mut().enumerate() {
                t.order = idx;
                assign_order(&mut t.children);
            }
        }
        assign_order(&mut tasks_to_write);

        let json = serde_json::to_string_pretty(&tasks_to_write)?;
        fs::write(&self.0, json)?;
        Ok(())
    }
}

#[tauri::command]
pub fn load_root_tasks(path: State<TaskPath>) -> tauri::Result<Vec<Task>> {
    path.read_all()
}

fn find_by_id(tasks: &[Task], id: &str) -> Option<Task> {
    for t in tasks {
        if t.id == id {
            return Some(t.clone());
        }
        if let Some(found) = find_by_id(&t.children, id) {
            return Some(found);
        }
    }
    None
}

#[tauri::command]
pub fn get_task(path: State<TaskPath>, id: String) -> tauri::Result<Task> {
    let all = path.read_all()?;
    let task = find_by_id(&all, &id)
        .ok_or_else(|| tauri::Error::Io(IoError::new(
            ErrorKind::NotFound,
            format!("Task with id {} not found", id),
        )))?;
    Ok(task)
}

#[tauri::command]
pub fn load_subtasks(path: State<TaskPath>, parent_id: String) -> tauri::Result<Vec<Task>> {
    let parent = get_task(path, parent_id)?;
    Ok(parent.children)
}

#[tauri::command]
pub fn add_task(
    path: State<TaskPath>,
    title: String,
    parent_id: Option<String>,
    ) -> tauri::Result<Task> {
    let mut all = path.read_all()?;
    let new_task = Task {
        id: uuid::Uuid::new_v4().to_string(),
        title: title.clone(),
        completed: false,
        children: Vec::new(),
        order: 0,
    };
    if let Some(pid) = parent_id {
        fn insert(tasks: &mut Vec<Task>, pid: &str, child: Task) -> bool {
            for t in tasks.iter_mut() {
                if t.id == pid {
                    t.children.push(child);
                    return true;
                }
                if insert(&mut t.children, pid, child.clone()) {
                    return true;
                }
            }
            false
        }
        insert(&mut all, &pid, new_task.clone());
    } else {
        all.push(new_task.clone());
    }
    path.write_all(&all)?;
    Ok(new_task)
}

#[tauri::command]
pub fn update_task(path: State<TaskPath>, id: String, new_title: String) -> tauri::Result<Task> {
    let mut all = path.read_all()?;
    fn update(tasks: &mut [Task], id: &str, title: &str) -> Option<Task> {
        for t in tasks.iter_mut() {
            if t.id == id {
                t.title = title.to_string();
                return Some(t.clone());
            }
            if let Some(found) = update(&mut t.children, id, title) {
                return Some(found);
            }
        }
        None
    }
    let updated = update(&mut all, &id, &new_title)
        .ok_or_else(|| tauri::Error::Io(IoError::new(ErrorKind::NotFound, "Not found")))?;
    path.write_all(&all)?;
    Ok(updated)
}

#[tauri::command]
pub fn toggle_complete(path: State<TaskPath>, id: String) -> tauri::Result<Task> {
    let mut all = path.read_all()?;
    fn toggle(tasks: &mut [Task], id: &str) -> Option<Task> {
        for t in tasks.iter_mut() {
            if t.id == id {
                t.completed = !t.completed;
                return Some(t.clone());
            }
            if let Some(found) = toggle(&mut t.children, id) {
                return Some(found);
            }
        }
        None
    }
    let updated = toggle(&mut all, &id)
        .ok_or_else(|| tauri::Error::Io(IoError::new(ErrorKind::NotFound, "Not found")))?;
    path.write_all(&all)?;
    Ok(updated)
}

#[tauri::command]
pub fn remove_task(path: State<TaskPath>, id: String) -> tauri::Result<()> {
    let mut all = path.read_all()?;
    fn remove(tasks: &mut Vec<Task>, id: &str) {
        tasks.retain(|t| t.id != id);
        for t in tasks.iter_mut() {
            remove(&mut t.children, id);
        }
    }
    remove(&mut all, &id);
    path.write_all(&all)
}

#[tauri::command]
pub fn move_task(
    path: State<TaskPath>,
    id: String,
    new_parent_id: Option<String>,
    ) -> tauri::Result<()> {
    let mut all = path.read_all()?;
    fn extract(tasks: &mut Vec<Task>, id: &str) -> Option<Task> {
        if let Some(pos) = tasks.iter().position(|t| t.id == id) {
            return Some(tasks.remove(pos));
        }
        for t in tasks.iter_mut() {
            if let Some(found) = extract(&mut t.children, id) {
                return Some(found);
            }
        }
        None
    }
    if let Some(task) = extract(&mut all, &id) {
        if let Some(pid) = new_parent_id {
            fn insert(tasks: &mut [Task], pid: &str, child: Task) -> bool {
                for t in tasks.iter_mut() {
                    if t.id == pid {
                        t.children.push(child);
                        return true;
                    }
                    if insert(&mut t.children, pid, child.clone()) {
                        return true;
                    }
                }
                false
            }
            insert(&mut all, &pid, task);
        } else {
            all.push(task);
        }
    }
    path.write_all(&all)
}

#[tauri::command]
pub fn reorder_children(
    path: State<TaskPath>,
    parent_id: Option<String>,
    new_order: Vec<String>,
) -> tauri::Result<()> {
    let mut all = path.read_all()?;
    fn reorder(tasks: &mut Vec<Task>, order: &[String]) {
        let mut map: HashMap<String, Task>= tasks
            .drain(..)
            .map(|t| (t.id.clone(), t))
            .collect();
        for id in order {
            if let Some(t) = map.remove(id) {
                tasks.push(t);
            }
        }
        for (_, t) in map {
            tasks.push(t);
        }
    }
    if let Some(ref pid) = parent_id {
        fn find(tasks: &mut [Task], pid: &str, order: &[String]) {
            for task in tasks.iter_mut() {
                if task.id == pid {
                    reorder(&mut task.children, order);
                    return;
                }
                find(&mut task.children, pid, order);
            }
        }
        find(&mut all, pid, &new_order);
    } else {
        reorder(&mut all, &new_order);
    }
    path.write_all(&all)
}
