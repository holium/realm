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
    document.addEventListener('selectionchange', () => {
      const selection = document.getSelection()?.toString().trim();
      if (selection && selection !== '')
        setSelected({
          text: selection,
          element: document.getSelection()?.anchorNode
            ?.parentElement as HTMLElement,
        });
    });

    return () => {
      document.removeEventListener('selectionchange', () => {});
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
