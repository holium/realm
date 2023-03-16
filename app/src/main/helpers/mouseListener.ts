import { ipcRenderer } from 'electron';
import { getMouseState } from 'renderer/system/mouse/getMouseState';

ipcRenderer.on('add-mouse-listeners', (_, isMainWindow?: boolean) => {
  const handleMouseMove = (e: MouseEvent) => {
    const mouseState = getMouseState(e);
    const isDragging = e.buttons === 1;

    ipcRenderer.invoke('main.mouse-move', mouseState, isDragging);
  };
  const handleMouseDown = () => ipcRenderer.invoke('main.mouse-down');
  const handleMouseUp = () => ipcRenderer.invoke('main.mouse-up');
  const handleMouseOut = (e: MouseEvent) => {
    // Make sure the mouse is leaving a window and not just moving between elements.
    if (e.relatedTarget === null) ipcRenderer.invoke('main.mouse-out');
  };

  // Mouseout should not be triggered when leaving a webview.
  if (isMainWindow) window.addEventListener('mouseout', handleMouseOut);
  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('mousedown', handleMouseDown);
  window.addEventListener('mouseup', handleMouseUp);
});
