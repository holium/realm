import { Box, Flex, Text } from '@holium/design-system';

interface Props {
  spaceList: string[];
  onSpaceSelect: (space: string) => void;
}
export const SpaceList = ({ spaceList, onSpaceSelect }: Props) => {
  return (
    <Flex
      flexDirection={'column'}
      gap={'10px'}
      marginTop={'20px'}
      marginBottom={'20px'}
    >
      {spaceList.map((item: string, index: number) => {
        return (
          <SpaceItem
            title={item}
            onSpaceSelect={onSpaceSelect}
            key={'space-item-' + index}
          />
        );
      })}
    </Flex>
  );
};
const SpaceItem = ({
  title,
  onSpaceSelect,
}: {
  title: string;
  onSpaceSelect: (space: string) => void;
}) => {
  return (
    <Box
      className="highlight-hover"
      style={{
        borderRadius: '12px',
        padding: '4px 8px',
      }}
      onClick={() => onSpaceSelect(title)}
    >
      <Text.Body fontWeight={500}> {title}</Text.Body>
    </Box>
  );
};
