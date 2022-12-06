import { Dispatch, MouseEventHandler, SetStateAction, useRef } from 'react';
import useContextMenu from './useContextMenu';
import useSystemContextMenu from './useSystemContextMenu';
import { MenuItem } from '../MenuItem';
import { MenuWrapper } from '../Menu';
import { rgba } from 'polished';
import Portal from 'renderer/system/dialog/Portal';
import { MenuOrientation } from 'os/lib/anchor-point';

export type ContextMenuItem = {
  id?: string;
  label: string;
  disabled?: boolean;
  section?: number;
  onClick: (evt: any) => void;
};

export interface ContextMenuProps {
  isComponentContext?: boolean;
  position?: 'above' | 'below';
  orientation?: MenuOrientation;
  adaptive?: boolean;
  style?: any;
  textColor: string;
  containerId: string;
  parentRef: any;
  customBg?: string;
  menuItemtype?: 'neutral' | 'brand';
  menu: ContextMenuItem[];
}

export const ContextMenu = ({
  position = 'below',
  containerId,
  parentRef,
  style,
  menu,
  menuItemtype = 'neutral',
  customBg,
  textColor,
  isComponentContext,
  orientation,
  adaptive,
}: ContextMenuProps) => {
  const contextMenuRef = useRef();
  let anchorPoint;
  let show;
  let setShow: Dispatch<SetStateAction<boolean>>;
  const context = useContextMenu(
    containerId,
    parentRef,
    contextMenuRef,
    (menu.length + 1) * 32 + 16, // the padding plus each element,
    position,
    orientation,
    adaptive
  );
  const systemContext = useSystemContextMenu();

  if (isComponentContext) {
    anchorPoint = context.anchorPoint;
    show = context.show;
    setShow = context.setShow;
  } else {
    anchorPoint = systemContext.anchorPoint;
    show = systemContext.show;
    setShow = systemContext.setShow;
  }

  return (
    <Portal>
      <MenuWrapper
        key={containerId}
        id={`${containerId}-context-menu`}
        className="menu"
        customBg={customBg}
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
        // @ts-expect-error
        ref={contextMenuRef}
        style={{
          y: anchorPoint.y,
          x: anchorPoint.x,
          display: show ? 'block' : 'none',
          ...style,
        }}
      >
        {menu.map((menuItem, index: number) => {
          // Insert divider if section changes
          const divider =
            index > 0 && menu[index - 1].section !== menuItem.section;

          return (
            <div key={menuItem.label}>
              {divider && <hr />}
              <MenuItem
                id={menuItem.id}
                label={menuItem.label}
                color={menuItem.disabled ? rgba(textColor, 0.7) : textColor}
                customBg={customBg}
                type={menuItemtype}
                onClick={(evt: MouseEventHandler<HTMLElement>) => {
                  setShow(false);
                  menuItem.onClick(evt);
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
