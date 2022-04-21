import { MenuOrientation } from '../types/Menu';

export const calculateAnchorPoint = (
  event: any,
  orientation: MenuOrientation,
  padding = 12,
  menuWidth: number,
  menuHeight: number
) => {
  let x: number;
  let y: number;
  console.log('node', event, event.clientX, event.clientY, event.target);
  switch (orientation) {
    case 'right':
      return {
        x: event.srcElement.offsetLeft + event.clientX + padding,
        y: event.srcElement.offsetTop,
      };
    case 'left':
      x = event.srcElement.offsetLeft - event.clientX + padding;
      if (menuWidth) {
        x = x - menuWidth;
      }
      return {
        x,
        y: event.srcElement.offsetTop,
      };
    case 'bottom-left':
      // [ offset left
      x = event.srcElement.offsetLeft + event.clientX - padding;
      if (menuWidth) {
        x = x - menuWidth;
      }
      return {
        x,
        y: event.srcElement.offsetTop + event.clientY - padding,
      };
    case 'bottom-right':
      x = event.srcElement.offsetLeft - event.clientX;
      if (menuWidth) {
        x = x - menuWidth;
      }
      return {
        x,
        y: event.srcElement.offsetTop + event.clientY + padding,
      };
    case 'top':
      return {
        x: event.srcElement.offsetLeft,
        y: event.srcElement.offsetTop - event.clientY + padding,
      };

    case 'top-left':
      x = event.clientX;
      if (menuWidth) {
        x = x - menuWidth + event.offsetX;
      }
      y = event.srcElement.offsetTop + event.srcElement.clientHeight;
      if (menuHeight) {
        y = y;
      }
      return {
        x,
        y,
      };
    case 'bottom':
      return {
        x: event.srcElement.offsetLeft,
        y: event.srcElement.offsetTop + event.clientY + padding,
      };

    default:
      // pointer or default
      return { x: event.layerX + padding, y: event.layerY + padding };
  }
};
