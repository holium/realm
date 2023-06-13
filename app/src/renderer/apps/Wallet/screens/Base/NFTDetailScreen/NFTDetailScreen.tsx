import { observer } from 'mobx-react';

import { EthWalletType } from 'renderer/stores/models/wallet.model';
import { useShipStore } from 'renderer/stores/ship.store';

import { NFTDetailScreenBody } from './NFTDetailScreenBody';

const NFTDetailScreenPresenter = () => {
  const { walletStore } = useShipStore();

  const wallet = walletStore.currentWallet as EthWalletType;
  const nft = wallet.data
    .get(walletStore.navState.protocol)
    ?.nfts.get(walletStore.navState.detail?.key ?? '');

  if (!nft) return null;

  return (
    <NFTDetailScreenBody
      nftName={nft.name}
      nftImageUrl={nft.imageUrl}
      nftAddress={nft.address}
      nftTokenId={nft.tokenId}
      nftCollectionName={nft.collectionName}
    />
  );
};

export const NFTDetailScreen = observer(NFTDetailScreenPresenter);
