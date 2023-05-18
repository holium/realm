import { Flex } from '@holium/design-system/general';

import { CircleButton } from '../CircleButton';

type Props = {
  send: () => void;
  receive: () => void;
};

export const SendReceiveButtons = ({ send, receive }: Props) => (
  <Flex width="100%" justifyContent="center" gap="4px">
    <CircleButton icon="Receive" title="Receive" onClick={receive} />
    <CircleButton icon="Send" title="Send" onClick={send} />
  </Flex>
);
