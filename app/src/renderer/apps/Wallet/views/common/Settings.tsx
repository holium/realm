import { FC, useState } from 'react';
import { observer } from 'mobx-react';
import { types } from 'mobx-state-tree';
import validUrl from 'valid-url';
import _ from 'lodash';
import styled from 'styled-components';
import { darken, lighten } from 'polished';
import { isValidPatp } from 'urbit-ob';

import {
  Flex,
  Input,
  Text,
  Select,
  Icons,
  Box,
  Button,
} from 'renderer/components';
import { useServices } from 'renderer/logic/store';
import { getBaseTheme } from '../../lib/helpers';
import { useTrayApps } from 'renderer/apps/store';
import { WalletActions } from 'renderer/logic/actions/wallet';
import {
  WalletView,
  WalletCreationMode,
  SharingMode,
  UISettingsType,
} from 'os/services/tray/wallet.model';

const NoScrollBar = styled(Flex)`
  ::-webkit-scrollbar {
    display: none;
  }
`;

type CreateMode = 'default' | 'on-demand';
type WalletVisibility = 'anyone' | 'friends' | 'nobody';

interface WalletSettingsState {
  provider: string;
  creationMode: CreateMode;
  visibility: WalletVisibility;
  sharedWallet?: string;
  blockList: string[];
}

const INIT_STATE = {
  provider: 'https://goerli.infura.io/v3/da1d4486d1254ddd',
  creationMode: 'default' as CreateMode,
  visibility: 'anyone' as WalletVisibility,
  blockList: ['~latter-bolden', '~hex'],
};

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
    blocked: [...settings.blocked],
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

    let validProvider = await WalletActions.checkProviderURL(newProviderURL);

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
    let currentList = state.blocked;
    if (action === 'add' && !currentList.includes(patp)) {
      currentList.push(patp);
    }

    if (action === 'remove' && currentList.includes(patp)) {
      let patpIndex = currentList.findIndex((val) => val === patp);
      currentList.splice(patpIndex, 1);
    }

    setState({ ...state, blocked: currentList });
  }

  async function saveSettings() {
    setSaving(true);
    let { walletCreationMode, sharingMode, defaultIndex, provider, blocked } =
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

  return (
    <Flex px={3} width="100%" height="100%" flexDirection="column">
      <Flex>
        <Text variant="h4">Settings</Text>
      </Flex>

      <Flex mt={3} flexDirection="column" width="100%">
        <Text variant="h6">Provider</Text>
        <Text
          mt={1}
          mb={2}
          variant="body"
          fontSize={1}
          color={baseTheme.colors.text.secondary}
        >
          The API endpoint for connecting to Ethereum nodes.
        </Text>
        <Input
          placeholder="https://goerli.infura.io/v3/da1d4486d1254ddd"
          value={providerInput}
          onChange={(e) => setProvider(e.target.value)}
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
      </Flex>

      <Flex mt={3} flexDirection="column">
        <Text variant="h6">Wallet Creation Mode</Text>
        <Text
          mt={1}
          mb={2}
          variant="body"
          fontSize={1}
          color={baseTheme.colors.text.secondary}
        >
          If set to on-demand, anytime you're sent funds a new wallet will be
          created to receive them.
        </Text>
        <Flex width="160px">
          <Select
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
        <Text variant="h6">Wallet Visibility</Text>
        <Text
          mt={1}
          mb={2}
          variant="body"
          fontSize={1}
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
        <Text mb={2} variant="h6">
          Blocked IDs
        </Text>
        <BlockedInput
          theme={theme}
          baseTheme={baseTheme}
          blocked={state.blocked}
          onChange={setBlockList}
        />
      </Flex>

      <Flex
        position="absolute"
        top="582px"
        zIndex={999}
        width="100%"
        justifyContent="space-between"
      >
        <Flex onClick={() => WalletActions.navigateBack()}>
          <Icons
            name="ArrowLeftLine"
            size={2}
            color={theme.currentTheme.iconColor}
          />
        </Flex>
        <Flex position="absolute" bottom="1px" right="28px">
          <Button
            variant="primary"
            disabled={
              providerError !== '' ||
              (_.isEqual(state, settings) &&
                _.isEqual(state.blocked, [...settings.blocked]))
            }
            isLoading={saving}
            onClick={saveSettings}
          >
            Save
          </Button>
        </Flex>
      </Flex>
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
  wallets: { nickname: string; index: number }[];
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
      <Flex width="160px">
        <Select
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
  const blockButtonColor = isValidPatp(input)
    ? props.baseTheme.colors.text.error
    : lighten(0.3, props.baseTheme.colors.text.error);

  function block() {
    if (isValidPatp(input)) {
      props.onChange('add', input);
      setInput('');
    }
  }

  return (
    <Flex flexDirection="column">
      <Flex mb={1} position="relative">
        <Input
          pr="36px"
          spellCheck={false}
          placeholder="~tasdul-tasdul"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <Text
          position="absolute"
          top="9px"
          right="12px"
          variant="body"
          color={blockButtonColor}
          onClick={block}
        >
          Block
        </Text>
      </Flex>
      <NoScrollBar
        height="70px"
        width="100%"
        flexDirection="column"
        margin="auto"
        overflow="scroll"
      >
        {props.blocked.map((patp) => (
          <Flex
            mt={1}
            width="100%"
            px={2}
            justifyContent="space-between"
            key={patp}
          >
            <Text variant="body">{patp}</Text>
            <Text
              color={props.theme.currentTheme.iconColor}
              onClick={() => props.onChange('remove', patp)}
            >
              x
            </Text>
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
