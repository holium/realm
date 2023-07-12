import { Card, Portal } from '@holium/design-system/general';
import {
  MenuItem,
  MenuItemDivider,
  MenuItemProps,
} from '@holium/design-system/navigation';

import { useContextMenu } from 'renderer/components/ContextMenu';

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

export type ContextMenuOption = MenuItemProps & {
  section?: number;
};

export const ContextMenu = () => {
  const { getColors, getOptions, mouseRef, setMouseRef } = useContextMenu();

  if (!mouseRef) return <div />;

  const originatingElement = mouseRef.target as HTMLElement;
  const containerId = (mouseRef.target as HTMLElement).id;
  const contextualOptions = getOptions(containerId);
  const contextualColors = getColors(containerId);
  const anchorPoint = getAnchorPoint(mouseRef, contextualOptions);

  return (
    <Portal>
      <Card
        id="context-menu"
        p={1}
        elevation={2}
        position="absolute"
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
          y: 8,
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
          borderColor: contextualColors.borderColor,
        }}
        customBg={contextualColors.backgroundColor}
      >
        {contextualOptions.map((option, index: number) => {
          const divider =
            index > 0 &&
            contextualOptions[index - 1].section !== option.section;

          return (
            <div key={option.label}>
              {divider && (
                <MenuItemDivider textColor={contextualColors.textColor} />
              )}
              <MenuItem
                id={option.id}
                label={option.label}
                disabled={option.disabled}
                icon={option.icon}
                labelColor={option.labelColor || contextualColors.textColor}
                backgroundColor={contextualColors.backgroundColor}
                iconColor={option.iconColor}
                onClick={(e: any) => {
                  if (option.disabled) return;
                  option.onClick(e, originatingElement);
                  setMouseRef(null);
                }}
              />
            </div>
          );
        })}
      </Card>
    </Portal>
  );
};
