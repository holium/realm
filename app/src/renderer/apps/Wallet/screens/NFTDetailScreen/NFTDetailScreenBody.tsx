import { Anchor, Flex, Icon, Text } from '@holium/design-system/general';

type Props = {
  nftName: string;
  nftImageUrl: string;
  nftAddress: string;
  nftTokenId: string;
  nftCollectionName?: string;
};

export const NFTDetailScreenBody = ({
  nftName,
  nftImageUrl,
  nftAddress,
  nftTokenId,
  nftCollectionName,
}: Props) => (
  <Flex
    height="100%"
    width="100%"
    flexDirection="column"
    alignItems="center"
    gap="24px"
  >
    <Flex mt={4} justifyContent="center">
      <img
        alt="NFT"
        width="230px"
        height="230px"
        src={nftImageUrl}
        style={{ borderRadius: '6px' }}
      />
    </Flex>

    <Flex flexDirection="column" alignItems="center" gap="4px">
      <Text.Body fontSize={1} opacity={0.7} fontWeight={300}>
        {nftCollectionName || 'NFT'}
      </Text.Body>
      <Text.H5>{nftName}</Text.H5>
    </Flex>

    <Anchor
      href={`https://etherscan.io/token/${nftAddress}?a=${nftTokenId}`}
      rel="noreferrer"
      target="_blank"
    >
      {nftAddress.slice(0, 18)}... <Icon mb={1} name="Link" size={1} />
    </Anchor>
  </Flex>
);
