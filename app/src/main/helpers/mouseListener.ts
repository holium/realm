import { ipcRenderer } from 'electron';
import { getMouseState } from 'renderer/system/mouse/getMouseState';

ipcRenderer.on('add-mouse-listeners', () => {
  const handleMouseMove = (e: MouseEvent) => {
    const mouseState = getMouseState(e);
    const isDragging = e.buttons === 1;

    ipcRenderer.invoke('mouse-move', mouseState, isDragging);
  };
  const handleMouseDown = () => ipcRenderer.invoke('mouse-down');
  const handleMouseUp = () => ipcRenderer.invoke('mouse-up');
  const handleMouseOver = () => ipcRenderer.invoke('mouse-over');
  const handleMouseOut = () => ipcRenderer.invoke('mouse-out');
  const handleMouseIcon = (event: any) => {
    console.log('mouse icon event', event);
    ipcRenderer.invoke('icon', event.detail);
  };
  const handleDrop = () => {
    console.log('mouse drop event');
    ipcRenderer.invoke('drop');
  };

  window.addEventListener('mouseover', handleMouseOver);
  window.addEventListener('mouseout', handleMouseOut);
  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('mousedown', handleMouseDown);
  window.addEventListener('mouseup', () => {
    console.log('mouse up');
    handleMouseUp();
  });
  window.addEventListener('icon', (event) => handleMouseIcon(event));
  window.addEventListener('drop', () => {
    console.log('got drop on mouse listener');
    handleDrop();
  });
});
