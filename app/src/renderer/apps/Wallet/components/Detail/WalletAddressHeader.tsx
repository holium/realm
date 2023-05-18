import styled from 'styled-components';

import {
  Button,
  CopyButton,
  Flex,
  Icon,
  Text,
} from '@holium/design-system/general';

import { NetworkType } from 'os/services/ship/wallet/wallet.types';

import { shortened } from '../../helpers';

export const AddressStyle = styled(Flex)`
  display: flex;
  width: 100%;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 7px;
  border: 1px solid rgba(var(--rlm-border-rgba));
  background: rgba(var(--rlm-overlay-hover-rgba));
`;

type Props = {
  address: string;
  isSendingTransaction: boolean;
  network: NetworkType;
  onClickQrCode: () => void;
};

export const WalletAddressHeader = ({
  address,
  isSendingTransaction,
  network,
  onClickQrCode,
}: Props) => (
  <AddressStyle>
    {network === NetworkType.ETHEREUM ? (
      <Icon name="Ethereum" />
    ) : (
      <Icon name="Bitcoin" />
    )}
    <Text.Body flex={1} fontSize="14px">
      {shortened(address)}
    </Text.Body>
    {isSendingTransaction ? (
      <Icon name="ChevronDown" size="20px" fill="text" opacity={0.5} />
    ) : (
      <Flex gap={10}>
        <CopyButton content={address} />
        <Button.IconButton onClick={onClickQrCode}>
          <Icon name="QRCode" size="20px" fill="text" opacity={0.5} />
        </Button.IconButton>
      </Flex>
    )}
  </AddressStyle>
);
