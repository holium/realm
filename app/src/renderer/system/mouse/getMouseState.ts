import { MouseState } from './AnimatedCursor';

const isFocusableElement = (element: Element): boolean =>
  element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement;

const isResizeHandler = (element: Element): boolean =>
  element.classList.contains('app-window-resize') ||
  element.classList.contains('app-window-resize-br') ||
  element.classList.contains('app-window-resize-lr');

const isClickableElement = (element: Element): boolean =>
  element instanceof HTMLElement ||
  element instanceof HTMLSelectElement ||
  element instanceof HTMLButtonElement ||
  element.classList.contains('link') ||
  element.classList.contains('app-dock-icon') ||
  element.classList.contains('realm-cursor-hover');

export const getMouseState = (e: MouseEvent): MouseState => {
  const element = document.elementFromPoint(e.x, e.y);
  if (element) {
    if (isFocusableElement(element)) {
      return 'text';
    } else if (isResizeHandler(element)) {
      return 'resize';
    } else if (isClickableElement(element)) {
      return 'pointer'; // TODO: Make active on hover.
    }
  }

  return 'pointer';
};
