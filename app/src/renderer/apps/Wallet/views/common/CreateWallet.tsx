import { ChangeEvent, useState } from 'react';
import { useField, useForm } from 'mobx-easy-form';
import { observer } from 'mobx-react';

import { Button, Flex, Text, TextInput } from '@holium/design-system';

import { ChainType } from 'renderer/stores/models/wallet.model';
import { useShipStore } from 'renderer/stores/ship.store';

type Props = {
  network: ChainType;
};

type BodyProps = Props & {
  nickname: string;
  onChangeNickname: (e: ChangeEvent<HTMLInputElement>) => void;
  onClickCreate: () => void;
};

export const CreateWalletPresenterBody = ({
  network,
  nickname,
  onChangeNickname,
  onClickCreate,
}: BodyProps) => (
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

const CreateWalletPresenter = ({ network }: Props) => {
  const { walletStore } = useShipStore();
  const [_, setLoading] = useState(false);
  const form = useForm({
    async onSubmit({ values }) {
      if (form.computed.isDirty) {
        setLoading(true);
        try {
          console.log(`creating wallet ${values.nickname}`);
          await walletStore.createWallet(values.nickname);
          setLoading(false);
        } catch (reason) {
          console.error(reason);
          setLoading(false);
        }
      }
    },
  });

  const nickname = useField({
    id: 'nickname',
    form,
    initialValue: '',
    validate: (nickname: string) => {
      return nickname.length
        ? { parsed: nickname }
        : { error: 'Must enter nickname.' };
    },
  });

  return (
    <CreateWalletPresenterBody
      network={network}
      nickname={nickname.state.value}
      onChangeNickname={(e) => nickname.actions.onChange(e.target.value)}
      onClickCreate={form.actions.submit}
    />
  );
};

export const CreateWallet = observer(CreateWalletPresenter);
