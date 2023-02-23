import { MouseEventHandler } from 'react';
import { MenuWrapper } from '../Menu';
import { Portal } from 'renderer/system/dialog/Portal';
import { useContextMenu } from 'renderer/components/ContextMenu';
import { MenuItem } from '../MenuItem';

const WIDTH = 180;
const MAX_HEIGHT = 300;
const MENU_ITEM_HEIGHT = 33;
const DIVIDER_HEIGHT = 12;
const PADDING = 9;

const getAnchorPoint = (e: MouseEvent, menuOptions: ContextMenuOption[]) => {
  const numberOfMenuItems = menuOptions.length;
  const numberOfDividers = new Set(menuOptions.map((o) => o.section)).size - 1;

  const menuWidth = WIDTH;
  const menuHeight =
    2 * PADDING +
    numberOfDividers * DIVIDER_HEIGHT +
    numberOfMenuItems * MENU_ITEM_HEIGHT;

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
  onClick: MouseEventHandler<HTMLElement>;
};

export const ContextMenu = () => {
  const { getColors, getOptions, mouseRef, setMouseRef } = useContextMenu();

  if (!mouseRef) return <div />;

  const containerId = (mouseRef.target as HTMLElement).id;
  const contextualOptions = getOptions(containerId);
  const contextualColors = getColors(containerId);
  const anchorPoint = getAnchorPoint(mouseRef, contextualOptions);

  return (
    <Portal>
      <MenuWrapper
        id="context-menu"
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
        style={{
          y: anchorPoint.y,
          x: anchorPoint.x,
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
                disabled={option.disabled}
                color={contextualColors.textColor}
                customBg={contextualColors.backgroundColor}
                onClick={(e) => {
                  if (option.disabled) return;
                  option.onClick(e);
                  setMouseRef(null);
                }}
              />
            </div>
          );
        })}
      </MenuWrapper>
    </Portal>
  );
};
