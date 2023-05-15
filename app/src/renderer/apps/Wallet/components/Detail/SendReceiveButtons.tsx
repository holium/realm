import { Box, Flex } from '@holium/design-system/general';

import { CircleButton } from '../CircleButton';

type Props = {
  hidden: boolean;
  send: () => void;
  receive: () => void;
};

export const SendReceiveButtons = ({ hidden, send, receive }: Props) => (
  <Box width="100%" hidden={hidden}>
    <Flex mt="12px" width="100%" justifyContent="center" alignItems="center">
      <Box mr="16px" onClick={receive}>
        <CircleButton icon="Receive" title="Receive" />
      </Box>
      <Box onClick={send}>
        <CircleButton icon="Send" title="Send" />
      </Box>
    </Flex>
  </Box>
);
