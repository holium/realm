import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
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
  mouseRef: MouseEvent | null;
  setMouseRef: (e: MouseEvent | null) => void;
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
  const root = document.getElementById('root');
  const selected = useSelection();
  const { theme } = useServices();
  const { textColor, windowColor } = theme.currentTheme;
  const [mouseRef, setMouseRef] = useState<MouseEvent | null>(null);
  const [menuOptions, setMenuOptions] = useState<ContextMenuOptionsMap>();
  const [menuColors, setMenuColors] = useState<ContextMenuColorsMap>();
  const [copied, setCopied] = useState('');

  const showDevTools = useMemo(
    () =>
      process.env.NODE_ENV === 'development' ||
      process.env.DEBUG_PROD === 'true',
    []
  );

  const isInputOrTextArea = useCallback(
    (t: EventTarget | null | undefined) =>
      t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement,
    []
  );

  const isValidCopy = useMemo(
    () =>
      selected?.text &&
      (selected.element === mouseRef?.target ||
        selected.element.contains(mouseRef?.target as Node)),
    [isInputOrTextArea, mouseRef?.target, selected?.text, selected?.element]
  );

  const isValidPaste = useMemo(
    () => copied.length && isInputOrTextArea(mouseRef?.target),
    [copied.length, isInputOrTextArea, mouseRef?.target]
  );

  const defaultOptions = useMemo(
    () =>
      [
        {
          id: 'copy-text',
          label: 'Copy',
          disabled: !isValidCopy,
          onClick: (e: MouseEvent) => {
            e.stopPropagation();
            if (isValidCopy) {
              setCopied(selected!.text);
              navigator.clipboard.writeText(selected!.text);
            }
          },
        },
        {
          id: 'paste-text',
          label: 'Paste',
          disabled: !isValidPaste,
          onClick: (e: MouseEvent) => {
            e.stopPropagation();
            if (isValidPaste) {
              // Insert copied text into focused input at cursor position
              const input = mouseRef?.target as HTMLInputElement;
              const startPos = input.selectionStart ?? 0;
              const endPos = input.selectionEnd ?? 0;
              input.value =
                input.value.substring(0, startPos) +
                copied +
                input.value.substring(endPos, input.value.length);
              input.selectionStart = startPos + copied.length;
              input.selectionEnd = startPos + copied.length;
            }
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
    [isValidCopy, mouseRef?.target, selected, showDevTools]
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

  const handleClick = useCallback(() => {
    setMouseRef(null);
  }, []);

  const handleContextMenu = useCallback((e: MouseEvent) => {
    setMouseRef(e);
    e.preventDefault();
  }, []);

  useEffect(() => {
    if (!root) return;
    root.addEventListener('click', handleClick);
    root.addEventListener('contextmenu', handleContextMenu);

    return () => {
      root.removeEventListener('click', handleClick);
      root.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [handleClick, handleContextMenu, root]);

  return (
    <ContextMenuContext.Provider
      value={{
        mouseRef,
        setMouseRef,
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
