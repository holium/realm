import { MouseState } from '@holium/realm-presences';

const isTextElement = (element: Element): boolean =>
  element instanceof HTMLTextAreaElement ||
  (element instanceof HTMLInputElement &&
    element.type !== 'checkbox' &&
    element.type !== 'radio') ||
  element.classList.contains('text-cursor');

const isResizeHandler = (element: Element): boolean =>
  element.classList.contains('app-window-resize');

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
    if (isTextElement(element)) {
      return 'text';
    } else if (isResizeHandler(element)) {
      return 'resize';
    } else if (isClickableElement(element)) {
      return 'pointer'; // TODO: Make active on hover.
    }
  }

  return 'pointer';
};
