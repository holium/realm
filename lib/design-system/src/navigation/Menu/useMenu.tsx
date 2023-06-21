import { RefObject, useCallback, useEffect, useRef, useState } from 'react';

import { Dimensions, Position } from '../../../util';
import { getAnchorPointByTarget } from '../../util/position';

interface MenuState {
  isOpen: boolean;
  anchorEl: null | HTMLElement;
  position: { y: number; x: number };
}

type Orientation =
  | 'top-left'
  | 'top-right'
  | 'top'
  | 'right'
  | 'left'
  | 'pointer'
  | 'bottom-left'
  | 'bottom-right'
  | 'bottom';

type UseMenu = {
  isOpen: boolean;
  anchorEl: null | HTMLElement;
  position: { y: number; x: number };
  menuRef: RefObject<HTMLDivElement>;
  openMenu: (event: React.MouseEvent<HTMLElement>) => void;
  toggleMenu: (event: React.MouseEvent<HTMLElement>) => void;
  closeMenu: () => void;
};

export function useMenu(
  orientation: Orientation = 'bottom-left',
  menuDimensions: Dimensions,
  offset?: Position,
  closableIds?: string[],
  closableClasses?: string[]
): UseMenu {
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuState, setMenuState] = useState<MenuState>({
    isOpen: false,
    anchorEl: null,
    position: { y: 0, x: 0 },
  });

  const handleOutsideClick = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation();

      const isMenuAnchorClick =
        menuState.anchorEl && menuState.anchorEl.contains(event.target as Node);
      const isMenuContainerClick =
        menuRef.current && menuRef.current.contains(event.target as Node);

      if (isMenuAnchorClick) {
        return;
      } else if (isMenuContainerClick && menuState.isOpen) {
        // check if the click is on a closable element
        if (closableIds?.length) {
          const id = (event.target as HTMLElement).id;
          if (closableIds.includes(id)) {
            closeMenu();
            return;
          }
        }
        if (closableClasses?.length) {
          const classes = (event.target as HTMLElement).classList;
          if (closableClasses.some((c) => classes.contains(c))) {
            closeMenu();
            return;
          }
        }
      } else if (menuState.isOpen) {
        closeMenu();
      }
    },
    [menuState, closableIds, closableClasses]
  );

  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [handleOutsideClick]);

  const calculatePosition = (
    anchorEvent: React.MouseEvent<HTMLElement>,
    orientation: Orientation,
    menuDimensions: { width: number; height: number },
    offset?: Position
  ): Position => {
    const position: Position = getAnchorPointByTarget(
      anchorEvent.nativeEvent,
      menuDimensions,
      orientation,
      offset
    );

    return position;
  };

  const openMenu = (event: React.MouseEvent<HTMLElement>) => {
    const { currentTarget } = event;
    const position = calculatePosition(
      event,
      orientation,
      menuDimensions,
      offset
    );
    setMenuState({
      isOpen: true,
      anchorEl: currentTarget as HTMLElement,
      position,
    });
  };

  const closeMenu = () => {
    setMenuState({
      isOpen: false,
      anchorEl: null,
      position: { y: 0, x: 0 },
    });
  };

  const toggleMenu = (event: React.MouseEvent<HTMLElement>) => {
    if (menuState.isOpen) {
      closeMenu();
    } else {
      openMenu(event);
    }
  };

  return { ...menuState, openMenu, closeMenu, toggleMenu, menuRef };
}
