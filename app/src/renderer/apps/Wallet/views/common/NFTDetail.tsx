import { observer } from 'mobx-react';

import { Anchor, Flex, Icon, Text } from '@holium/design-system';

import { EthWalletType } from 'renderer/stores/models/wallet.model';
import { useShipStore } from 'renderer/stores/ship.store';

const NFTDetailPresenter = () => {
  const { walletStore } = useShipStore();

  const wallet = walletStore.currentWallet as EthWalletType;
  const nft = wallet.data
    .get(walletStore.navState.protocol)
    ?.nfts.get(walletStore.navState.detail?.key ?? '');

  if (!nft) return null;

  return (
    <Flex height="100%" width="100%" flexDirection="column" px={3}>
      <Flex mt={4} width="100%" height="256px" justifyContent="center">
        <img
          height="100%"
          src={nft.imageUrl}
          style={{ borderRadius: '6px' }}
          alt="NFT"
        />
      </Flex>

      <Flex mt={8} flexDirection="column" alignItems="center">
        <Text.Body variant="body" fontSize={1}>
          {nft.collectionName || 'NFT'}
        </Text.Body>
        <Text.H5 variant="h5">{nft.name}</Text.H5>
      </Flex>

      <Flex mt={4} position="relative" justifyContent="center">
        <Anchor
          fontSize={1}
          href={`https://etherscan.io/token/${nft.address}?a=${nft.tokenId}`}
          rel="noreferrer"
          target="_blank"
        >
          {nft.address.slice(0, 18)}... <Icon mb={1} name="Link" size={1} />
        </Anchor>
      </Flex>
    </Flex>
  );
};

export const NFTDetail = observer(NFTDetailPresenter);
