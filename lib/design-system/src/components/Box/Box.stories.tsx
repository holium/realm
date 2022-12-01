import { ComponentStory, ComponentMeta } from '@storybook/react';
import { useState } from 'react';
import { Box } from './Box';

export default {
  component: Box,
} as ComponentMeta<typeof Box>;

export const Demo: ComponentStory<typeof Box> = () => {
  const [show, setShow] = useState(true);

  const toggleShow = () => {
    setShow((prev) => !prev);
  };

  return (
    <>
      <Box
        mb={2}
        color="base"
        variants={{
          enter: { opacity: 1 },
          exit: { opacity: 0 },
        }}
        animate={show ? 'enter' : 'exit'}
      >
        I'm using --rlm-base-color
      </Box>
      <button onClick={toggleShow}>
        Click me to animate with framer-motion!
      </button>
    </>
  );
};
