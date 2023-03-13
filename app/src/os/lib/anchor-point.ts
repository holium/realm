type MenuOrientation =
  | 'right'
  | 'left'
  | 'top'
  | 'top-left'
  | 'top-right'
  | 'bottom'
  | 'pointer'
  | 'bottom-left'
  | 'bottom-right';

export type { MenuOrientation };

export const calculateAnchorPoint = (
  event: PointerEvent,
  orientation: MenuOrientation,
  padding = 12,
  menuWidth: number,
  menuHeight?: number,
  position?: 'above' | 'below'
) => {
  let x: number;
  let y: number;
  if (event.target instanceof HTMLElement) {
    const clickX = event.x;
    const clickY = event.y;
    const offsetX = event.offsetX;
    const offsetY = event.offsetY;
    const targetElementHeight = event.target.clientHeight;

    // console.log(clickX, offsetX, event);
    switch (orientation) {
      case 'right':
        return {
          x: event.target.offsetLeft + event.clientX + padding,
          y: event.target.offsetTop,
        };
      case 'left':
        x = clickX - offsetX;
        y = clickY - offsetY;
        if (menuWidth) {
          x = x - menuWidth;
        }
        return {
          x: x - padding,
          y: y - padding,
        };
      case 'bottom-left':
        x = clickX - offsetX;
        y = clickY + (targetElementHeight - offsetY);

        return {
          x: x - padding,
          y: y - padding,
        };
      case 'bottom-right':
        x = event.target.offsetLeft - event.clientX;
        if (menuWidth) {
          x = x - menuWidth;
        }
        return {
          x,
          y: event.target.offsetTop + event.clientY + padding,
        };
      case 'top':
        return {
          x: event.target.offsetLeft,
          y: event.target.offsetTop - event.clientY + padding,
        };

      case 'top-left':
        x = event.clientX;
        if (menuWidth) {
          x = x - menuWidth + event.offsetX;
        }
        y = event.target.offsetTop + event.target.clientHeight;
        if (menuHeight) {
          y = y;
        }
        return {
          x,
          y,
        };
      case 'bottom':
        return {
          x: event.target.offsetLeft,
          y: event.target.offsetTop + event.clientY + padding,
        };

      default:
        let pointerY = event.clientY;
        if (position === 'above') {
          pointerY = pointerY - (menuHeight ?? 0);
        }
        // pointer or default
        return { x: event.clientX + padding, y: pointerY + padding };
    }
  } else {
    return { x: 0, y: 0 };
  }
};
