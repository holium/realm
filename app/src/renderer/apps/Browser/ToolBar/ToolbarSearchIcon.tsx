import { Flex, IconButton, Icons } from 'renderer/components';

type Props = {
  onClick: () => void;
};

export const ToolbarSearchIcon = ({ onClick }: Props) => (
  <Flex mr={2} flexDirection="row" alignItems="center">
    <IconButton onClick={onClick}>
      <Icons name="Search" opacity={0.5} />
    </IconButton>
  </Flex>
);
