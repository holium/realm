import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

type SelectionContextValue = {
  selectedText: string;
  selectedElement: HTMLElement | null;
};

const SelectionContext = createContext<SelectionContextValue>({} as any);

type SelectionProviderProps = {
  children: ReactNode;
};

export const SelectionProvider = ({ children }: SelectionProviderProps) => {
  const [selectedText, setSelected] = useState('');
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(
    null
  );

  useEffect(() => {
    const handleSelection = () => {
      const contextMenu = document.getElementById('context-menu');
      if (contextMenu) return; // If the context menu is open, don't process selection.
      const selection = document.getSelection();
      if (!selection) return;
      const text = selection.toString().trim();
      if (text !== selectedText) setSelected(text);
      const element = selection.anchorNode?.parentElement;
      if (element && element !== selectedElement) setSelectedElement(element);
    };

    document.addEventListener('selectionchange', handleSelection);

    return () => {
      document.removeEventListener('selectionchange', handleSelection);
    };
  });

  return (
    <SelectionContext.Provider value={{ selectedText, selectedElement }}>
      {children}
    </SelectionContext.Provider>
  );
};

export const useSelection = () => useContext(SelectionContext);
