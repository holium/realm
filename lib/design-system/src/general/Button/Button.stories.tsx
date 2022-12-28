import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Flex, Icon } from '../..';
import { Button } from '.';

export default {
  component: Button.Base,
} as ComponentMeta<typeof Button.Base>;

export const Default: ComponentStory<typeof Button.Base> = () => (
  <Flex flexDirection="column" gap={16}>
    <Flex gap={12}>
      <Button.Primary height={32} px={2} fontSize="16px">
        Primary
      </Button.Primary>
      <Button.Primary> Primary </Button.Primary>
      <Button.Primary disabled> Primary </Button.Primary>
      <Button.Primary disabled>
        <Icon name="CloudDownload" /> Primary
      </Button.Primary>
    </Flex>
    <Flex gap={8}>
      <Button.Secondary> Secondary </Button.Secondary>
      <Button.Secondary disabled> Secondary </Button.Secondary>
    </Flex>
    <Flex gap={8}>
      <Button.Minimal> Minimal </Button.Minimal>
      <Button.Minimal disabled> Minimal </Button.Minimal>
    </Flex>
    <Flex gap={12}>
      <Button.Transparent>Transparent</Button.Transparent>
      <Button.Transparent disabled>Transparent</Button.Transparent>
    </Flex>
    <Flex gap={12}>
      <Button.TextButton>TextButton</Button.TextButton>
      <Button.TextButton showOnHover>TextButton</Button.TextButton>
      <Button.TextButton showOnHover disabled>
        TextButton
      </Button.TextButton>
    </Flex>
  </Flex>
);
