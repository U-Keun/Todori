export interface Task {
    id: string;
    title: string;
    completed: boolean;
    children: Task[];
}

export interface PageData {
    parentTitle: string;
    children: Task[];
}
