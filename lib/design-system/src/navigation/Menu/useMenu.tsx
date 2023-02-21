import { useEffect, useState, useCallback, createContext } from 'react';

type MenuContextValue = {
  mouseRef: MouseEvent | null;
  setMouseRef: (e: MouseEvent | null) => void;
};

const MenuContext = createContext<MenuContextValue>({} as any);

export const MenuProvider = ({ children }: { children: React.ReactNode }) => {
  const root = document.getElementById('root');
  const [mouseRef, setMouseRef] = useState<MouseEvent | null>(null);

  const handleClick = useCallback((e: MouseEvent) => {
    const contextMenu = document.getElementById('context-menu');
    if (contextMenu && contextMenu.contains(e.target as Node)) return;
    setMouseRef(null);
  }, []);

  const handleContextMenu = useCallback((e: MouseEvent) => {
    setMouseRef(e);
    e.preventDefault();
  }, []);

  useEffect(() => {
    if (!root) return;
    root.addEventListener('mousedown', handleClick);
    root.addEventListener('contextmenu', handleContextMenu);

    return () => {
      root.removeEventListener('mousedown', handleClick);
      root.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [handleClick, handleContextMenu, root]);

  return (
    <MenuContext.Provider
      value={{
        mouseRef,
        setMouseRef,
      }}
    >
      {children}
    </MenuContext.Provider>
  );
};
