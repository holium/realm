import { Flex, Text } from '@holium/design-system/general';

import { ERC721Type } from 'renderer/stores/models/wallet.model';

import { NFT } from './NFT';

type Props = {
  nfts: ERC721Type[];
};

export const NFTList = ({ nfts }: Props) => (
  <Flex gap={4} flexDirection="column" alignItems="center">
    {nfts.length ? (
      nfts.map((nft, index) => <NFT nft={nft} key={index} />)
    ) : (
      <Text.H5 mt={6} variant="h5" textAlign="center">
        No NFTs
      </Text.H5>
    )}
  </Flex>
);
