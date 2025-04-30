export function clickOutside(node: HTMLElement) {
    const handleClick = (event: MouseEvent) => {
        if (!node.contains(event.target as Node)) {
            console.log('outclick fired');
            node.dispatchEvent(new CustomEvent('outclick'));
        }
    };

    document.addEventListener("click", handleClick, true);

    return {
        detroy() {
            document.removeEventListener("click", handleClick, true);
        }
    };
}
