import { ipcRenderer } from 'electron';
import { MouseState } from '../../../../lib/mouse/src/components/AnimatedCursor';

const getMouseState = (e: MouseEvent): MouseState => {
  const element = document.elementFromPoint(e.x, e.y);
  if (element) {
    const isFocusableElement =
      element instanceof HTMLInputElement ||
      element instanceof HTMLTextAreaElement;

    const isResizeHandler =
      element.classList.contains('app-window-resize') ||
      element.classList.contains('app-window-resize-br') ||
      element.classList.contains('app-window-resize-lr');

    const isClickable =
      element instanceof HTMLElement ||
      element instanceof HTMLSelectElement ||
      element instanceof HTMLButtonElement ||
      element.classList.contains('link') ||
      element.classList.contains('app-dock-icon') ||
      element.classList.contains('realm-cursor-hover');

    if (isFocusableElement) {
      return 'text';
    } else if (isResizeHandler) {
      return 'resize';
    } else if (isClickable) {
      return 'pointer'; // TODO: Make active on hover.
    }
  }

  return 'pointer';
};

ipcRenderer.on('add-mouse-listeners', (_, { isInWebview = false }) => {
  const handleMousemove = (e: MouseEvent) => {
    const mouseState = getMouseState(e);
    const position = {
      x: e.x,
      y: e.y,
    };

    ipcRenderer.invoke('mouse-move', position, mouseState, isInWebview);
  };

  const handleMousedown = () => {
    ipcRenderer.invoke('mouse-down');
  };

  const handleMouseup = () => {
    ipcRenderer.invoke('mouse-up');
  };

  window.addEventListener('mousemove', handleMousemove);
  window.addEventListener('mousedown', handleMousedown);
  window.addEventListener('mouseup', handleMouseup);
});
