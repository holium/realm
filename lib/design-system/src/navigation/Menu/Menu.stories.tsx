import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Button, Icon } from '../../';
import { Menu } from './Menu';
import { Box } from '../../general/Box/Box';
import { Flex } from '../../general/Flex/Flex';

export default {
  component: Menu,
} as ComponentMeta<typeof Menu>;

export const BottomRight: ComponentStory<typeof Menu> = () => (
  <Box>
    <Flex justifyContent="center" alignItems="center" height={500} width={400}>
      <Menu
        id="test-1"
        dimensions={{ width: 180, height: 300 }}
        orientation="bottom-right"
        offset={{ x: 0, y: 0 }}
        triggerEl={<Button.Primary> Open menu </Button.Primary>}
      >
        <div> Hello card </div>
      </Menu>
    </Flex>
  </Box>
);

export const BottomLeft: ComponentStory<typeof Menu> = () => (
  <Box>
    <Flex justifyContent="center" alignItems="center" height={500} width={400}>
      <Menu
        id="test-2"
        dimensions={{ width: 180, height: 300 }}
        orientation="bottom-left"
        offset={{ x: 0, y: 0 }}
        triggerEl={<Button.Primary> Open menu </Button.Primary>}
      >
        <div> Hello card </div>
      </Menu>
    </Flex>
  </Box>
);

export const Bottom: ComponentStory<typeof Menu> = () => (
  <Box>
    <Flex justifyContent="center" alignItems="center" height={500} width={400}>
      <Menu
        id="test-3"
        dimensions={{ width: 180, height: 300 }}
        orientation="bottom"
        offset={{ x: 0, y: 1 }}
        triggerEl={<Button.Primary> Open menu </Button.Primary>}
      >
        <div> Hello card </div>
      </Menu>
    </Flex>
  </Box>
);
export const MenuBottomLeft: ComponentStory<typeof Menu> = () => (
  <Box>
    <Flex justifyContent="center" alignItems="center" height={500} width={400}>
      <Menu
        id="test-4"
        orientation="bottom-left"
        offset={{ x: 0, y: 0 }}
        triggerEl={
          <Button.IconButton size={26}>
            <Icon name="MoreHorizontal" size={22} opacity={0.5} />
          </Button.IconButton>
        }
        options={[
          {
            id: 'option-1',
            label: 'Option 1',
            disabled: false,
            onClick: () => console.log('Option 1 clicked'),
          },
          {
            id: 'option-2',
            label: 'Option 2',
            disabled: false,
            onClick: () => console.log('Option 2 clicked'),
          },
        ]}
      />
    </Flex>
  </Box>
);

export const MenuBottomRight: ComponentStory<typeof Menu> = () => (
  <Box>
    <Flex justifyContent="center" alignItems="center" height={500} width={400}>
      <Menu
        id="test-4"
        orientation="bottom-right"
        offset={{ x: 0, y: 0 }}
        triggerEl={<Button.Primary> Open menu </Button.Primary>}
        options={[
          {
            id: 'option-1',
            label: 'Option 1',
            disabled: false,
            onClick: () => console.log('Option 1 clicked'),
          },
          {
            id: 'option-2',
            label: 'Option 2',
            disabled: false,
            onClick: () => console.log('Option 2 clicked'),
          },
        ]}
      />
    </Flex>
  </Box>
);
export const MenuTopLeft: ComponentStory<typeof Menu> = () => (
  <Box>
    <Flex justifyContent="center" alignItems="center" height={500} width={400}>
      <Menu
        id="test-4"
        orientation="top-left"
        offset={{ x: 0, y: 0 }}
        triggerEl={<Button.Primary> Open menu </Button.Primary>}
        options={[
          {
            id: 'option-1',
            label: 'Option 1',
            disabled: false,
            onClick: () => console.log('Option 1 clicked'),
          },
          {
            id: 'option-2',
            label: 'Option 2',
            disabled: false,
            onClick: () => console.log('Option 2 clicked'),
          },
        ]}
      />
    </Flex>
  </Box>
);

export const MenuTopRight: ComponentStory<typeof Menu> = () => (
  <Box>
    <Flex justifyContent="center" alignItems="center" height={500} width={400}>
      <Menu
        id="test-4"
        orientation="top-right"
        offset={{ x: 0, y: 0 }}
        triggerEl={<Button.Primary> Open menu </Button.Primary>}
        options={[
          {
            id: 'option-1',
            label: 'Option 1',
            disabled: false,
            onClick: () => console.log('Option 1 clicked'),
          },
          {
            id: 'option-2',
            label: 'Option 2',
            disabled: false,
            onClick: () => console.log('Option 2 clicked'),
          },
        ]}
      />
    </Flex>
  </Box>
);

export const MenuTop: ComponentStory<typeof Menu> = () => (
  <Box>
    <Flex justifyContent="center" alignItems="center" height={500} width={400}>
      <Menu
        id="test-4"
        orientation="top"
        offset={{ x: 0, y: 0 }}
        triggerEl={<Button.Primary> Open menu </Button.Primary>}
        options={[
          {
            id: 'option-1',
            label: 'Option 1',
            disabled: false,
            onClick: () => console.log('Option 1 clicked'),
          },
          {
            id: 'option-2',
            label: 'Option 2',
            disabled: false,
            onClick: () => console.log('Option 2 clicked'),
          },
        ]}
      />
    </Flex>
  </Box>
);
