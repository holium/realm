import React from 'react';
import { Button, Icon, Card, Flex, Text } from '@holium/design-system';

function Home() {
  return (
    <Card p={'10px'} elevation={4} maxWidth={400} minWidth={400}>
      <Flex flexDirection={'column'}>
        <WordItem />
        <WordItem />
        <WordItem />
        <WordItem />
        <WordItem />
        <WordItem />
      </Flex>
    </Card>
  );
}
function WordItem() {
  return (
    <Flex
      flexDirection={'column'}
      gap={8}
      padding={'10px'}
      style={{ borderRadius: 6 }}
      className="highlight-hover"
    >
      <Flex justifyContent={'space-between'} alignItems={'flex-end'}>
        <Text.H6 fontWeight={600}>word</Text.H6>
        <Text.Hint opacity={0.7}> ~lodlev-migdev</Text.Hint>
      </Flex>
      <Flex justifyContent={'space-between'} alignItems={'flex-end'}>
        <Flex gap={10}>
          <Button.IconButton>
            <Icon
              name="ThumbsUp"
              size={20}
              style={{ marginTop: 3, marginRight: -5 }}
              opacity={0.7}
            />

            <Text.Body opacity={0.7}>23</Text.Body>
          </Button.IconButton>
          <Button.IconButton>
            <Icon
              name="ThumbsDown"
              size={20}
              style={{ marginBottom: -7, marginRight: -5 }}
              opacity={0.7}
            />

            <Text.Body opacity={0.7}>2</Text.Body>
          </Button.IconButton>
        </Flex>
        <Text.Hint opacity={0.7} style={{ marginBottom: 3 }}>
          07/21/2022 10:30 AM
        </Text.Hint>
      </Flex>
    </Flex>
  );
}
export default Home;
