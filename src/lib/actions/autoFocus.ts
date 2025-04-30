export function autoFocus(node: HTMLElement) {
    requestAnimationFrame(() => {
        node.focus();
    });
    return {
        destroy() {}
    };
}
