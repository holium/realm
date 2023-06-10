import { Avatar, Flex, Icon, Text } from '@holium/design-system/general';

import { TransactionRecipient } from '../../types';

type Props = {
  transactionRecipient: TransactionRecipient | null;
};

export const TransactionRecipientInfo = ({ transactionRecipient }: Props) => {
  if (!transactionRecipient) return null;

  return (
    <Flex justifyContent="center">
      {!transactionRecipient.patp && transactionRecipient.address && (
        <Flex gap="8px" justifyContent="center">
          <Icon name="Spy" size="20px" />
          {/* <Text.Body style={{ lineHeight: '20px' }}>
            {shortened(transactionRecipient.address)}
          </Text.Body> */}
        </Flex>
      )}
      {transactionRecipient.patp && transactionRecipient.address && (
        <Flex gap="8px" alignItems="center">
          <Avatar
            sigilColor={[transactionRecipient.color || 'black', 'white']}
            simple={true}
            size={24}
            patp={transactionRecipient.patp}
          />
          <Flex flexDirection="column" justifyContent="center">
            <Text.Body variant="body">{transactionRecipient.patp}</Text.Body>
            {/* <Text.Body variant="body">
              {shortened(transactionRecipient.address)}
            </Text.Body> */}
          </Flex>
        </Flex>
      )}
    </Flex>
  );
};
