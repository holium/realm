import { useState } from 'react';
import { useField, useForm } from 'mobx-easy-form';
import { observer } from 'mobx-react';

import { NetworkType } from 'os/services/ship/wallet/wallet.types';
import { useShipStore } from 'renderer/stores/ship.store';

import { CreateWalletScreenBody } from './CreateWalletScreenBody';

type Props = {
  network: NetworkType;
};

const CreateWalletScreenPresenter = ({ network }: Props) => {
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
    <CreateWalletScreenBody
      network={network}
      nickname={nickname.state.value}
      onChangeNickname={(e) => nickname.actions.onChange(e.target.value)}
      onClickCreate={form.actions.submit}
    />
  );
};

export const CreateWalletScreen = observer(CreateWalletScreenPresenter);
