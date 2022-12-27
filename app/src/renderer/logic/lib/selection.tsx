import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

type SelectionContextValue = {
  selected:
    | {
        text: string;
        element: HTMLElement;
      }
    | undefined;
};

const SelectionContext = createContext<SelectionContextValue>({} as any);

type SelectionProviderProps = {
  children: ReactNode;
};

export const SelectionProvider = ({ children }: SelectionProviderProps) => {
  const [selected, setSelected] = useState<SelectionContextValue['selected']>();

  useEffect(() => {
    const handleSelection = () => {
      const selection = document.getSelection();
      if (!selection) return;
      const text = selection.toString().trim();
      const element = selection.anchorNode?.parentElement;
      if (element) setSelected({ text, element });
    };

    document.addEventListener('selectionchange', handleSelection);

    return () => {
      document.removeEventListener('selectionchange', handleSelection);
    };
  });

  return (
    <SelectionContext.Provider value={{ selected }}>
      {children}
    </SelectionContext.Provider>
  );
};

export const useSelection = () => {
  const { selected } = useContext(SelectionContext);
  return selected;
};
