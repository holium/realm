import { useField, useForm } from 'mobx-easy-form';
import { observer } from 'mobx-react';

import { useToggle } from '@holium/design-system/util';

import { NetworkType } from 'os/services/ship/wallet/wallet.types';
import { useShipStore } from 'renderer/stores/ship.store';

import { CreateWalletScreenBody } from './CreateWalletScreenBody';

type Props = {
  network: NetworkType;
};

const CreateWalletScreenPresenter = ({ network }: Props) => {
  const { walletStore } = useShipStore();
  const loading = useToggle(false);

  const form = useForm({
    async onSubmit({ values }) {
      if (form.computed.isDirty) {
        loading.toggleOn();
        try {
          console.log(`creating wallet ${values.nickname}`);
          await walletStore.createWallet(values.nickname);
        } catch (reason) {
          console.error(reason);
        } finally {
          loading.toggleOff();
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
      loading={loading.isOn}
      nickname={nickname.state.value}
      onChangeNickname={(e) => nickname.actions.onChange(e.target.value)}
      onClickCreate={form.actions.submit}
    />
  );
};

export const CreateWalletScreen = observer(CreateWalletScreenPresenter);
