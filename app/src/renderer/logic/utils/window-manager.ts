import { toJS } from 'mobx';

export const getCenteredXY = (
  appDimensions: {
    width: number;
    height: number;
  },
  desktopDimensions: { width: number; height: number }
) => {
  const appWidth = appDimensions.width;
  const appHeight = appDimensions.height;
  const desktopWidth = desktopDimensions.width;
  const desktopHeight = desktopDimensions.height;

  const x = desktopWidth / 2 - appWidth / 2;
  const y = desktopHeight / 2 - appHeight / 2 - 58;
  console.log({ x, y });
  return { x, y };
};
