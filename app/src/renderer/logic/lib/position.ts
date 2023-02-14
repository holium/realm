import { Dimensions } from 'os/types';

export const calculateAnchorPoint = (
  event: any,
  anchorOffset: any,
  position: any,
  dimensions: any
) => {
  // console.log(anchorOffset, position, dimensions);
  const buttonEvent = event.nativeEvent;
  let style = {};

  let left = null;
  if (position.includes('-left')) {
    left =
      event.clientX -
      dimensions.width -
      buttonEvent.offsetX +
      buttonEvent.srcElement.offsetWidth +
      anchorOffset.x;
    style = { ...style, left };
  }
  if (position.includes('-right')) {
    left = event.clientX - buttonEvent.offsetX - anchorOffset.x;
    style = { ...style, left };
  }

  if (!position.includes('-right') && !position.includes('-left')) {
    left =
      event.clientX -
      buttonEvent.offsetX -
      anchorOffset.x -
      dimensions.width / 2;
    style = { ...style, left };
  }
  const bottom = buttonEvent.srcElement.offsetHeight + anchorOffset.y;
  style = { ...style, bottom };
  return style;
};

export const calculateAnchorPointById = (
  appId: string,
  anchorOffset: any,
  position: any,
  dimensions: any
) => {
  const el = document.getElementById(`${appId}-icon`)!;
  const {
    left: buttonLeft,
    width: buttonWidth,
    height,
  } = el?.getBoundingClientRect();
  const buttonTop = el.offsetHeight + height;
  let style: any = {};

  let left = null;
  if (position.includes('-left')) {
    left = Math.round(
      buttonLeft - dimensions.width + buttonWidth - anchorOffset.x
    );
    style = { ...style, left };
  }
  if (position.includes('-right')) {
    left = Math.round(buttonLeft - anchorOffset.x);
    style = { ...style, left };
  }

  if (!position.includes('-right') && !position.includes('-left')) {
    left = Math.round(buttonLeft - anchorOffset.x - dimensions.width / 2);
    style = { ...style, left };
  }
  const bottom = Math.round(buttonTop - height + anchorOffset.y);
  style = { ...style, bottom };
  return style;
};

export const calculatePopoverAnchorById = (
  popoverId: string,
  config: {
    dimensions?: Dimensions;
    anchorOffset: { x?: number; y?: number };
    centered?: boolean;
  }
) => {
  const el = document.getElementById(popoverId)!;
  const { centered, dimensions, anchorOffset } = config;
  const divTop = el.offsetHeight;

  const {
    left: divLeft,
    width: divWidth,
    height: divHeight,
  } = el?.getBoundingClientRect();

  const offsetX = anchorOffset.x ?? 0;
  const offsetY = anchorOffset.y ?? 0;

  let coords = {
    top: divTop + divHeight + offsetY,
    left: divLeft + offsetX,
  };

  if (centered && dimensions) {
    coords = {
      ...coords,
      left: divLeft + offsetX - dimensions.width / 2 + divWidth / 2,
    };
  }

  return coords;
};
