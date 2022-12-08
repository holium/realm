import { Dispatch, SetStateAction, useRef } from 'react';
import useContextMenu from './useContextMenu';
import useSystemContextMenu from './useSystemContextMenu';

import { MenuItem, MenuItemProps } from '../MenuItem';
import { MenuWrapper } from '../Menu';
import { rgba } from 'polished';
import Portal from 'renderer/system/dialog/Portal';
import { MenuOrientation } from 'os/lib/anchor-point';

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
  menu: any[] | (() => any[]);
}

export const ContextMenu = (props: ContextMenuProps) => {
  const {
    position,
    containerId,
    parentRef,
    style,
    menu,
    menuItemtype,
    customBg,
    textColor,
    isComponentContext,
    orientation,
    adaptive,
  } = props;
  const contextMenuRef = useRef();
  let anchorPoint;
  let show;
  let setShow: Dispatch<SetStateAction<boolean>>;
  const _menu: any[] =
    (typeof menu === 'function' && menu()) || (menu as any[]) || [];
  const context = useContextMenu(
    containerId,
    parentRef,
    contextMenuRef,
    (_menu.length + 1) * 32 + 16, // the padding plus each element,
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

  const sectionsArray = _menu.reduce(
    (arr, obj: MenuItemProps, index: number) => {
      if (!index || arr[arr.length - 1][0].section !== obj.section) {
        return arr.concat([
          [
            <MenuItem
              key={index}
              id={obj.id}
              color={obj.disabled ? rgba(textColor, 0.7) : textColor}
              customBg={customBg}
              type={menuItemtype}
              {...obj}
              onClick={(evt: React.MouseEventHandler<HTMLElement>) => {
                setShow(false);
                obj.onClick(evt);
              }}
            />,
          ],
        ]);
      }
      arr[arr.length - 1].push(
        <MenuItem
          key={index}
          id={obj.id}
          color={obj.disabled ? rgba(textColor, 0.7) : textColor}
          customBg={customBg}
          type={menuItemtype}
          {...obj}
          onClick={(evt: React.MouseEventHandler<HTMLElement>) => {
            setShow(false);
            obj.onClick(evt);
          }}
        />
      );
      return arr;
    },
    []
  );

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
        {sectionsArray.map((menuSection: any[], index: number) => {
          let divider = <hr />;
          if (index === sectionsArray.length - 1) {
            // @ts-expect-error
            divider = undefined;
          }
          return (
            <section key={`section-${index}`}>
              {menuSection}
              {divider}
            </section>
          );
        })}
      </MenuWrapper>
    </Portal>
  );
};

ContextMenu.defaultProps = {
  menuItemtype: 'neutral',
  position: 'below',
};

export default ContextMenu;
