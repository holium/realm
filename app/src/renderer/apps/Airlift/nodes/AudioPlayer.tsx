import { Flex } from '@holium/design-system';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const PlayButton = styled(motion.img)<{}>`
  /* Vector */

  position: absolute;
  left: 29.17%;
  right: 22.89%;
  top: 22.38%;
  bottom: 22.37%;

  /* .Icons */
  background: #09121f;
`;

export function AudioPlayer({ data, isConnectable }) {
  return (
    <Flex border={data.showDelete ? '2px solid red' : 'none'}>
      <PlayButton />
    </Flex>
  );
}
