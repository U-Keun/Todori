export interface Task {
    id: string;
    title: string;
    completed: boolean;
    isExpanded: boolean;
    children: Task[];
}
