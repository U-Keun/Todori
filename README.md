# 📝 MyTodoApp

A desktop To-Do list application built with Tauri, Svelte, and Rust for fast, local file–based task management.

---

## 📖 Project Overview
- **Goal**: Provide a simple yet powerful task manager with support for sub-tasks and progress tracking, all stored locally.
- **Motivation**: A slim alternative to VSCode or Obsidian for quick note-taking and daily task organization.
- **Core Functionality**
  - Create, read, update, and delete tasks
  - Nested sub-items (sub-tasks)
  - Timestamped completion records
  - Drag-and-drop reordering
  - Save/load data as JSON or Markdown

---

## 🚀 Tech Stack
- **Frontend**: <img src="https://img.shields.io/badge/Svelte-FF3E00?style=flat-square&logo=Svelte&logoColor=white"/>, TailwindCSS
- **Backend**: <img src="https://img.shields.io/badge/Rust-000000?style=flat-square&logo=Rust&logoColor=white"/> (Tauri commands)
- **Build & Packaging**: Vite, <img src="https://img.shields.io/badge/Tauri-24C8D8?style=flat&logo=Tauri&logoColor=white"/>
- **Version Control**: <img src="https://img.shields.io/badge/Git-F05032?style=flat-square&logo=git&logoColor=white"/>, GitHub
- **Distribution**: Windows, macOS, and <img src="https://img.shields.io/badge/Vim-019733?style=flat-square&logo=Vim&logoColor=white"/> binaries via Tauri

---

## ⚙️ Installation & Usage
1. **Clone the repo**
   ```bash
   git clone https://github.com/your-username/my-todo-app.git
   cd my-todo-app
   ```

2. Install dependencies
    ```bash
    npm install   # or pnpm install
    ```
3. Run in development mode
    ```bash
    npm run tauri dev
    ```
4. Build for release
    ```bash
    npm run tauri build
    ```

💡 Quick Start
1. Launch the app to view your current task list.

2. Click “Add Task” in the toolbar to create a new item.

3. Use the ▶ icon next to any task to add sub-tasks.

4. Check the box to mark complete and record the timestamp.

5. Drag tasks up or down to reorder.

🤝 Contributing
1. Create a feature branch: feature/your-feature-name or bugfix branch: fix/your-fix-name

2. Follow Conventional Commits for commit messages:
    ```sql
    Feat: add drag-and-drop reordering
    Fix: correct timestamp formatting
    Docs: update README installation instructions
    ```

3. Open a Pull Request with a summary of your changes and any screenshots or examples.


