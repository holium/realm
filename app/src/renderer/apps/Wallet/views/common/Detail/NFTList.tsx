import { FC } from 'react';

import { Flex, Text, Icons } from 'renderer/components';
import {
  ERC721Type,
  WalletView,
} from 'os/services/tray/wallet-lib/wallet.model';
import { Row } from 'renderer/components/NewRow';
import { useShipStore } from 'renderer/stores/ship.store';

interface NFTListProps {
  nfts: ERC721Type[];
}
export const NFTList: FC<NFTListProps> = (props: NFTListProps) => {
  const { walletStore } = useShipStore();
  const NFT = (props: any) => {
    return (
      <Row
        onClick={async () =>
          await walletStore.navigate(WalletView.NFT_DETAIL, {
            detail: {
              type: 'nft',
              txtype: 'nft',
              key: `${props.details.address}${props.details.tokenId}`,
            },
          })
        }
      >
        <Flex width="100%" alignItems="center" justifyContent="space-between">
          <Flex alignItems="center">
            <Flex
              width="76px"
              height="76px"
              borderRadius="4px"
              justifyContent="center"
            >
              {/* TODO: detect aspect ratio? */}
              <img
                style={{ borderRadius: 4 }}
                height="76px"
                width="76px"
                src={props.details.imageUrl}
              />
            </Flex>
            <Flex
              ml={4}
              flexDirection="column"
              justifyContent="space-evenly"
              alignItems="flex-start"
            >
              <Flex flexDirection="column" justifyContent="center">
                <Text variant="body" fontSize={1}>
                  {props.details.collectionName
                    ? props.details.collectionName
                    : 'Name'}
                </Text>
                <Text variant="h5" fontSize={1}>
                  {props.details.name}
                </Text>
              </Flex>
              {/* <Flex mt={1} flexDirection="column" justifyContent="center">
              <Text
                variant="body"
                fontSize={1}
                color={baseTheme.colors.text.secondary}
              >
                {props.details.floorPrice ? 'Floor price' : 'Last price'}
              </Text>
              <Text variant="h5" fontSize={1}>
                {props.details.floorPrice || props.details.lastPrice}
              </Text>
            </Flex> */}
            </Flex>
          </Flex>
          <Icons name="ChevronRight" height={20} />
        </Flex>
      </Row>
    );
  };

  return (
    <Flex gap={4} flexDirection="column" alignItems="center">
      {props.nfts.length ? (
        props.nfts.map((nft, index) => <NFT details={nft} key={index} />)
      ) : (
        <Text mt={6} variant="h5" textAlign="center">
          No NFTs
        </Text>
      )}
    </Flex>
  );
};
