import { Flex, Text } from '@holium/design-system/general';

import {
  ERC721Type,
  WalletNavOptions,
} from 'renderer/stores/models/wallet.model';

import { WalletScreen } from '../../types';
import { NFT } from './NFT';

type Props = {
  nfts: ERC721Type[];
  navigate: (view: WalletScreen, options?: WalletNavOptions) => void;
};

export const NFTList = ({ nfts, navigate }: Props) => {
  if (!nfts.length) {
    return <Text.H5 mt="4px">No NFTs</Text.H5>;
  }

  return (
    <Flex gap={4} flexDirection="column" alignItems="center">
      {nfts.map((nft, index) => (
        <NFT
          key={index}
          imageUrl={nft.imageUrl}
          collectionName={nft.collectionName ?? 'Name'}
          name={nft.name}
          floorPrice={nft.floorPrice}
          onClickNft={() => {
            navigate(WalletScreen.NFT_DETAIL, {
              detail: {
                type: 'nft',
                txtype: 'nft',
                key: `${nft.address}${nft.tokenId}`,
              },
            });
          }}
        />
      ))}
    </Flex>
  );
};
