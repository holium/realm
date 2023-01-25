import { ipcRenderer } from 'electron';

const getMouseType = (e: MouseEvent) => {
  const element = document.elementFromPoint(e.x, e.y);
  if (element) {
    const isFocusableElement =
      element instanceof HTMLInputElement ||
      element instanceof HTMLTextAreaElement;

    if (isFocusableElement) {
      return 'text';
    }
  }
  return 'pointer';
};

ipcRenderer.on('add-mouse-listeners', (_, { isInWebview = false }) => {
  const handleMousemove = (e: MouseEvent) => {
    const mouseType = getMouseType(e);
    const position = {
      x: e.x,
      y: e.y,
    };

    ipcRenderer.invoke('mouse-move', position, mouseType, isInWebview);
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

// Listen for mouse states.
// const clickableEls = document.querySelectorAll(
//   [
//     'a',
//     'label[for]',
//     'select',
//     'textarea',
//     'button',
//     'li',
//     '.link',
//     '.app-dock-icon',
//     '.realm-cursor-hover',
//   ].join(',')
// ) as NodeListOf<HTMLElement>;

// const inputs = document.querySelectorAll(
//   [
//     'input[type="text"]',
//     'input[type="email"]',
//     'input[type="number"]',
//     'input[type="submit"]',
//     'input[type="image"]',
//     'input[type="password"]',
//     'input[type="date"]',
//     'input',
//     '.input-transparent',
//     '.ProseMirror',
//     ':scope > .cursor-text',
//     '.realm-cursor-text-cursor',
//   ].join(',')
// ) as NodeListOf<HTMLInputElement>;

// const resizeHandlers = document.querySelectorAll(
//   ['.app-window-resize', '.app-window-resize-br', '.app-window-resize-lr'].join(
//     ','
//   )
// ) as NodeListOf<HTMLElement>;

// resizeHandlers.forEach((resizer) => {
//   resizer.style.cursor = 'none';
//   resizer.addEventListener('mouseover', () => {
//     // setResizeCursor(true);
//   });
//   resizer.addEventListener('mouseout', () => {
//     // setResizeCursor(false);
//   });
//   resizer.addEventListener('mouseup', () => {
//     // setResizeCursor(false);
//   });
//   resizer.addEventListener('mousedown', () => {
//     // setResizeCursor(true);
//   });
// });

// inputs.forEach((input) => {
//   input.style.cursor = 'none';
//   input.addEventListener('mouseover', () => {
//     // setTextCursor(true);
//   });
//   input.addEventListener('blur', () => {
//     // setTextCursor(false);
//   });
//   input.addEventListener('mouseout', () => {
//     // setTextCursor(false);
//   });
//   input.addEventListener('blur', () => {
//     // setIsActive(false);
//   });
//   input.addEventListener('mousedown', () => {
//     // setTextCursor(true);
//   });
// });

// clickableEls.forEach((el) => {
//   el.style.cursor = 'none';
//   el.addEventListener('mouseover', () => {
//     // setIsActive(true);
//   });
//   el.addEventListener('click', (e) => {
//     if (!e?.isTrusted) return;
//     // setIsActive(true);
//     // setIsActiveClickable(false);
//   });
//   el.addEventListener('mousedown', () => {
//     // setIsActiveClickable(true);
//   });
//   el.addEventListener('blur', () => {
//     // setIsActive(false);
//   });
//   el.addEventListener('mouseout', () => {
//     // setIsActive(false);
//     // setIsActiveClickable(false);
//   });
// });
