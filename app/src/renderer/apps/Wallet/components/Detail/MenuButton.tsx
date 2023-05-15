import { ReactNode } from 'react';

import { Button } from '@holium/design-system/general';

type Props = {
  selected: boolean;
  children: ReactNode;
  onClick: () => void;
};

export const MenuButton = ({ selected, children, onClick }: Props) => (
  <Button.TextButton
    flex={1}
    color={selected ? 'accent' : 'text'}
    onClick={onClick}
  >
    {children}
  </Button.TextButton>
);
