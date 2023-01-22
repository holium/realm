import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Flex } from '../..';
import { Bubble } from './Bubble';

export default {
  component: Bubble,
} as ComponentMeta<typeof Bubble>;

export const Default: ComponentStory<typeof Bubble> = () => (
  <Flex gap={6} flexDirection="column" width={500}>
    <Bubble
      author="~fasnut-famden"
      authorColor="#FF0000"
      message={[
        {
          plain:
            'Yesterday, I wrote up a company handbook. Check it out and let me know',
        },
        { ship: '~lomder-librun' },
      ]}
    />
    <Bubble
      our
      author="~lomder-librun"
      message={[
        { plain: 'Yo we should do XYZ in' },
        { bold: 'bold' },
        { plain: 'and' },
        { italics: 'italics' },
      ]}
    />
    <Bubble
      our
      author="~lomder-librun"
      message={[
        { plain: 'Run the following command' },
        {
          'inline-code':
            'npx cross-env DEBUG_PROD=true yarn package:prerelease:mac',
        },
        { plain: 'and then let me know whats up' },
      ]}
    />
    <Bubble
      author="~fasnut-famden"
      authorColor="#FF0000"
      message={[
        {
          plain: 'I get this error',
        },
        {
          code: `
99% done plugins webpack-hot-middlewarewebpack built preview 643abb6f494255842d56 in 1968ms
webpack building...
99% done plugins webpack-hot-middlewarewebpack built preview c882f45221129543c371 in 2494ms
webpack building...
99% done plugins webpack-hot-middlewarewebpack built preview 4b80b9a66efd70ac5226 in 2279ms
          `,
        },
      ]}
    />
  </Flex>
);

export const Embeds: ComponentStory<typeof Bubble> = () => (
  <Flex gap={6} flexDirection="column" width={500}>
    <Bubble
      author="~fasnut-famden"
      authorColor="#FF0000"
      message={[
        {
          image:
            'https://pbs.twimg.com/media/FnC6z0VXkAA6XQe?format=png&name=small',
        },
      ]}
    />
    <Bubble
      our
      author="~lomder-librun"
      message={[
        { plain: 'Check this out' },
        {
          image:
            'https://pbs.twimg.com/media/FnFbARxXEAAoiuf?format=jpg&name=medium',
        },
      ]}
    />
  </Flex>
);
