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
- **Frontend**: <img src="https://img.shields.io/badge/Svelte-FF3E00?style=flat-square&logo=Svelte&logoColor=white"/>, <img src="https://img.shields.io/badge/tailwind%20css-%2338B2AC.svg?&style=flat-square&logo=tailwind%20css&logoColor=white" />
- **Backend**: <img src="https://img.shields.io/badge/Rust-000000?style=flat-square&logo=Rust&logoColor=white"/> (Tauri commands)
- **Build & Packaging**: Vite, <img src="https://img.shields.io/badge/Tauri-24C8D8?style=flat&logo=Tauri&logoColor=white"/>
- **Version Control**: <img src="https://img.shields.io/badge/Git-F05032?style=flat-square&logo=git&logoColor=white"/>, <img src="https://img.shields.io/badge/github-%23181717.svg?&style=flat-square&logo=github&logoColor=white" />
- **Distribution**: <img src="https://img.shields.io/badge/windows-%230078D6.svg?&style=flat-square&logo=windows&logoColor=white" />, <img src="https://img.shields.io/badge/macos-%23000000.svg?&style=flat-square&logo=macos&logoColor=white" />, and <img src="https://img.shields.io/badge/linux-%23FCC624.svg?&style=flat-square&logo=linux&logoColor=black" /> binaries via Tauri

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


