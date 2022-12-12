import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

type SelectionContextValue = {
  selected: string | undefined;
};

const SelectionContext = createContext<SelectionContextValue>({
  selected: undefined,
});

type SelectionProviderProps = {
  children: ReactNode;
};

export const SelectionProvider = ({ children }: SelectionProviderProps) => {
  const [selected, setSelected] = useState<string>();

  useEffect(() => {
    document.addEventListener('selectionchange', () => {
      const selection = document.getSelection()?.toString().trim();
      if (selection && selection !== '') setSelected(selection.toString());
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
