import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { useAppState } from 'renderer/stores/app.store';

type ShareObject = {
  message?: any;
} | null;

type SharePath = {
  path: string;
  selected: boolean;
  space?: {
    title: string;
    image: string;
    memberCoung: string;
  };
};

type ShareModalContextValue = {
  object: ShareObject;
  setObject: (obj: ShareObject) => void;
  getPaths: () => SharePath[];
  setPaths: (paths: SharePath[]) => void;
  colors: { textColor: any; windowColor: any };
};

const ShareModalContext = createContext<ShareModalContextValue>({} as any);

type ShareModalProviderProps = {
  children: ReactNode;
};

export const ShareModalProvider = ({ children }: ShareModalProviderProps) => {
  const root = document.getElementById('root');
  const { theme } = useAppState();
  const { textColor, windowColor } = theme;
  const [shareObject, setShareObject] = useState<ShareObject>(null);
  const [sharePaths, setSharePaths] = useState<SharePath[]>([]);

  const setObject = useCallback((obj: ShareObject) => {
    setShareObject({ ...obj });
  }, []);

  const setPaths = useCallback((paths: SharePath[]) => {
    setSharePaths(paths);
  }, []);

  const getPaths = useCallback(() => sharePaths, [sharePaths]);

  const handleClick = useCallback((e: MouseEvent) => {
    const modal = document.getElementById('share-modal');
    if (modal && modal.contains(e.target as Node)) return;
    setShareObject(null);
  }, []);

  useEffect(() => {
    if (!root) return;
    root.addEventListener('mousedown', handleClick);

    return () => {
      root.removeEventListener('mousedown', handleClick);
    };
  }, [handleClick, root]);

  return (
    <ShareModalContext.Provider
      value={{
        object: shareObject,
        setObject,
        getPaths,
        setPaths,
        colors: { textColor, windowColor },
      }}
    >
      {children}
    </ShareModalContext.Provider>
  );
};

export const useShareModal = () => {
  const context = useContext(ShareModalContext);
  return context;
};
