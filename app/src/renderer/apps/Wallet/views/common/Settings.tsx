import { ChangeEvent, useState } from 'react';
import { observer } from 'mobx-react';
import { darken } from 'polished';
import { isValidPatp } from 'urbit-ob';
import { NoScrollBar } from 'renderer/components';
import {
  Flex,
  Text,
  Icon,
  Button,
  Select,
  Spinner,
} from '@holium/design-system';
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
import { DeletePasscode } from './DeletePasscode';

type WalletVisibility = 'anyone' | 'friends' | 'nobody';

enum SettingScreen {
  SETTINGS = 'settings',
  LOCAL = 'local',
  AGENT = 'agent',
}

const WalletSettingsPresenter = () => {
  const { walletApp } = useTrayApps();
  // const [providerInput, setProviderInput] = useState('');
  // const [providerError, setProviderError] = useState('');
  const [saving, setSaving] = useState(false);

  const network = walletApp.navState.network;
  const walletStore =
    network === 'ethereum' ? walletApp.ethereum : walletApp.bitcoin;
  const settings = walletStore.settings;
  const wallets = walletStore.list
    .map((wallet) => walletStore.wallets.get(wallet.key))
    .filter(Boolean);

  const [state, setState] = useState<UISettingsType>({
    ...settings,
    provider: settings.provider ?? '',
    blocked: [...walletApp.blacklist],
  });

  const { theme } = useServices();
  const baseTheme = getBaseTheme(theme.currentTheme);
  const selectBg = darken(0.025, theme.currentTheme.windowColor);

  // async function setProvider(newProviderURL: string) {
  //   setProviderInput(newProviderURL);
  //   if (newProviderURL === '') {
  //     setProviderError('');
  //     return;
  //   } else if (!validUrl.isUri(newProviderURL)) {
  //     setProviderError('Invalid URL.');
  //     return;
  //   }

  //   const validProvider = await WalletActions.checkProviderURL(newProviderURL);

  //   if (validProvider) {
  //     setState({
  //       ...state,
  //       provider: newProviderURL,
  //     });
  //     setProviderError('');
  //   } else {
  //     setProviderError('No valid provider found at that URL.');
  //   }
  // }

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
    <Flex
      width="100%"
      height="100%"
      flexDirection="column"
      justifyContent="space-between"
    >
      <Flex flexDirection="column">
        <Flex justifyContent="space-between" alignItems="center">
          <Flex alignItems="center">
            <Button.IconButton
              size={26}
              onClick={async () => await WalletActions.navigateBack()}
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
            // py={1}
            variant="minimal"
            fontWeight={400}
            disabled={saving}
            height={26}
            onClick={saveSettings}
          >
            {saving ? <Spinner size={0} color="#FFF" /> : 'Save'}
          </Button.Primary>
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
          <Text.Label>Address Creation Mode</Text.Label>
          <Text.Custom
            mt={1}
            mb={2}
            fontSize={1}
            opacity={0.8}
            color={baseTheme.colors.text.secondary}
          >
            If set to on-demand, anytime you're sent funds a new address will be
            created to receive them.
          </Text.Custom>
          <Flex width="140px">
            <Select
              id="wallet-creation-mode"
              backgroundColor={selectBg}
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
          <Text.Label>Wallet Visibility</Text.Label>
          <Text.Custom
            mt={1}
            mb={2}
            fontSize={1}
            opacity={0.8}
            color={baseTheme.colors.text.secondary}
          >
            Determine how you want to share addresses with other people on the
            network.
          </Text.Custom>
          <VisibilitySelect
            theme={theme}
            baseTheme={baseTheme}
            wallets={wallets as Wallets}
            sharingMode={state.sharingMode}
            defaultIndex={state.defaultIndex}
            walletCreationMode={state.walletCreationMode}
            onChange={setWalletVisibility}
          />
        </Flex>

        <Flex mt={3} flexDirection="column">
          <Text.Label mb={2}>Blocked IDs</Text.Label>
          <BlockedInput
            theme={theme}
            baseTheme={baseTheme}
            blocked={state.blocked}
            onChange={setBlockList}
          />
        </Flex>
      </Flex>
      <Flex flexDirection="column" mb={2}>
        <Button.TextButton
          height={32}
          fontWeight={500}
          color="intent-alert"
          onClick={() => {
            setSettingScreen(SettingScreen.LOCAL);
            // WalletActions.deleteLocalWallet()
          }}
        >
          Delete Local HD Wallet
        </Button.TextButton>
        <Text.Custom
          mt={2}
          mb={2}
          ml="2px"
          fontSize={2}
          opacity={0.8}
          color={baseTheme.colors.text.secondary}
        >
          Delete your HD wallet from local storage.
        </Text.Custom>
        <br />
        <Button.TextButton
          height={32}
          fontWeight={500}
          color="intent-alert"
          onClick={() => {
            setSettingScreen(SettingScreen.AGENT);
            // WalletActions.deleteShipWallet()
          }}
        >
          Delete Ship HD Wallet
        </Button.TextButton>
        <Text.Custom
          mt={2}
          mb={2}
          ml="2px"
          fontSize={2}
          opacity={0.8}
          color={baseTheme.colors.text.secondary}
        >
          Completely delete your HD wallet locally and remove all metadata from
          your Urbit.
        </Text.Custom>
      </Flex>
    </Flex>
  );
};

export const WalletSettings = observer(WalletSettingsPresenter);

type Wallets = { nickname: string; index: number }[];

interface VisibilitySelectProps {
  theme: any;
  baseTheme: any;
  onChange: (mode: WalletVisibility | SharingMode, index?: number) => void;
  sharingMode: SharingMode;
  defaultIndex: number;
  walletCreationMode: WalletCreationMode;
  wallets: Wallets;
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

  function visibilityChange(newVisibility: string) {
    ['anyone', 'friends'].includes(newVisibility)
      ? props.onChange(newVisibility as WalletVisibility, props.defaultIndex)
      : props.onChange(newVisibility as WalletVisibility);
  }

  return (
    <>
      <Flex width="140px">
        <Select
          id="wallet-visibility"
          backgroundColor={selectBg}
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
              backgroundColor={selectBg}
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
  // const blockButtonColor = props.baseTheme.colors.text.error;

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
          rightAdornment={
            <Button.TextButton
              // position="absolute"
              // top="9px"
              // right="12px"
              disabled={!isValidPatp(input)}
              fontWeight={500}
              color="intent-alert"
              // highlightColor={blockButtonColor}
              // color={blockButtonColor}
              onClick={block}
            >
              Block
            </Button.TextButton>
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
            <Text.Body>{patp}</Text.Body>
            <Button.IconButton onClick={() => props.onChange('remove', patp)}>
              <Icon name="Close" size={15} opacity={0.7} />
            </Button.IconButton>
          </Flex>
        ))}
      </NoScrollBar>
      {props.blocked.length > 3 && (
        <Flex pt={1} width="100%" justifyContent="center">
          <Icon name="ChevronDown" size={16} />
        </Flex>
      )}
    </Flex>
  );
}
