import { ipcRenderer } from 'electron';

import { getMouseState } from 'renderer/system/mouse/getMouseState';

ipcRenderer.on('add-mouse-listeners', (_, isMainWindow?: boolean) => {
  const handleMouseMove = (e: MouseEvent) => {
    const mouseState = getMouseState(e);
    const isDragging = e.buttons === 1;

    ipcRenderer.invoke('mouse-move', mouseState, isDragging);
  };
  const handleMouseScroll = () => {
    ipcRenderer.invoke('mouse-move', null, true);
  };

  const handleMouseDown = () => ipcRenderer.invoke('mouse-down');
  const handleMouseUp = () => ipcRenderer.invoke('mouse-up');
  const handleMouseOut = (e: MouseEvent) => {
    // Make sure the mouse is leaving a window and not just moving between elements.
    if (e.relatedTarget === null) ipcRenderer.invoke('mouse-out');
  };

  // Mouseout should not be triggered when leaving a webview.
  if (isMainWindow) window.addEventListener('mouseout', handleMouseOut, true);
  window.addEventListener('mousemove', handleMouseMove, true);
  window.addEventListener('mousedown', handleMouseDown, true);
  window.addEventListener('mouseup', handleMouseUp, true);
  window.addEventListener('scroll', handleMouseScroll, true);
});
