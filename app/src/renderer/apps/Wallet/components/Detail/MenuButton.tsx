import { ReactNode } from 'react';

import { Button } from '@holium/design-system/general';

type Props = {
  selected: boolean;
  children: ReactNode;
  onClick: () => void;
};

export const MenuButton = ({ selected, children, onClick }: Props) => {
  if (selected) {
    return <Button.TextButton onClick={onClick}>{children}</Button.TextButton>;
  }

  return <Button.Transparent onClick={onClick}>{children}</Button.Transparent>;
};
