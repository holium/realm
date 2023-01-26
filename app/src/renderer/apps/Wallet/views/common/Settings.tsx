import { ChangeEvent, FC, useState } from 'react';
import { observer } from 'mobx-react';
import validUrl from 'valid-url';
// import _ from 'lodash';
import { darken } from 'polished';
import { isValidPatp } from 'urbit-ob';

import {
  Flex,
  Text,
  Select,
  Icons,
  Button,
  IconButton,
  TextButton,
  NoScrollBar,
} from 'renderer/components';
import { TextInput } from '@holium/design-system';
import { useServices } from 'renderer/logic/store';
import { getBaseTheme } from '../../lib/helpers';
import { useTrayApps } from 'renderer/apps/store';
import { WalletActions } from 'renderer/logic/actions/wallet';
import {
  WalletCreationMode,
  SharingMode,
  UISettingsType,
} from 'os/services/tray/wallet-lib/wallet.model';
import DeletePasscode from './DeletePasscode';

type WalletVisibility = 'anyone' | 'friends' | 'nobody';

enum SettingScreen {
  SETTINGS = 'settings',
  LOCAL = 'local',
  AGENT = 'agent',
}

export const WalletSettings: FC = observer(() => {
  const { walletApp } = useTrayApps();
  const [providerInput, setProviderInput] = useState('');
  const [providerError, setProviderError] = useState('');
  const [saving, setSaving] = useState(false);

  const network = walletApp.navState.network;
  const walletStore =
    network === 'ethereum' ? walletApp.ethereum : walletApp.bitcoin;
  const settings = walletStore.settings;
  const wallets = walletStore.list.map(
    (wallet) => walletStore.wallets.get(wallet.key)!
  )!;

  const [state, setState] = useState<UISettingsType>({
    ...settings,
    provider: settings.provider!,
    blocked: [...walletApp.blacklist],
  });

  const { theme } = useServices();
  const baseTheme = getBaseTheme(theme.currentTheme);
  const selectBg = darken(0.025, theme.currentTheme.windowColor);

  async function setProvider(newProviderURL: string) {
    setProviderInput(newProviderURL);
    if (newProviderURL === '') {
      setProviderError('');
      return;
    } else if (!validUrl.isUri(newProviderURL)) {
      setProviderError('Invalid URL.');
      return;
    }

    const validProvider = await WalletActions.checkProviderURL(newProviderURL);

    if (validProvider) {
      setState({
        ...state,
        provider: newProviderURL,
      });
      setProviderError('');
    } else {
      setProviderError('No valid provider found at that URL.');
    }
  }

  function setCreationMode(newMode: WalletCreationMode) {
    setState({ ...state, walletCreationMode: newMode });
  }

  function setWalletVisibility(
    sharingMode: SharingMode,
    defaultIndex?: number
  ) {
    setState({
      ...state,
      sharingMode,
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
    await WalletActions.setSettings(network, {
      provider,
      walletCreationMode,
      sharingMode,
      defaultIndex,
      blocked,
    });
    setSaving(false);
    WalletActions.navigateBack();
  }

  const [settingScreen, setSettingScreen] = useState<SettingScreen>(
    SettingScreen.SETTINGS
  );
  const deleteWallet = (passcode: number[]) => {
    if (settingScreen === SettingScreen.LOCAL) {
      WalletActions.deleteLocalWallet(passcode);
    } else if (settingScreen === SettingScreen.AGENT) {
      WalletActions.deleteShipWallet(passcode);
    }
  };

  return settingScreen !== SettingScreen.SETTINGS ? (
    <Flex px={3} width="100%" height="100%" flexDirection="column">
      <Flex justifyContent="space-between" alignItems="center" pt={3}>
        <Flex alignItems="center" gap={8}>
          <IconButton onClick={() => setSettingScreen(SettingScreen.SETTINGS)}>
            <Icons
              name="ArrowLeftLine"
              size={1}
              color={theme.currentTheme.iconColor}
            />
          </IconButton>
        </Flex>
      </Flex>
      <DeletePasscode onSuccess={deleteWallet} />
    </Flex>
  ) : (
    <Flex px={3} width="100%" height="100%" flexDirection="column">
      <Flex justifyContent="space-between" alignItems="center" pt={3}>
        <Flex alignItems="center" gap={8}>
          <IconButton onClick={async () => await WalletActions.navigateBack()}>
            <Icons
              name="ArrowLeftLine"
              size={1}
              color={theme.currentTheme.iconColor}
            />
          </IconButton>
          <Text variant="h5">Settings</Text>
        </Flex>
        <Button
          py={1}
          variant="minimal"
          fontWeight={400}
          isLoading={saving}
          onClick={saveSettings}
        >
          Save
        </Button>
      </Flex>

      {/*<Flex mt={3} flexDirection="column" width="100%">
        <Text variant="label">Provider</Text>
        <Text
          mt={1}
          mb={2}
          variant="body"
          fontSize={1}
          opacity={0.8}
          color={baseTheme.colors.text.secondary}
        >
          The API endpoint for connecting to Ethereum nodes.
        </Text>
        <TextInput
          id="wallet-provider"
          name="wallet-provider"
          placeholder="http://localhost:8545"
          value={providerInput}
          onChange={async (e: ChangeEvent<HTMLInputElement>) =>
            await setProvider(e.target.value)
          }
        />
        <Box hidden={!providerError}>
          <Text
            mt={1}
            variant="body"
            fontSize={1}
            color={baseTheme.colors.text.error}
          >
            {providerError}
          </Text>
        </Box>
        </Flex>*/}

      <Flex mt={3} flexDirection="column">
        <Text variant="label">Address Creation Mode</Text>
        <Text
          mt={1}
          mb={2}
          variant="body"
          fontSize={1}
          opacity={0.8}
          color={baseTheme.colors.text.secondary}
        >
          If set to on-demand, anytime you're sent funds a new address will be
          created to receive them.
        </Text>
        <Flex width="140px">
          <Select
            id="wallet-creation-mode"
            customBg={selectBg}
            textColor={baseTheme.colors.text.primary}
            iconColor={theme.currentTheme.iconColor}
            options={[
              { label: 'Default', value: 'default' },
              { label: 'On-demand', value: 'on-demand' },
            ]}
            selected={state.walletCreationMode}
            onClick={setCreationMode}
          />
        </Flex>
      </Flex>

      <Flex mt={3} flexDirection="column">
        <Text variant="label">Wallet Visibility</Text>
        <Text
          mt={1}
          mb={2}
          variant="body"
          fontSize={1}
          opacity={0.8}
          color={baseTheme.colors.text.secondary}
        >
          Determine how you want to share addresses with other people on the
          network.
        </Text>
        <VisibilitySelect
          theme={theme}
          baseTheme={baseTheme}
          wallets={wallets}
          sharingMode={state.sharingMode}
          defaultIndex={state.defaultIndex}
          walletCreationMode={state.walletCreationMode}
          onChange={setWalletVisibility}
        />
      </Flex>

      <Flex mt={3} flexDirection="column">
        <Text mb={2} variant="label">
          Blocked IDs
        </Text>
        <BlockedInput
          theme={theme}
          baseTheme={baseTheme}
          blocked={state.blocked}
          onChange={setBlockList}
        />
      </Flex>
      <TextButton
        highlightColor="#EC415A"
        showBackground
        textColor="#EC415A"
        style={{ fontWeight: 400 }}
        onClick={() => {
          setSettingScreen(SettingScreen.LOCAL);
          // WalletActions.deleteLocalWallet()
        }}
      >
        Delete Local HD Wallet
      </TextButton>
      <Text
        mt={1}
        mb={2}
        variant="body"
        fontSize={1}
        opacity={0.8}
        color={baseTheme.colors.text.secondary}
      >
        Delete your encrypted mnemonic from local storage.
      </Text>
      <br />
      <TextButton
        highlightColor="#EC415A"
        showBackground
        textColor="#EC415A"
        style={{ fontWeight: 400 }}
        onClick={() => {
          setSettingScreen(SettingScreen.AGENT);
          // WalletActions.deleteShipWallet()
        }}
      >
        Delete Ship HD Wallet
      </TextButton>
      <Text
        mt={1}
        mb={2}
        variant="body"
        fontSize={1}
        opacity={0.8}
        color={baseTheme.colors.text.secondary}
      >
        Completely delete your HD wallet locally and on your ship.
      </Text>
    </Flex>
  );
});

export default WalletSettings;

interface VisibilitySelectProps {
  theme: any;
  baseTheme: any;
  onChange: any;
  sharingMode: SharingMode;
  defaultIndex: number;
  walletCreationMode: WalletCreationMode;
  wallets: Array<{ nickname: string; index: number }>;
}
function VisibilitySelect(props: VisibilitySelectProps) {
  const selectBg = darken(0.025, props.theme.currentTheme.windowColor);

  const visibilityOptions = [
    { label: 'Anybody', value: SharingMode.ANYBODY },
    { label: 'Friends only', value: SharingMode.FRIENDS },
    { label: 'Nobody', value: SharingMode.NOBODY },
  ];
  const sharedWalletOptions = props.wallets.map((wallet) => ({
    label: wallet.nickname,
    value: wallet.index.toString(),
  }));

  function visibilityChange(newVisibility: WalletVisibility) {
    ['anyone', 'friends'].includes(newVisibility)
      ? props.onChange(newVisibility, props.defaultIndex)
      : props.onChange(newVisibility);
  }

  return (
    <>
      <Flex width="140px">
        <Select
          id="wallet-visibility"
          customBg={selectBg}
          textColor={props.baseTheme.colors.text.primary}
          iconColor={props.theme.currentTheme.iconColor}
          options={visibilityOptions}
          selected={props.sharingMode}
          onClick={visibilityChange}
        />
      </Flex>
      <Flex mt={1} width="220px">
        {['anyone', 'friends'].includes(props.sharingMode) &&
          props.walletCreationMode !== WalletCreationMode.ON_DEMAND && (
            <Select
              id="wallet-default"
              customBg={selectBg}
              textColor={props.baseTheme.colors.text.primary}
              iconColor={props.theme.currentTheme.iconColor}
              options={sharedWalletOptions}
              selected={props.defaultIndex.toString() || Number(0).toString()}
              onClick={(newAddress) =>
                props.onChange(props.sharingMode, Number(newAddress))
              }
            />
          )}
      </Flex>
    </>
  );
}

interface BlockedInputProps {
  theme: any;
  baseTheme: any;
  blocked: string[];
  onChange: any;
}
function BlockedInput(props: BlockedInputProps) {
  const [input, setInput] = useState('');
  const blockButtonColor = props.baseTheme.colors.text.error;

  function block() {
    if (isValidPatp(input)) {
      props.onChange('add', input);
      setInput('');
    }
  }

  return (
    <Flex flexDirection="column">
      <Flex display="inline-block" mb={1} position="relative">
        <TextInput
          id="blocked-input"
          name="blocked-input"
          pr="36px"
          spellCheck={false}
          placeholder="~tasdul-tasdul"
          value={input}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setInput(e.target.value)
          }
          rightInteractive
          rightAdornment={
            <TextButton
              // position="absolute"
              // top="9px"
              // right="12px"
              disabled={!isValidPatp(input)}
              highlightColor={blockButtonColor}
              textColor={blockButtonColor}
              onClick={block}
            >
              Block
            </TextButton>
          }
        />
      </Flex>
      <NoScrollBar
        height="70px"
        width="100%"
        flexDirection="column"
        margin="auto"
        overflow="auto"
      >
        {props.blocked.map((patp) => (
          <Flex
            mt={1}
            width="100%"
            px={2}
            alignItems="center"
            justifyContent="space-between"
            key={patp}
          >
            <Text variant="body">{patp}</Text>
            <IconButton onClick={() => props.onChange('remove', patp)}>
              <Icons
                name="Close"
                size="15px"
                color={props.theme.currentTheme.iconColor}
              />
            </IconButton>
          </Flex>
        ))}
      </NoScrollBar>
      {props.blocked.length > 3 && (
        <Flex pt={1} width="100%" justifyContent="center">
          <Icons
            name="ChevronDown"
            size={1}
            color={props.theme.currentTheme.iconColor}
          />
        </Flex>
      )}
    </Flex>
  );
}
