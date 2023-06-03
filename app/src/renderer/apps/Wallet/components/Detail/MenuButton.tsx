import { CSSProperties, ReactNode } from 'react';

import { Button } from '@holium/design-system/general';

type Props = {
  selected: boolean;
  style: CSSProperties;
  children: ReactNode;
  onClick: () => void;
};

export const MenuButton = ({ selected, style, children, onClick }: Props) => {
  if (selected) {
    return (
      <Button.TextButton style={style} onClick={onClick}>
        {children}
      </Button.TextButton>
    );
  }

  return (
    <Button.Transparent style={style} onClick={onClick}>
      {children}
    </Button.Transparent>
  );
};
