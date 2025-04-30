export function makeMenuItems(edit: () => void, del: () => void) {
    return [
        { label: '수정', action: edit },
        { label: '삭제', action: del },
    ];
}
