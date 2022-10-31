import { WalletView } from 'os/services/tray/wallet.model';
import { FC } from 'react';
import { useTrayApps } from 'renderer/apps/store';
import { Flex, Text, Anchor, Icons } from 'renderer/components';
import { WalletActions } from 'renderer/logic/actions/wallet';
import { useServices } from 'renderer/logic/store';
import {
  getBaseTheme,
  convertEthAmountToUsd,
  formatEthAmount,
} from '../../lib/helpers';

export const NFTDetail: FC = () => {
  const { walletApp } = useTrayApps();
  const { theme } = useServices();
  const baseTheme = getBaseTheme(theme.currentTheme);

  const wallet = walletApp.ethereum.wallets.get(walletApp.currentIndex!)!;
  const nft = wallet.nfts.get(walletApp.currentItem!.key)!;

  return (
    <Flex width="100%" flexDirection="column" px={3}>

      <Flex mt={4} width="100%" height="256px" justifyContent="center">
        <img height="100%" src={nft.imageUrl} style={{ borderRadius: '6px' }} />
      </Flex>

      <Flex mt={8} flexDirection="column" alignItems="center">
        <Text
          variant="body"
          fontSize={1}
          color={baseTheme.colors.text.secondary}
        >
          {nft.collectionName || 'NFT'}
        </Text>
        <Text variant="h5">{nft.name}</Text>
      </Flex>

      <Flex mt={4} position="relative" justifyContent="center">
        <Anchor
          fontSize={1}
          color={baseTheme.colors.text.primary}
          href={`https://etherscan.io/token/${nft.address}?a=${nft.tokenId}`}
        >
          {nft.address.slice(0, 18)}... <Icons mb={1} name="Link" size={1} />
        </Anchor>
      </Flex>

      <Flex
        position="absolute"
        top="582px"
        zIndex={999}
        onClick={() =>
          WalletActions.setView(
            WalletView.WALLET_DETAIL,
            walletApp.currentIndex
          )
        }
      >
        <Icons
          name="ArrowLeftLine"
          size={2}
          color={theme.currentTheme.iconColor}
        />
      </Flex>
    </Flex>
  );
};

export default NFTDetail;
