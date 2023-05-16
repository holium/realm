import { useState } from 'react';
import { observer } from 'mobx-react';

import {
  Button,
  Flex,
  Icon,
  Spinner,
  Text,
} from '@holium/design-system/general';
import { Select } from '@holium/design-system/inputs';

import {
  SharingMode,
  WalletCreationMode,
} from 'os/services/ship/wallet/wallet.types';
import { UISettingsType } from 'renderer/stores/models/wallet.model';
import { useShipStore } from 'renderer/stores/ship.store';

import { BlockedInput } from '../components/BlockedInput';
import { DeletePasscode } from '../components/DeletePasscode';
import { VisibilitySelect } from '../components/VisibilitySelect';

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
    .filter(Boolean);

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
      <DeletePasscode onSuccess={deleteWallet} />
    </Flex>
  ) : (
    <Flex width="100%" height="100%" flexDirection="column" gap="12px">
      <Flex justifyContent="space-between" alignItems="center">
        <Flex alignItems="center">
          <Button.IconButton
            size={26}
            onClick={async () => await walletStore.navigateBack()}
          >
            <Icon name="ArrowLeftLine" size={24} opacity={0.7} />
          </Button.IconButton>
          <Text.Custom
            ml={2}
            opacity={0.8}
            textTransform="uppercase"
            fontWeight={600}
          >
            Settings
          </Text.Custom>
        </Flex>
        <Button.Primary
          variant="minimal"
          fontWeight={400}
          disabled={saving}
          height={26}
          onClick={saveSettings}
        >
          {saving ? <Spinner size={0} color="#FFF" /> : 'Save'}
        </Button.Primary>
      </Flex>
      <Flex flexDirection="column" gap="6px">
        <Text.Label>Address Creation Mode</Text.Label>
        <Text.Custom fontSize={1} opacity={0.8}>
          If set to on-demand, anytime you're sent funds a new address will be
          created to receive them.
        </Text.Custom>
        <Flex width="140px">
          <Select
            id="wallet-creation-mode"
            options={[
              { label: 'Default', value: 'default' },
              { label: 'On-demand', value: 'on-demand' },
            ]}
            selected={state.walletCreationMode}
            onClick={setCreationMode}
          />
        </Flex>
      </Flex>

      <Flex flexDirection="column" gap="6px">
        <Text.Label>Wallet Visibility</Text.Label>
        <Text.Custom fontSize={1} opacity={0.8}>
          Determine how you want to share addresses with other people on the
          network.
        </Text.Custom>
        <VisibilitySelect
          wallets={wallets as any}
          sharingMode={state.sharingMode}
          defaultIndex={state.defaultIndex}
          walletCreationMode={state.walletCreationMode}
          onChange={setWalletVisibility}
        />
      </Flex>

      <Flex flexDirection="column" gap="6px">
        <Text.Label>Blocked IDs</Text.Label>
        <BlockedInput blocked={state.blocked} onChange={setBlockList} />
      </Flex>

      <Flex flexDirection="column" gap="6px">
        <Text.Label>Delete locally</Text.Label>
        <Text.Custom fontSize={2} opacity={0.8}>
          Delete your HD wallet from local storage.
        </Text.Custom>
        <Button.TextButton
          height={32}
          fontWeight={500}
          color="intent-alert"
          onClick={() => {
            setSettingScreen(SettingScreen.LOCAL);
            // WalletActions.deleteLocalWallet()
          }}
        >
          Delete
        </Button.TextButton>
      </Flex>
      <Flex flexDirection="column" gap="6px">
        <Text.Label>Delete completely</Text.Label>
        <Text.Custom fontSize={2} opacity={0.8}>
          Completely delete your HD wallet locally and remove all metadata from
          your Urbit.
        </Text.Custom>
        <Button.TextButton
          height={32}
          fontWeight={500}
          color="intent-alert"
          onClick={() => {
            setSettingScreen(SettingScreen.AGENT);
            // WalletActions.deleteShipWallet()
          }}
        >
          Delete
        </Button.TextButton>
      </Flex>
    </Flex>
  );
};

export const WalletSettingsScreen = observer(WalletSettingsScreenPresenter);
