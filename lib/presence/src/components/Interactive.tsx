import { MouseEvent, ReactNode, useEffect } from 'react';
import { Slot } from '@radix-ui/react-slot';

type Props = {
  id: string;
  children: ReactNode;
  onClick?: (event: MouseEvent) => void;
  onPlayerClick?: (patp: string) => void;
};

export const Interactive = ({
  id,
  children,
  onClick,
  onPlayerClick,
}: Props) => {
  const handleOnClick = (event: MouseEvent) => {
    window.electron.multiplayer.appToRealmMouseClick(window.ship, id);
    onClick?.(event);
  };

  useEffect(() => {
    window.electron.multiplayer.onRealmToAppMouseClick((patp, elementId) => {
      if (elementId === id) onPlayerClick?.(patp);
    });
  }, []);

  return (
    <Slot data-multi-click-id={id} onClick={handleOnClick}>
      {children}
    </Slot>
  );
};
