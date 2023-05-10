import { Button, Icon } from '@holium/design-system/general';

type Props = {
  starred: boolean;
  onClick: () => void;
};

export const ToolbarStarIcon = ({ starred, onClick }: Props) => (
  <Button.IconButton iconColor={starred ? 'accent' : 'text'} onClick={onClick}>
    <Icon
      size={18}
      opacity={starred ? 1 : 0.5}
      fill={starred ? 'accent' : 'text'}
      name={starred ? 'StarFilled' : 'Star'}
    />
  </Button.IconButton>
);
