import React from 'react';

import { Button, Flex, Icon, TextInput } from '@holium/design-system';

export const SearchBar = () => {
  return (
    <Flex flex={1} gap={10} justifyContent={'center'} marginBottom={12}>
      <Button.IconButton>
        <Icon name="ArrowLeftLine" size={22} />
      </Button.IconButton>
      <TextInput
        id="search-input"
        name="search"
        required
        leftAdornment={<Icon name="Search" size={16} opacity={0.7} />}
        style={{
          paddingLeft: 9,
        }}
        value={''}
        placeholder="Search words"
        error={false}
        onChange={() => null}
      />
      <Button.TextButton fontSize={1} fontWeight={600}>
        Add Word
      </Button.TextButton>
    </Flex>
  );
};
