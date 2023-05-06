export type Position = { x: number; y: number };
export type Dimensions = { width: number; height: number };
export type Bounds = Position & Dimensions;
export type Orientation =
  | 'top-left'
  | 'top-right'
  | 'top'
  | 'right'
  | 'left'
  | 'pointer'
  | 'bottom-left'
  | 'bottom-right'
  | 'bottom';

export const getMenuHeight = (
  menuItems: any[],
  itemHeight: number,
  dividerHeight: number,
  padding: number = 8
) => {
  const numberOfMenuItems = menuItems.length;
  const numberOfDividers = new Set(menuItems.map((o) => o.section)).size - 1;
  return (
    2 * padding +
    numberOfDividers * dividerHeight +
    numberOfMenuItems * itemHeight
  );
};

export const getAnchorPoint = (
  e: MouseEvent,
  menuHeight: number,
  menuWidth: number,
  offset: {
    x: number;
    y: number;
  } = { x: 3, y: 3 }
) => {
  const willGoOffScreenHorizontally = e.pageX + menuWidth > window.innerWidth;
  const willGoOffScreenVertically = e.pageY + menuHeight > window.innerHeight;

  const x = willGoOffScreenHorizontally
    ? e.pageX - menuWidth - offset.x
    : e.pageX + offset.x;
  const y = willGoOffScreenVertically
    ? e.pageY - menuHeight - offset.y
    : e.pageY + offset.y;

  return { x, y };
};
// TODO refactor this to use the new getAnchorPoint function
export const getAnchorPointByElement = (
  el: HTMLElement,
  dimensions: Dimensions,
  orientation: Orientation,
  offset: {
    x: number;
    y: number;
  } = { x: 0, y: 0 },
  position: 'above' | 'below' = 'below'
) => {
  let x: number;
  let y: number;
  let menuWidth = dimensions.width;
  let menuHeight = dimensions.height;
  const {
    left: clickX,
    top: clickY,
    width: targetElementWidth,
    height: targetElementHeight,
  } = el.getBoundingClientRect();
  const offsetX = el.offsetLeft;
  const offsetY = el.offsetHeight;

  switch (orientation) {
    case 'right':
      return {
        x: el.offsetLeft + el.clientLeft + offset.x,
        y: el.offsetTop,
      };
    case 'left':
      x = clickX - offsetX;
      y = clickY - offsetY;
      if (menuWidth) {
        x = x - menuWidth;
      }
      return {
        x: x - offset.x,
        y: y - offset.y,
      };
    case 'bottom-left':
      x = clickX - offsetX - menuWidth + targetElementWidth;
      y = clickY + (targetElementHeight - offsetY);
      return {
        x: x + offset.x,
        y: y + offset.y,
      };
    case 'bottom-right':
      x = clickX - offsetX;
      y = clickY + (targetElementHeight - offsetY);
      return {
        x: x + offset.x,
        y: y + offset.y,
      };

    case 'top':
      x = clickX - offsetX - menuWidth / 2 + targetElementWidth / 2;
      y = clickY - offsetY - menuHeight;
      return {
        x: x + offset.x,
        y: y + offset.y,
      };

    case 'top-left':
      x = clickX - offsetX - menuWidth + targetElementWidth;
      y = clickY - offsetY - menuHeight;
      return {
        x: x + offset.x,
        y: y + offset.y,
      };
    case 'top-right':
      x = clickX - offsetX;
      y = clickY - offsetY - menuHeight;
      return {
        x: x + offset.x,
        y: y + offset.y,
      };

    case 'bottom':
      x = clickX - offsetX - menuWidth / 2 + targetElementWidth / 2;
      y = clickY + (targetElementHeight - offsetY);
      return {
        x: x + offset.x,
        y: y + offset.y,
      };

    default:
      let pointerY = el.clientTop;
      if (position === 'above') {
        pointerY = pointerY - menuHeight;
      }
      // pointer or default
      return { x: offsetX + offset.x, y: pointerY + offset.y };
  }
};

export const getAnchorPointByTarget = (
  event: MouseEvent,
  dimensions: Dimensions,
  orientation: Orientation,
  offset: {
    x: number;
    y: number;
  } = { x: 0, y: 0 },
  position: 'above' | 'below' = 'below'
) => {
  if (event.target instanceof HTMLElement) {
    let x: number;
    let y: number;
    let menuWidth = dimensions.width;
    let menuHeight = dimensions.height;
    const clickX = event.x;
    const clickY = event.y;
    const offsetX = event.offsetX;
    const offsetY = event.offsetY;
    const targetElementHeight = event.target.clientHeight;
    const targetElementWidth = event.target.clientWidth;

    switch (orientation) {
      case 'right':
        return {
          x: event.target.offsetLeft + event.clientX + offset.x,
          y: event.target.offsetTop,
        };
      case 'left':
        x = clickX - offsetX;
        y = clickY - offsetY;
        if (menuWidth) {
          x = x - menuWidth;
        }
        return {
          x: x - offset.x,
          y: y - offset.y,
        };
      case 'bottom-left':
        x = clickX - offsetX - menuWidth + targetElementWidth;
        y = clickY + (targetElementHeight - offsetY);
        return {
          x: x + offset.x,
          y: y + offset.y,
        };
      case 'bottom-right':
        x = clickX - offsetX;
        y = clickY + (targetElementHeight - offsetY);
        return {
          x: x + offset.x,
          y: y + offset.y,
        };

      case 'top':
        x = clickX - offsetX - menuWidth / 2 + targetElementWidth / 2;
        y = clickY - offsetY - menuHeight;
        return {
          x: x + offset.x,
          y: y + offset.y,
        };

      case 'top-left':
        x = clickX - offsetX - menuWidth + targetElementWidth;
        y = clickY - offsetY - menuHeight;
        return {
          x: x + offset.x,
          y: y + offset.y,
        };
      case 'top-right':
        x = clickX - offsetX;
        y = clickY - offsetY - menuHeight;
        return {
          x: x + offset.x,
          y: y + offset.y,
        };

      case 'bottom':
        x = clickX - offsetX - menuWidth / 2 + targetElementWidth / 2;
        y = clickY + (targetElementHeight - offsetY);
        return {
          x: x + offset.x,
          y: y + offset.y,
        };

      default:
        let pointerY = event.clientY;
        if (position === 'above') {
          pointerY = pointerY - menuHeight;
        }
        // pointer or default
        return { x: event.clientX + offset.x, y: pointerY + offset.y };
    }
  } else {
    throw new Error('event.target is not an HTMLElement');
  }
};

export const getAnchorPointById = (
  id: string,
  dimensions: Dimensions,
  orientation: Orientation,
  offset: {
    x: number;
    y: number;
  } = { x: 3, y: 3 }
) => {
  const el = document.getElementById(id);
  if (!el) return null;
  const {
    left: buttonLeft,
    width: buttonWidth,
    height: buttonHeight,
  } = el.getBoundingClientRect();

  const buttonTop = el.offsetTop;
  let style: any = {};
  let left = null;

  if (orientation.includes('-left')) {
    left = Math.round(buttonLeft - dimensions.width + buttonWidth - offset.x);
    style = { ...style, x: left };
  }
  if (orientation.includes('-right')) {
    left = Math.round(buttonLeft - offset.x);
    style = { ...style, x: left };
  }
  if (!orientation.includes('-right') && !orientation.includes('-left')) {
    left = Math.round(
      buttonLeft - offset.x - dimensions.width / 2 + buttonWidth / 2
    );
    style = { ...style, x: left };
  }
  if (orientation.includes('top')) {
    console.log('top', buttonTop, dimensions.height, offset.y);
    style = {
      ...style,
      y: Math.round(buttonTop - dimensions.height - offset.y),
    };
  }
  if (orientation.includes('bottom')) {
    console.log('bottom', buttonTop, dimensions.height, offset.y);
    style = {
      ...style,
      y: Math.round(buttonTop + buttonHeight + offset.y),
    };
  }
  return style;
};
