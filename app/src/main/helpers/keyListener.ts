import { ipcRenderer } from 'electron';

ipcRenderer.on('add-key-listeners', () => {
  const handleKeyDown = (e: KeyboardEvent) => {
    ipcRenderer.invoke(
      'key-down',
      e.key,
      e.shiftKey,
      e.getModifierState('CapsLock')
    );
  };

  window.addEventListener('keydown', handleKeyDown);
});
