import { useState } from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Icon } from './Icon';
import { paths, IconPathsType } from './icons';
import { Flex } from '../Flex/Flex';
import { Text } from '../Text/Text';
import { TextInput } from '../../input';

export default {
  component: Icon,
} as ComponentMeta<typeof Icon>;

export const Default: ComponentStory<typeof Icon> = () => {
  const [search, setSearch] = useState('');
  return (
    <Flex p={3} gap={20} width="65%" flexDirection="column">
      <TextInput
        id="icon-search"
        name="icon-search"
        placeholder='Search for "Plus"'
        height={34}
        value={search}
        onChange={(evt: any) => setSearch(evt.target.value)}
      />
      <Flex pb={2} gap={8} flexWrap="wrap">
        {Object.keys(paths)
          .filter((value) => value.toLowerCase().includes(search.toLowerCase()))
          .map((name) => (
            <Flex
              width={120}
              gap={12}
              mb={3}
              flexDirection="column"
              alignItems="center"
            >
              <Icon name={name as IconPathsType} size={24} />
              <Text.Hint>{name}</Text.Hint>
            </Flex>
          ))}
      </Flex>
    </Flex>
  );
};
