import { caf, raf } from './animationFrame';
export type AnimationTimeoutId = {
  id: number;
};
export const cancelAnimationTimeout = (frame: AnimationTimeoutId) =>
  caf(frame.id);

/**
 * Recursively calls requestAnimationFrame until a specified delay has been met or exceeded.
 * When the delay time has been reached the function you're timing out will be called.
 */
export const requestAnimationTimeout = (
  callback: (...args: Array<any>) => any,
  delay: number
): AnimationTimeoutId => {
  let start: number;
  // wait for end of processing current event handler, because event handler may be long
  Promise.resolve().then(() => {
    start = Date.now();
  });

  const timeout = () => {
    if (Date.now() - start >= delay) {
      // @ts-ignore
      callback.call();
    } else {
      frame.id = raf(timeout);
    }
  };

  const frame: AnimationTimeoutId = {
    id: raf(timeout),
  };
  return frame;
};
