import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Card } from './Card';

export default {
  component: Card,
} as ComponentMeta<typeof Card>;

export const Demo: ComponentStory<typeof Card> = () => (
  <>
    <Card p={2} borderRadius={9} elevation={1}>
      <div> Hello card </div>
    </Card>
    <div style={{ marginTop: 10 }} />
    <Card fill p={4} borderRadius={9} elevation={1}>
      <div> Fill width more padding </div>
    </Card>
  </>
);
