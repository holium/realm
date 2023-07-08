import { Flex, Text } from '@holium/design-system';

import { Vote } from './Vote';
export const WordDefinitionElement = ({
  text,
  id,
  votes,
}: {
  text: string;
  id: string;
  votes: any;
}) => {
  return (
    <Flex flexDirection={'column'} gap={8}>
      <Text.Body>{text}</Text.Body>
      <Flex justifyContent={'space-between'}>
        <Vote id={id} votes={votes} />
        <Text.Body opacity={0.5}> {id?.split('/')[1]}</Text.Body>
      </Flex>
    </Flex>
  );
};
