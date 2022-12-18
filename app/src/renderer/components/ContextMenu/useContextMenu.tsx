import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { DesktopActions } from 'renderer/logic/actions/desktop';
import { useSelection } from 'renderer/logic/lib/selection';
import { useServices } from 'renderer/logic/store';
import { ContextMenuOption } from './ContextMenu';

type ContextMenuOptionsMap = {
  [containerId: string]: ContextMenuOption[];
};

type ColorConfig = {
  textColor: string;
  backgroundColor: string;
};

type ContextMenuColorsMap = {
  [containerId: string]: ColorConfig;
};

type ContextMenuContextValue = {
  getOptions: (containerId: string) => ContextMenuOption[];
  setOptions: (containerId: string, Options: ContextMenuOption[]) => void;
  getColors: (containerId: string) => ColorConfig;
  setColors: (containerId: string, colors: ColorConfig) => void;
};

const ContextMenuContext = createContext<ContextMenuContextValue>({} as any);

type ContextMenuProviderProps = {
  children: ReactNode;
};

export const ContextMenuProvider = ({ children }: ContextMenuProviderProps) => {
  const selected = useSelection();
  const { theme } = useServices();
  const { textColor, windowColor } = theme.currentTheme;
  const [menuOptions, setMenuOptions] = useState<ContextMenuOptionsMap>();
  const [menuColors, setMenuColors] = useState<ContextMenuColorsMap>();

  const showDevTools = useMemo(
    () =>
      process.env.NODE_ENV === 'development' ||
      process.env.DEBUG_PROD === 'true',
    []
  );
  const defaultOptions = useMemo(
    () =>
      [
        {
          id: 'copy-text',
          label: 'Copy',
          disabled: !selected,
          onClick: (e: MouseEvent) => {
            e.stopPropagation();
            if (selected) navigator.clipboard.writeText(selected);
          },
        },
        showDevTools && {
          id: 'toggle-devtools',
          label: 'Toggle devtools',
          onClick: () => {
            DesktopActions.toggleDevTools();
          },
        },
      ].filter(Boolean) as ContextMenuOption[],
    [selected, showDevTools]
  );

  const setOptions = useCallback(
    (containerId: string, options: ContextMenuOption[]) => {
      setMenuOptions((prev) => ({
        ...prev,
        [containerId]: options,
      }));
    },
    []
  );

  const getOptions = useCallback(
    (containerId: string) => menuOptions?.[containerId] ?? defaultOptions,
    [defaultOptions, menuOptions]
  );

  const setColors = useCallback((containerId: string, colors: ColorConfig) => {
    setMenuColors((prev) => ({
      ...prev,
      [containerId]: colors,
    }));
  }, []);

  const getColors = useCallback(
    (containerId: string) =>
      menuColors?.[containerId] ?? { textColor, backgroundColor: windowColor },
    [menuColors, textColor, windowColor]
  );

  return (
    <ContextMenuContext.Provider
      value={{
        getOptions,
        setOptions,
        getColors,
        setColors,
      }}
    >
      {children}
    </ContextMenuContext.Provider>
  );
};

export const useContextMenu = () => {
  const context = useContext(ContextMenuContext);
  return context;
};
