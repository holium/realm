import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Flex, Icon, Button, Input } from '../..';
import { InputBox } from '.';

export default {
  component: InputBox,
} as ComponentMeta<typeof InputBox>;

export const Default: ComponentStory<typeof InputBox> = (args) => (
  <InputBox {...args}>
    <input id="inline-label-input" type="text" placeholder="Placeholder here" />
  </InputBox>
);

Default.args = {
  inputId: 'inline-label-input',
};

export const InlineLabel: ComponentStory<typeof InputBox> = () => (
  <Flex flexDirection="column" gap={12}>
    <InputBox inputId="inline-label-input-1" label="Horizontal label">
      <Input
        id="inline-label-input-1"
        type="text"
        placeholder="Placeholder here"
      />
    </InputBox>

    <InputBox
      inputId="inline-label-input-2"
      inlineLabelDirection="column"
      label="Vertical label"
    >
      <input
        id="inline-label-input-2"
        type="text"
        placeholder="Placeholder here"
      />
    </InputBox>
  </Flex>
);

export const LeftAdornment: ComponentStory<typeof InputBox> = () => (
  <>
    <InputBox
      width={200}
      leftAdornment={<Icon name="Search" />}
      inputId="input-2"
    >
      <input id="input-2" tabIndex={1} placeholder="Placeholder here" />
    </InputBox>
  </>
);

export const RightAdornment: ComponentStory<typeof InputBox> = () => (
  <>
    <InputBox
      width={200}
      rightAdornment={<Icon name="Search" />}
      inputId="input-2"
    >
      <input id="input-2" tabIndex={1} placeholder="Placeholder here" />
    </InputBox>
  </>
);

export const RightButton: ComponentStory<typeof InputBox> = () => (
  <>
    <InputBox
      width={300}
      rightInteractive
      rightAdornment={
        <Button.TextButton
          onClick={() => {
            console.log('clicked');
          }}
        >
          Button
        </Button.TextButton>
      }
      inputId="input-2"
    >
      <input id="input-2" tabIndex={1} placeholder="Placeholder here" />
    </InputBox>
  </>
);

export const Error: ComponentStory<typeof InputBox> = () => (
  <>
    <InputBox inputId="input-3" error="Not valid input">
      <input id="input-3" tabIndex={1} placeholder="Placeholder here" />
    </InputBox>
  </>
);
