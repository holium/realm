import { ChangeEvent } from 'react';

import { Button, Flex, Text } from '@holium/design-system/general';
import { TextInput } from '@holium/design-system/inputs';

import { NetworkType } from 'os/services/ship/wallet/wallet.types';

type Props = {
  network: NetworkType;
  nickname: string;
  onChangeNickname: (e: ChangeEvent<HTMLInputElement>) => void;
  onClickCreate: () => void;
};

export const CreateWalletScreenBody = ({
  network,
  nickname,
  onChangeNickname,
  onClickCreate,
}: Props) => (
  <Flex p={1} height="100%" width="100%" flexDirection="column" gap={20}>
    <Text.H4 mt={2} variant="h4">
      Create Address
    </Text.H4>
    <Text.Body mt={3} variant="body">
      A new {network === 'ethereum' ? 'Ethereum' : 'Bitcoin'} address will be
      created. Give it a memorable nickname.
    </Text.Body>
    <Flex flexDirection="column" gap={10}>
      <Text.Label mb={1}>Nickname</Text.Label>
      <TextInput
        id="wallet-nickname"
        name="wallet-nickname"
        value={nickname}
        onChange={onChangeNickname}
        placeholder="Fort Knox"
      />
    </Flex>
    <Flex width="100%">
      <Button.TextButton id="submit" width="100%" onClick={onClickCreate}>
        Create
      </Button.TextButton>
    </Flex>
  </Flex>
);
