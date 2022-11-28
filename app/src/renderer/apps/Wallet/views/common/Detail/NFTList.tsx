import { FC } from 'react';
import { darken } from 'polished';

import { Flex, Text, Icons } from 'renderer/components';
import { useTrayApps } from 'renderer/apps/store';
import { useServices } from 'renderer/logic/store';
import { getBaseTheme } from '../../../lib/helpers';
import { WalletActions } from 'renderer/logic/actions/wallet';
import { ERC721Type, WalletView } from 'os/services/tray/wallet.model';

interface NFTListProps {
  nfts: ERC721Type[];
}
export const NFTList: FC<NFTListProps> = (props: NFTListProps) => {
  const { walletApp } = useTrayApps();
  const { theme } = useServices();
  const baseTheme = getBaseTheme(theme.currentTheme);

  const NFT = (props: any) => {
    return (
      <Flex
        p={2}
        width="100%"
        my="2px"
        px={3}
        py={2}
        alignItems="center"
        justifyContent="space-between"
        backgroundColor={darken(0.03, theme.currentTheme.windowColor)}
        borderRadius="6px"
        onClick={async () =>
          await WalletActions.navigate(WalletView.NFT_DETAIL, {
            detail: {
              type: 'nft',
              key: `${props.details.address}${props.details.tokenId}`,
            },
          })
        }
      >
        <Flex alignItems="center">
          <Flex
            width="76px"
            height="76px"
            borderRadius="4px"
            justifyContent="center"
          >
            {/* TODO: detect aspect ratio? */}
            <img height="76px" src={props.details.imageUrl} />
          </Flex>
          <Flex
            ml={4}
            flexDirection="column"
            justifyContent="space-evenly"
            alignItems="flex-start"
          >
            <Flex flexDirection="column" justifyContent="center">
              <Text
                variant="body"
                fontSize={1}
                color={baseTheme.colors.text.secondary}
              >
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
        <Icons
          name="ChevronRight"
          color={theme.currentTheme.iconColor}
          height={20}
        />
      </Flex>
    );
  };

  return (
    <Flex flexDirection="column" alignItems="center">
      {props.nfts.length ? (
        props.nfts.map((nft, index) => <NFT details={nft} key={index} />)
      ) : (
        <Text
          mt={3}
          variant="h4"
          textAlign="center"
          color={theme.currentTheme.iconColor}
        >
          No NFTs
        </Text>
      )}
    </Flex>
  );
};
