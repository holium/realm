import { WalletView } from 'os/services/tray/wallet.model';
import { FC } from 'react';
import { useTrayApps } from 'renderer/apps/store';
import { Flex, Text, Anchor, Icons } from 'renderer/components';
import { WalletActions } from 'renderer/logic/actions/wallet';
import { useServices } from 'renderer/logic/store';
import { getBaseTheme, convertEthAmountToUsd, formatEthAmount } from '../../lib/helpers';

export const NFTDetail: FC = () => {
  const { walletApp } = useTrayApps();
  const { theme } = useServices();
  const baseTheme = getBaseTheme(theme.currentTheme);

  const wallet = walletApp.ethereum.wallets.get(walletApp.currentIndex!)!;
  const nft = wallet.nfts.get(walletApp.currentItem!.key)!;
  const lastPrice = nft.lastPrice ? formatEthAmount(nft.lastPrice) : null;
  const floorPrice = nft.floorPrice ? formatEthAmount(nft.floorPrice) : null;

  return (
    <Flex width="100%" flexDirection="column" px={3}>

      <Flex flexDirection="column" alignItems="center">
        <Text variant="body" fontSize={1} color={baseTheme.colors.text.secondary}>{nft.collectionName || 'NFT' }</Text>
        <Text variant="h5">
          {nft.name}
        </Text>
      </Flex>

      <Flex mt={4} mb={6} width="100%" height="256px" justifyContent="center">
        <img height="100%" src={nft.imageUrl} style={{ borderRadius: "6px" }} />
      </Flex>

      <Text mb={3} variant="body" fontSize={1} color={theme.currentTheme.iconColor}>Details</Text>

      { lastPrice && (
        <Flex width="100%" justifyContent="space-between">
          <Text
            variant="body"
            fontSize={1}
            color={baseTheme.colors.text.secondary}
          >
            LAST PRICE
          </Text>
          <Flex
            flexDirection="column"
            justifyContent="center"
            alignItems="flex-end"
          >
            <Text
              variant="body"
              fontSize={4}
            >
              {lastPrice.eth}
            </Text>
            <Text
              variant="body"
              fontSize={2}
              color={baseTheme.colors.text.secondary}
            >
              ${convertEthAmountToUsd(lastPrice!)}
            </Text>
          </Flex>
        </Flex>
      )}
      { floorPrice && (
        <Flex justifyContent="space-between">
          <Text
            variant="body"
            fontSize={1}
            color={baseTheme.colors.text.secondary}
          >
            FLOOR PRICE
          </Text>
          <Flex
            flexDirection="column"
            justifyContent="center"
            alignItems="flex-end"
          >
            <Text
              variant="body"
              fontSize={4}
              color={baseTheme.colors.text.secondary}
            >
              {floorPrice.eth}
            </Text>
            <Text
              variant="body"
              fontSize={2}
              color={baseTheme.colors.text.secondary}
            >
              ${convertEthAmountToUsd(floorPrice!)}
            </Text>
          </Flex>
        </Flex>
      )}
      <Flex
        position="relative"
        mt={4}
        width="100%"
        justifyContent="space-between"
      >
        <Text
          variant="body"
          fontSize={1}
          color={baseTheme.colors.text.secondary}
        >
          CONTRACT
        </Text>
        <Flex position="relative" left="10px">
          <Anchor
            fontSize={1}
            color={baseTheme.colors.text.primary}
            href={`https://etherscan.io/token/${nft.address}?a=${nft.tokenId}`}
          >
            {nft.address.slice(0, 12)}...{' '}
            <Icons mb={1} name="Link" size={1} />
          </Anchor>
        </Flex>
      </Flex>

      <Flex position="absolute" top="582px" zIndex={999} onClick={()=> WalletActions.setView(WalletView.WALLET_DETAIL, walletApp.currentIndex)}>
        <Icons
          name="ArrowLeftLine"
          size={2}
          color={theme.currentTheme.iconColor}
        />
      </Flex>
    </Flex>
  )
}

export default NFTDetail;
