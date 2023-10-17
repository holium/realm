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
  // climb up the DOM tree to get all possible parent element ids
  let allIds = [];
  let foundLast = false;
  let currentElement = originatingElement;
  while (!foundLast) {
    allIds.push(currentElement.id);
    if (currentElement.parentElement) {
      currentElement = currentElement.parentElement;
    } else {
      foundLast = true;
    }
  }
  allIds = allIds.filter((i) => i !== ''); // only care about parent elements that actually have an id set
  let allOptions: ContextMenuOption[] = [];
  for (const id of allIds) {
    for (const opt of getOptions(id)) {
      allOptions.push(opt);
    }
  }
  // if any option is NOT a default option, then we should remove all the defaults.
  if (
    allOptions.find(
      (o) =>
        !['copy-text', 'paste-text', 'toggle-devtools'].includes(o.id || '')
    )
  ) {
    allOptions = allOptions.filter(
      (o) =>
        !['copy-text', 'paste-text', 'toggle-devtools'].includes(o.id || '')
    );
  } else {
    // default options only
    allOptions = getOptions('A_GARBAGE_STRING_THAT_WE_WILL_NEVER_USE_AS_AN_ID');
  }
  // ensure no options are duplicated
  const contextualOptions: ContextMenuOption[] = [];
  for (const option of allOptions) {
    if (!contextualOptions.find((o) => o.id === option.id)) {
      contextualOptions.push(option);
    }
  }
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
