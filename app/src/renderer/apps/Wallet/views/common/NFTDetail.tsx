import { EthWalletType } from 'os/services/tray/wallet-lib/wallet.model';
import { useTrayApps } from 'renderer/apps/store';
import { Flex, Text, Icon } from '@holium/design-system';
import { useServices } from 'renderer/logic/store';
import { getBaseTheme } from '../../lib/helpers';

export const NFTDetail = () => {
  const { walletApp } = useTrayApps();
  const { theme } = useServices();
  const baseTheme = getBaseTheme(theme.currentTheme);

  const wallet = walletApp.currentWallet as EthWalletType;
  const nft = wallet.data
    .get(walletApp.navState.protocol)
    ?.nfts.get(walletApp.navState.detail?.key ?? '');

  if (!nft) return null;

  return (
    <Flex height="100%" width="100%" flexDirection="column" px={3}>
      <Flex mt={4} width="100%" height="256px" justifyContent="center">
        <img height="100%" src={nft.imageUrl} style={{ borderRadius: '6px' }} />
      </Flex>

      <Flex mt={8} flexDirection="column" alignItems="center">
        <Text.Body
          variant="body"
          fontSize={1}
          color={baseTheme.colors.text.secondary}
        >
          {nft.collectionName || 'NFT'}
        </Text.Body>
        <Text.H5 variant="h5">{nft.name}</Text.H5>
      </Flex>

      <Flex mt={4} position="relative" justifyContent="center">
        <Text.Anchor
          fontSize={1}
          href={`https://etherscan.io/token/${nft.address}?a=${nft.tokenId}`}
        >
          {nft.address.slice(0, 18)}... <Icon mb={1} name="Link" size={1} />
        </Text.Anchor>
      </Flex>
    </Flex>
  );
};
