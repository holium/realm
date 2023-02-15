import { useEffect, useCallback, useState } from 'react';
import { MenuOrientation } from './types';
import { calculateAnchorPoint } from 'os/lib/anchor-point';

export const useMenu = (
  ref: any,
  config: { orientation: MenuOrientation; padding: number; menuWidth?: any }
) => {
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const [show, setShow] = useState(false);

  const handleMenu = useCallback(
    (event: any) => {
      // If the id of the menu matches the parent of the click, show the menu
      if (event.target.id === ref.current.id && !show) {
        event.preventDefault();
        event.currentTarget.blur(); // this is to lose focus after clicking.
        event.stopPropagation();
        setAnchorPoint(
          calculateAnchorPoint(
            event,
            config.orientation,
            config.padding,
            config.menuWidth || 250
          )
        );
        setShow(true);
      } else {
        console.log('handling');
        event.preventDefault();
        event.stopPropagation();
        // setShow(false);
      }
    },
    [setShow, setAnchorPoint, show]
  );

  useEffect(() => {
    ref.current && ref.current.addEventListener('click', handleMenu);
    return () => {
      ref.current && ref.current.removeEventListener('click', handleMenu);
    };
  });

  return { anchorPoint, show, setShow };
};
