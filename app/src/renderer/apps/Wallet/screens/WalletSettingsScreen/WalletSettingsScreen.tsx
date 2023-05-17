import { useState } from 'react';
import { observer } from 'mobx-react';

import { Button, Flex, Icon } from '@holium/design-system/general';

import {
  SharingMode,
  WalletCreationMode,
} from 'os/services/ship/wallet/wallet.types';
import {
  BitcoinWalletType,
  EthWalletType,
  UISettingsType,
} from 'renderer/stores/models/wallet.model';
import { useShipStore } from 'renderer/stores/ship.store';

import { DeletePasscode } from '../../components/DeletePasscode';
import { WalletSettingsScreenBody } from './WalletSettingsScreenBody';

enum SettingScreen {
  SETTINGS = 'settings',
  LOCAL = 'local',
  AGENT = 'agent',
}

const WalletSettingsScreenPresenter = () => {
  const { walletStore } = useShipStore();
  // const [providerInput, setProviderInput] = useState('');
  // const [providerError, setProviderError] = useState('');
  const [saving, setSaving] = useState(false);

  const network = walletStore.navState.network;
  const walletNetworkStore =
    network === 'ethereum' ? walletStore.ethereum : walletStore.bitcoin;
  const settings = walletNetworkStore.settings;
  const wallets = walletNetworkStore.list
    .map((wallet) => walletNetworkStore.wallets.get(wallet.key))
    .filter(Boolean) as (BitcoinWalletType | EthWalletType)[];

  const [state, setState] = useState<UISettingsType>({
    ...settings,
    provider: settings.provider ?? '',
    blocked: [...walletStore.blacklist],
  });

  function setCreationMode(newMode: string) {
    setState({ ...state, walletCreationMode: newMode as WalletCreationMode });
  }

  function setWalletVisibility(sharingMode: string, defaultIndex?: number) {
    setState({
      ...state,
      sharingMode: sharingMode as SharingMode,
      defaultIndex: defaultIndex === undefined ? 0 : defaultIndex,
    });
  }

  function setBlockList(action: 'add' | 'remove', patp: string) {
    const currentList = state.blocked;
    if (action === 'add' && !currentList.includes(patp)) {
      currentList.push(patp);
    }

    if (action === 'remove' && currentList.includes(patp)) {
      const patpIndex = currentList.findIndex((val) => val === patp);
      currentList.splice(patpIndex, 1);
    }

    setState({ ...state, blocked: currentList });
  }

  async function saveSettings() {
    setSaving(true);
    const { walletCreationMode, sharingMode, defaultIndex, provider, blocked } =
      state;
    await walletStore.setSettings(network, {
      provider,
      walletCreationMode,
      sharingMode,
      defaultIndex,
      blocked,
    });
    setSaving(false);
    walletStore.navigateBack();
  }

  const [settingScreen, setSettingScreen] = useState<SettingScreen>(
    SettingScreen.SETTINGS
  );
  const deleteWallet = (passcode: number[]) => {
    if (settingScreen === SettingScreen.LOCAL) {
      walletStore.deleteLocalWallet(passcode);
    } else if (settingScreen === SettingScreen.AGENT) {
      walletStore.deleteShipWallet(passcode);
    }
  };

  return settingScreen !== SettingScreen.SETTINGS ? (
    <Flex width="100%" height="100%" flexDirection="column">
      <Flex justifyContent="space-between" alignItems="center">
        <Flex alignItems="center" gap={8}>
          <Button.IconButton
            size={26}
            onClick={() => setSettingScreen(SettingScreen.SETTINGS)}
          >
            <Icon name="ArrowLeftLine" size={24} opacity={0.7} />
          </Button.IconButton>
        </Flex>
      </Flex>
      <DeletePasscode
        checkPasscode={walletStore.checkPasscode}
        onSuccess={deleteWallet}
      />
    </Flex>
  ) : (
    <WalletSettingsScreenBody
      wallets={wallets}
      saving={saving}
      creationMode={state.walletCreationMode}
      onClickCreationMode={setCreationMode}
      blocked={state.blocked}
      onChangeBlockList={setBlockList}
      sharingMode={state.sharingMode}
      defaultIndex={state.defaultIndex}
      walletCreationMode={state.walletCreationMode}
      setWalletVisibility={setWalletVisibility}
      onClickDeleteLocally={() => setSettingScreen(SettingScreen.LOCAL)}
      onClickDeleteCompletely={() => setSettingScreen(SettingScreen.AGENT)}
      onClickBack={walletStore.navigateBack}
      onClickSaveSettings={saveSettings}
    />
  );
};

export const WalletSettingsScreen = observer(WalletSettingsScreenPresenter);
