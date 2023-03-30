// import { useState, useEffect, useRef } from 'react';

// interface MenuState {
//   isOpen: boolean;
//   anchorEl: null | HTMLElement;
// }

// function useMenu(): {
//   isOpen: boolean;
//   anchorEl: null | HTMLElement;
//   openMenu: (event: React.MouseEvent<HTMLElement>) => void;
//   closeMenu: () => void;
//   toggleMenu: (event: React.MouseEvent<HTMLElement>) => void;
//   menuRef: React.RefObject<HTMLDivElement>;
// } {
//   const [menuState, setMenuState] = useState<MenuState>({
//     isOpen: false,
//     anchorEl: null,
//   });
//   const menuRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     const handleOutsideClick = (event: MouseEvent) => {
//       if (
//         menuState.anchorEl &&
//         !menuState.anchorEl.contains(event.target as Node)
//       ) {
//         closeMenu();
//       }
//     };

//     if (menuState.isOpen) {
//       const listener = (event: MouseEvent) => handleOutsideClick(event);
//       document.addEventListener('mousedown', listener);
//       return () => {
//         document.removeEventListener('mousedown', listener);
//       };
//     }
//   }, [menuState.isOpen, menuState.anchorEl]);

//   const openMenu = (event: React.MouseEvent<HTMLElement>) => {
//     if (!menuState.isOpen) {
//       setMenuState({
//         isOpen: true,
//         anchorEl: event.currentTarget,
//       });
//     }
//   };

//   const closeMenu = () => {
//     setMenuState({
//       isOpen: false,
//       anchorEl: null,
//     });
//   };

//   const toggleMenu = (event: React.MouseEvent<HTMLElement>) => {
//     if (menuState.isOpen) {
//       closeMenu();
//     } else {
//       openMenu(event);
//     }
//   };

//   return {
//     isOpen: menuState.isOpen,
//     anchorEl: menuState.anchorEl,
//     openMenu,
//     closeMenu,
//     toggleMenu,
//     menuRef,
//   };
// }

// export default useMenu;

import { useState, useEffect, useRef } from 'react';
import { getAnchorPointByTarget } from '../../util/position';
import { Dimensions, Position } from '../../util';
import ReactDOM from 'react-dom';

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

export function useMenu(
  orientation: Orientation = 'bottom-left',
  menuDimensions: Dimensions,
  offset?: Position,
  closableIds?: string[],
  closableClasses?: string[]
): {
  isOpen: boolean;
  anchorEl: null | HTMLElement;
  position: { y: number; x: number };
  openMenu: (event: React.MouseEvent<HTMLElement>) => void;
  closeMenu: () => void;
  toggleMenu: (event: React.MouseEvent<HTMLElement>) => void;
  menuRef: React.RefObject<HTMLDivElement>;
} {
  const [menuState, setMenuState] = useState<MenuState>({
    isOpen: false,
    anchorEl: null,
    position: { y: 0, x: 0 },
  });
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const domNode = ReactDOM.findDOMNode(menuRef.current);

      if (domNode && domNode.contains(event.target as HTMLElement)) {
        // check if the click is on a closable element
        if (closableIds) {
          const id = (event.target as HTMLElement).id;
          if (closableIds.includes(id)) {
            closeMenu();
            return;
          }
        }
        if (closableClasses) {
          const classes = (event.target as HTMLElement).classList;
          if (closableClasses.some((c) => classes.contains(c))) {
            closeMenu();
            return;
          }
        }
        event.stopPropagation();
      } else {
        if (
          menuState.anchorEl &&
          !menuState.anchorEl.contains(event.target as Node)
        ) {
          closeMenu();
          event.stopPropagation();
        }
      }
    };

    if (menuState.isOpen) {
      const listener = (event: MouseEvent) => handleOutsideClick(event);
      document.addEventListener('mousedown', listener);
      return () => {
        document.removeEventListener('mousedown', listener);
      };
    }
    return;
  }, [menuState.isOpen, menuState.anchorEl, closableIds, closableClasses]);

  const calculatePosition = (
    anchorEvent: React.MouseEvent<HTMLElement>,
    orientation: Orientation,
    menuDimensions: { width: number; height: number },
    offset?: Position
  ): Position => {
    let position: Position = getAnchorPointByTarget(
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
