import { ipcRenderer } from 'electron';
import { getMouseState } from 'renderer/system/mouse/getMouseState';

ipcRenderer.on('add-mouse-listeners', () => {
  const handleMouseUp = () => ipcRenderer.invoke('mouse-up');
  const handleMouseDown = () => ipcRenderer.invoke('mouse-down');
  const handleMouseOut = () => ipcRenderer.invoke('mouse-out');
  const handleMouseMove = (e: MouseEvent) => {
    const mouseState = getMouseState(e);
    const isDragging = e.buttons === 1;

    ipcRenderer.invoke('mouse-move', mouseState, isDragging);
  };

  window.addEventListener('mouseup', handleMouseUp);
  window.addEventListener('mousedown', handleMouseDown);
  window.addEventListener('mouseout', handleMouseOut);
  window.addEventListener('mousemove', handleMouseMove);
});
