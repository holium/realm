import { ComponentMeta, Story } from '@storybook/react';
import { WindowedList } from './WindowedList';
import { Box } from '../Box/Box';
import { Flex } from '../Flex/Flex';
import { Skeleton } from '../Skeleton/Skeleton';

export default {
  component: WindowedList,
  argTypes: {
    rows: {
      control: {
        type: 'range',
        min: 0,
        max: 10000,
        step: 10,
      },
    },
    containerHeight: {
      control: {
        type: 'range',
        min: 100,
        max: 1000,
        step: 1,
      },
    },
    itemHeight: {
      control: {
        type: 'range',
        min: 10,
        max: 100,
        step: 1,
      },
    },
    filter: {
      control: {
        type: 'select',
        options: ['none', 'even', 'odd'],
      },
    },
    hideScrollbar: {
      control: {
        type: 'boolean',
      },
    },
  },
} as ComponentMeta<typeof WindowedList>;

interface DemoTemplateProps {
  rows: number;
  containerHeight: number;
  itemHeight: number;
  filter: 'none' | 'even' | 'odd';
  hideScrollbar: boolean;
}

const DemoTemplate: Story<DemoTemplateProps> = ({
  rows,
  containerHeight,
  itemHeight,
  filter,
  hideScrollbar,
}: DemoTemplateProps) => {
  const data = Array.from({ length: rows }, (_, i) => i);

  const getFilterFunction = () => {
    switch (filter) {
      case 'even':
        return (_: any, i: number) => i % 2 === 0;
      case 'odd':
        return (_: any, i: number) => i % 2 === 1;
      default:
        return () => true;
    }
  };

  return (
    <>
      <p>
        This component fills the parent and makes sure only visible items are
        kept in the DOM. You can experiment by changing the container's height
        and the data size.
      </p>
      <Box height={containerHeight} borderRadius={12} overflow="hidden">
        <WindowedList
          data={data}
          filter={getFilterFunction()}
          rowRenderer={(row, index) => (
            <Flex
              height={itemHeight}
              padding={12}
              alignItems="center"
              justifyContent="center"
              color="input"
              bg={index % 2 === 0 ? 'accent' : 'card'}
            >
              {row}
            </Flex>
          )}
          hideScrollbar={hideScrollbar}
        />
      </Box>
    </>
  );
};

export const Demo = DemoTemplate.bind({});
Demo.args = {
  rows: 100,
  containerHeight: 420,
  itemHeight: 50,
  filter: 'none',
  hideScrollbar: false,
};

export const Loading = () => (
  <Box height={420}>
    <WindowedList
      data={Array.from({ length: 10 }, (_, i) => i)}
      rowRenderer={() => (
        <Box py="4px">
          <Skeleton height={50} borderRadius={12} />
        </Box>
      )}
    />
  </Box>
);
