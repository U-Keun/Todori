export interface TapHoldOptions {
    duration?: number;
}

export function tapHold(node: HTMLElement, options: TapHoldOptions = {})
    : { destroy(): void } {
    const { duration = 500 } = options;
    let timer: ReturnType<typeof setTimeout>;
    let holdFired = false;

    function handleDown(event: PointerEvent) {
        holdFired = false;
        timer = setTimeout(() => {
            node.dispatchEvent(new CustomEvent('hold', { detail: event }));
            holdFired = true;
        }, duration);
    }

    function handleUp(event: PointerEvent) {
        clearTimeout(timer);
        if (holdFired) {
            event.preventDefault();
            event.stopImmediatePropagation();
        } else {
            node.dispatchEvent(new CustomEvent('tap', { detail: event }));
        }
    }

    function handleLeave() {
        clearTimeout(timer);
    }

    node.addEventListener('pointerdown', handleDown);
    node.addEventListener('pointerup', handleUp);
    node.addEventListener('pointerleave', handleLeave);

    return {
        destroy() {
            clearTimeout(timer);
            node.removeEventListener('pointerdown', handleDown);
            node.removeEventListener('pointerup', handleUp);
            node.removeEventListener('pointerleave', handleLeave);
        }
    };
}
