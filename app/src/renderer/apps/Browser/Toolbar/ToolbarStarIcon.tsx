import { MouseEvent } from 'react';

import { Button, Icon } from '@holium/design-system/general';

type Props = {
  starred: boolean;
  onClick: () => void;
};

export const ToolbarStarIcon = ({ starred, onClick }: Props) => {
  const handleOnClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onClick();
  };

  return (
    <Button.IconButton
      mr="8px"
      iconColor={starred ? 'accent' : 'text'}
      onClick={handleOnClick}
    >
      <Icon
        size={18}
        opacity={starred ? 1 : 0.5}
        fill={starred ? 'accent' : 'text'}
        name={starred ? 'StarFilled' : 'Star'}
      />
    </Button.IconButton>
  );
};
