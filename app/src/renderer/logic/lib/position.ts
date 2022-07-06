export const calculateAnchorPoint = (
  event: any,
  anchorOffset: any,
  position: any,
  dimensions: any
) => {
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
