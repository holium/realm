import { ipcRenderer } from 'electron';

ipcRenderer.on('add-key-listeners', () => {
  const handleKeyDown = (e: KeyboardEvent) => {
    const isUpperCase =
      e.getModifierState('Shift') || e.getModifierState('CapsLock');
    const key = isUpperCase ? e.key.toUpperCase() : e.key;

    ipcRenderer.invoke('key-down', key);
  };

  window.addEventListener('keydown', handleKeyDown);
});
