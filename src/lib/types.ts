export interface Task {
    id: string;
    title: string;
    completed: boolean;
    children: Task[];

    isExpanded?: boolean;
    isMemoOpen?: boolean;
}

export interface PageData {
    parentTitle: string;
    children: Task[];
}
