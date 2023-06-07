import React, { useEffect } from 'react';

import { Button, Card, Flex, Icon, Text } from '@holium/design-system';

import api from '../api';
import { log } from '../utils';

export const Home = () => {
  const space: string = '/~lux/our';
  const getPathData = async () => {
    //fetch data stored in db under the current space(path)
    try {
      const result = await api.getPath(space);
      log('getPathData result =>', result);
    } catch (e) {
      log('getPathData error =>', e);
    }
  };
  useEffect(() => {
    getPathData();
  }, []);
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
};
const WordItem = () => {
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
        <Text.Body opacity={0.5}> ~lodlev-migdev</Text.Body>
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
        <Text.Body opacity={0.5} style={{ marginBottom: 3 }}>
          07/21/2022 10:30 AM
        </Text.Body>
      </Flex>
    </Flex>
  );
};
