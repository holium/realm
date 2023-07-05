import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { IconPathsType } from '@holium/design-system';

import { ChatPathType } from 'os/services/ship/chat/chat.types';
import { useAppState } from 'renderer/stores/app.store';
import { ChatMessageType } from 'renderer/stores/models/chat.model';

type ShareObject = {
  app: string;
  icon: IconPathsType;
  dataTypeName: string;
  mergedContents?: any;
  message?: ChatMessageType;
} | null;

export type SharePath = {
  path: string;
  title: string;
  selected: boolean;
  type: ChatPathType;
  peers: string[];
  metadata?: any;
  image?: string;
  sigil?: any;
  space?: {
    title: string;
    image: string;
    memberCount: string;
    color: string;
  };
};

type ShareModalContextValue = {
  object: ShareObject;
  setObject: (obj: ShareObject) => void;
  paths: SharePath[];
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
    setShareObject(obj);
  }, []);

  const setPaths = useCallback((paths: SharePath[]) => {
    setSharePaths(paths);
  }, []);

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
        paths: sharePaths,
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
