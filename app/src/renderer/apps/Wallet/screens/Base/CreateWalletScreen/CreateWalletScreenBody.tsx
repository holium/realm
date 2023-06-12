import { ChangeEvent } from 'react';

import { Button, Flex, Spinner, Text } from '@holium/design-system/general';
import { TextInput } from '@holium/design-system/inputs';

import { NetworkType } from 'os/services/ship/wallet/wallet.types';

type Props = {
  network: NetworkType;
  nickname: string;
  loading: boolean;
  onChangeNickname: (e: ChangeEvent<HTMLInputElement>) => void;
  onClickCreate: () => Promise<void>;
};

export const CreateWalletScreenBody = ({
  network,
  nickname,
  loading,
  onChangeNickname,
  onClickCreate,
}: Props) => (
  <Flex flex={1} flexDirection="column" gap="16px">
    <Text.H4>Create address</Text.H4>
    <Text.Body opacity={0.7}>
      A new {network === 'ethereum' ? 'Ethereum' : 'Bitcoin'} address will be
      created. Give it a memorable nickname.
    </Text.Body>
    <Flex flexDirection="column" gap="4px">
      <Text.Label>Nickname</Text.Label>
      <TextInput
        id="wallet-nickname"
        name="wallet-nickname"
        value={nickname}
        onChange={onChangeNickname}
        placeholder="Fort Knox"
      />
      <Button.Primary
        width="100%"
        mt="4px"
        justifyContent="center"
        disabled={loading}
        onClick={onClickCreate}
      >
        {loading ? <Spinner size={0} /> : 'Create'}
      </Button.Primary>
    </Flex>
  </Flex>
);
