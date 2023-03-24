import { ipcRenderer } from 'electron';
import { isTextElement } from 'renderer/system/mouse/getMouseState';

ipcRenderer.on('add-key-listeners', () => {
  const handleKeyDown = (e: KeyboardEvent) => {
    const isUpperCase =
      e.getModifierState('Shift') || e.getModifierState('CapsLock');
    const key = isUpperCase ? e.key.toUpperCase() : e.key;

    const activeEl = document.activeElement;
    const isInTextElement = activeEl && isTextElement(activeEl);
    const existsProseMirrorFocusedElement = document.querySelector(
      '.ProseMirror-focused'
    );
    const isFocused = isInTextElement || existsProseMirrorFocusedElement;

    ipcRenderer.invoke('key-down', key, isFocused);
  };

  window.addEventListener('keydown', handleKeyDown);
});
