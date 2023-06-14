import { observer } from 'mobx-react';

import { useShipStore } from 'renderer/stores/ship.store';

import { WalletScreen } from '../../../types';
import { ForgotPasscodeScreenBody } from './ForgotPasscodeScreenBody';

const ForgotPasscodeScreenPresenter = () => {
  const { walletStore } = useShipStore();

  const onClickDelete = () => {
    return walletStore.deleteShipWallet();
  };

  const onClickCancel = () => {
    return walletStore.navigate(WalletScreen.LOCKED);
  };

  return (
    <ForgotPasscodeScreenBody
      onClickCancel={onClickCancel}
      onClickDelete={onClickDelete}
    />
  );
};

export const ForgotPasscodeScreen = observer(ForgotPasscodeScreenPresenter);
