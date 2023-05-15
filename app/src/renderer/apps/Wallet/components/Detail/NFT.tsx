import { Flex, Icon, Row, Text } from '@holium/design-system/general';

import { WalletScreen } from 'renderer/apps/Wallet/types';
import { ERC721Type } from 'renderer/stores/models/wallet.model';
import { useShipStore } from 'renderer/stores/ship.store';

type Props = {
  nft: ERC721Type;
};

export const NFT = ({ nft }: Props) => {
  const { walletStore } = useShipStore();

  return (
    <Row
      onClick={() =>
        walletStore.navigate(WalletScreen.NFT_DETAIL, {
          detail: {
            type: 'nft',
            txtype: 'nft',
            key: `${nft.address}${nft.tokenId}`,
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
            <img
              alt="NFT"
              style={{ borderRadius: 4 }}
              height="76px"
              width="76px"
              src={nft.imageUrl}
            />
          </Flex>
          <Flex
            ml={4}
            flexDirection="column"
            justifyContent="space-evenly"
            alignItems="flex-start"
          >
            <Flex flexDirection="column" justifyContent="center">
              <Text.Body variant="body" fontSize={1}>
                {nft.collectionName ? nft.collectionName : 'Name'}
              </Text.Body>
              <Text.H5 variant="h5" fontSize={1}>
                {nft.name}
              </Text.H5>
            </Flex>
          </Flex>
        </Flex>
        <Icon name="ChevronRight" height={20} />
      </Flex>
    </Row>
  );
};
