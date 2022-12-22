import {
  MouseEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { MenuWrapper } from '../Menu';
import { rgba } from 'polished';
import Portal from 'renderer/system/dialog/Portal';
import { useContextMenu } from 'renderer/components/ContextMenu';
import { MenuItem } from '../MenuItem';

const WIDTH = 180;
const MAX_HEIGHT = 300;
const MIN_HEIGHT = 84;

const getAnchorPoint = (e: MouseEvent, menu: HTMLDivElement | null) => {
  const menuWidth = WIDTH;
  const menuHeight = Math.min(menu?.scrollHeight || MIN_HEIGHT, MAX_HEIGHT);

  const willGoOffScreenHorizontally = e.pageX + menuWidth > window.innerWidth;
  const willGoOffScreenVertically = e.pageY + menuHeight > window.innerHeight;

  const offset = 3;
  const x = willGoOffScreenHorizontally
    ? e.pageX - menuWidth - offset
    : e.pageX + offset;
  const y = willGoOffScreenVertically
    ? e.pageY - menuHeight - offset
    : e.pageY + offset;

  return { x, y };
};

export type ContextMenuOption = {
  id?: string;
  label: string;
  disabled?: boolean;
  section?: number;
  onClick: (e: MouseEventHandler<HTMLElement>) => void;
};

export const ContextMenu = () => {
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const { getColors, getOptions } = useContextMenu();
  const root = document.getElementById('root');

  const [show, setShow] = useState(false);
  const clickedRef = useRef<HTMLElement | null>(null);
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });

  const handleClick = useCallback((e: MouseEvent) => {
    setShow(false);
    if (contextMenuRef.current?.contains(e.target as Node)) {
      return;
    }
  }, []);

  const handleContextMenu = useCallback(
    (e: MouseEvent) => {
      setAnchorPoint(getAnchorPoint(e, contextMenuRef.current));
      clickedRef.current = e.target as HTMLElement;
      e.preventDefault();
      setShow(true);
    },
    [setAnchorPoint]
  );

  useEffect(() => {
    if (!root) return;
    root.addEventListener('click', handleClick);
    root.addEventListener('contextmenu', handleContextMenu);

    return () => {
      root.removeEventListener('click', handleClick);
      root.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [handleClick, handleContextMenu, root]);

  if (!clickedRef.current) return <div />;

  const containerId = clickedRef.current.id;
  const contextualOptions = getOptions(containerId);
  const contextualColors = getColors(containerId);

  return (
    <Portal>
      <MenuWrapper
        className="menu"
        customBg={contextualColors.backgroundColor}
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
          transition: {
            duration: 0.1,
          },
        }}
        exit={{
          opacity: 0,
          // y: 8,
          transition: {
            duration: 0.1,
          },
        }}
        ref={contextMenuRef}
        style={{
          y: anchorPoint.y,
          x: anchorPoint.x,
          display: show ? 'block' : 'none',
          width: WIDTH,
          maxHeight: MAX_HEIGHT,
          overflowY: 'auto',
        }}
      >
        {contextualOptions.map((option, index: number) => {
          const divider =
            index > 0 &&
            contextualOptions[index - 1].section !== option.section;

          return (
            <div key={option.label}>
              {divider && <hr />}
              <MenuItem
                id={option.id}
                label={option.label}
                color={
                  option.disabled
                    ? rgba(contextualColors.textColor, 0.7)
                    : contextualColors.textColor
                }
                customBg={contextualColors.backgroundColor}
                type="neutral"
                onClick={(e) => {
                  setShow(false);
                  clickedRef.current = null;
                  option.onClick(e);
                }}
              />
            </div>
          );
        })}
      </MenuWrapper>
    </Portal>
  );
};

export default ContextMenu;
