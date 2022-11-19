import { ComponentMeta, Story } from '@storybook/react';
import { VirtualizedList } from './VirtualizedList';
import { Box } from '../Box/Box';
import { VirtualizedRowWithDynamicHeight } from './VirtualizedRowWithDynamicHeight';

export default {
  component: VirtualizedList,
  argTypes: {
    dataSize: {
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
    rowHeight: {
      control: {
        type: 'range',
        min: 10,
        max: 500,
        step: 1,
      },
    },
    filter: {
      control: {
        type: 'select',
        options: ['none', 'even', 'odd'],
      },
    },
  },
} as ComponentMeta<typeof VirtualizedList>;

interface DemoTemplateProps {
  dataSize: number;
  rowHeight: number;
  containerHeight: number;
  filter: 'none' | 'even' | 'odd';
}

const DemoTemplate: Story<DemoTemplateProps> = ({
  dataSize,
  rowHeight,
  containerHeight,
  filter,
  ...args
}: DemoTemplateProps) => {
  const data = Array.from({ length: dataSize }, (_, i) => i);

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
        <VirtualizedList
          {...args}
          data={data}
          filter={getFilterFunction()}
          renderRow={(item, index, rerenderList) => (
            <VirtualizedRowWithDynamicHeight
              height={rowHeight}
              rerenderList={rerenderList}
              bg={index % 2 === 0 ? 'accent' : 'card'}
              color="input"
              padding={12}
              justifyContent="center"
              alignItems="center"
            >
              {item}
            </VirtualizedRowWithDynamicHeight>
          )}
        />
      </Box>
    </>
  );
};

export const Demo = DemoTemplate.bind({});
Demo.args = {
  dataSize: 100,
  rowHeight: 50,
  containerHeight: 500,
  filter: 'none',
};
