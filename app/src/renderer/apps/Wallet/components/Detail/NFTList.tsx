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

export const NFTList = ({ nfts, navigate }: Props) => (
  <Flex gap={4} flexDirection="column" alignItems="center">
    {nfts.length ? (
      nfts.map((nft, index) => (
        <NFT
          key={index}
          imageUrl={nft.imageUrl}
          collectionName={nft.collectionName ?? 'Name'}
          name={nft.name}
          onClickNft={() =>
            navigate(WalletScreen.NFT_DETAIL, {
              detail: {
                type: 'nft',
                txtype: 'nft',
                key: `${nft.address}${nft.tokenId}`,
              },
            })
          }
        />
      ))
    ) : (
      <Text.H5 mt={6} variant="h5" textAlign="center">
        No NFTs
      </Text.H5>
    )}
  </Flex>
);
