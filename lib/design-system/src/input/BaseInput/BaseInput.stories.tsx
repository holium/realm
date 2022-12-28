import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Flex, Icon, TextButton } from '../../';
import { BaseInput } from './BaseInput';

export default {
  component: BaseInput,
} as ComponentMeta<typeof BaseInput>;

export const Default: ComponentStory<typeof BaseInput> = (args) => (
  <BaseInput {...args}>
    <input id="inline-label-input" type="text" placeholder="Placeholder here" />
  </BaseInput>
);

Default.args = {
  inputId: 'inline-label-input',
};

export const InlineLabel: ComponentStory<typeof BaseInput> = () => (
  <Flex flexDirection="column" gap={12}>
    <BaseInput inputId="inline-label-input-1" label="Horizontal label">
      <input
        id="inline-label-input-1"
        type="text"
        placeholder="Placeholder here"
      />
    </BaseInput>

    <BaseInput
      inputId="inline-label-input-2"
      inlineLabelDirection="column"
      label="Vertical label"
    >
      <input
        id="inline-label-input-2"
        type="text"
        placeholder="Placeholder here"
      />
    </BaseInput>
  </Flex>
);

export const LeftAdornment: ComponentStory<typeof BaseInput> = () => (
  <>
    <BaseInput
      width={200}
      leftAdornment={<Icon name="Search" />}
      inputId="input-2"
    >
      <input id="input-2" tabIndex={1} placeholder="Placeholder here" />
    </BaseInput>
  </>
);

export const RightAdornment: ComponentStory<typeof BaseInput> = () => (
  <>
    <BaseInput
      width={200}
      rightAdornment={<Icon name="Search" />}
      inputId="input-2"
    >
      <input id="input-2" tabIndex={1} placeholder="Placeholder here" />
    </BaseInput>
  </>
);

export const RightButton: ComponentStory<typeof BaseInput> = () => (
  <>
    <BaseInput
      width={300}
      rightInteractive
      rightAdornment={<TextButton>Button</TextButton>}
      inputId="input-2"
    >
      <input id="input-2" tabIndex={1} placeholder="Placeholder here" />
    </BaseInput>
  </>
);

export const Error: ComponentStory<typeof BaseInput> = () => (
  <>
    <BaseInput inputId="input-3" error="Not valid input">
      <input id="input-3" tabIndex={1} placeholder="Placeholder here" />
    </BaseInput>
  </>
);
