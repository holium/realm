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
import {
  BitcoinWalletType,
  EthWalletType,
} from 'renderer/stores/models/wallet.model';

import { BlockedInput } from '../../components/BlockedInput';
import { VisibilitySelect } from '../../components/VisibilitySelect';

type Props = {
  wallets: (BitcoinWalletType | EthWalletType)[];
  saving: boolean;
  creationMode: string;
  onClickCreationMode: (mode: string) => void;
  blocked: string[];
  onChangeBlockList: (action: 'add' | 'remove', patp: string) => void;
  sharingMode: SharingMode;
  defaultIndex: number;
  walletCreationMode: WalletCreationMode;
  setWalletVisibility: (sharingMode: string, defaultIndex?: number) => void;
  onClickDeleteLocally: () => void;
  onClickDeleteCompletely: () => void;
  onClickBack: () => void;
  onClickSaveSettings: () => void;
};

export const WalletSettingsScreenBody = ({
  wallets,
  saving,
  creationMode,
  onClickCreationMode,
  blocked,
  onChangeBlockList,
  sharingMode,
  defaultIndex,
  walletCreationMode,
  setWalletVisibility,
  onClickDeleteLocally,
  onClickDeleteCompletely,
  onClickBack,
  onClickSaveSettings,
}: Props) => (
  <Flex width="100%" height="100%" flexDirection="column" gap="24px">
    <Flex justifyContent="space-between" alignItems="center">
      <Flex alignItems="center">
        <Button.IconButton size={26} onClick={onClickBack}>
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
        onClick={onClickSaveSettings}
      >
        {saving ? <Spinner size={0} color="#FFF" /> : 'Save'}
      </Button.Primary>
    </Flex>
    <Flex flex={1} flexDirection="column" gap="16px" overflowY="auto">
      <Flex flexDirection="column" gap="4px">
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
            selected={creationMode}
            onClick={onClickCreationMode}
          />
        </Flex>
      </Flex>

      <Flex flexDirection="column" gap="4px">
        <Text.Label>Wallet Visibility</Text.Label>
        <Text.Custom fontSize={1} opacity={0.8}>
          Determine how you want to share addresses with other people on the
          network.
        </Text.Custom>
        <VisibilitySelect
          wallets={wallets as any}
          sharingMode={sharingMode}
          defaultIndex={defaultIndex}
          walletCreationMode={walletCreationMode}
          onChange={setWalletVisibility}
        />
      </Flex>

      <Flex flexDirection="column" gap="4px">
        <Text.Label>Blocked IDs</Text.Label>
        <BlockedInput blocked={blocked} onChange={onChangeBlockList} />
      </Flex>

      <Flex flexDirection="column" gap="4px">
        <Text.Label>Delete locally</Text.Label>
        <Text.Custom fontSize={2} opacity={0.8}>
          Delete your wallet from local storage.
        </Text.Custom>
        <Button.TextButton
          height={32}
          fontWeight={500}
          color="intent-alert"
          onClick={onClickDeleteLocally}
        >
          Delete
        </Button.TextButton>
      </Flex>
      <Flex flexDirection="column" gap="4px">
        <Text.Label>Delete completely</Text.Label>
        <Text.Custom fontSize={2} opacity={0.8}>
          Completely delete your wallet locally and remove all metadata from
          Urbit.
        </Text.Custom>
        <Button.TextButton
          height={32}
          fontWeight={500}
          color="intent-alert"
          onClick={onClickDeleteCompletely}
        >
          Delete
        </Button.TextButton>
      </Flex>
    </Flex>
  </Flex>
);
