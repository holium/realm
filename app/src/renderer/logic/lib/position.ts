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
  let bottom = buttonEvent.srcElement.offsetHeight + anchorOffset.y;
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
  const buttonTop = el.offsetHeight! + height;
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
  let bottom = Math.round(buttonTop - height + anchorOffset.y);
  style = { ...style, bottom };
  return style;
};
