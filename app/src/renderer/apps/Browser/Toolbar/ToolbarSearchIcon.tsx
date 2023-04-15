import { Flex, Button, Icon } from '@holium/design-system';

type Props = {
  onClick: () => void;
};

export const ToolbarSearchIcon = ({ onClick }: Props) => (
  <Flex mr={2} flexDirection="row" alignItems="center">
    <Button.IconButton onClick={onClick}>
      <Icon size={18} name="Search" opacity={0.5} />
    </Button.IconButton>
  </Flex>
);
