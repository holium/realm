import { Flex, Row, Text } from '@holium/design-system/general';

type Props = {
  imageUrl: string;
  collectionName: string;
  name: string;
  floorPrice: string | undefined;
  onClickNft: () => void;
};

export const NFT = ({
  imageUrl,
  collectionName,
  name,
  floorPrice,
  onClickNft,
}: Props) => (
  <Row onClick={onClickNft}>
    <Flex width="100%" alignItems="center" gap="10px">
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
          src={imageUrl}
        />
      </Flex>
      <Flex flex={1} height="100%" flexDirection="column" gap="6px">
        <Flex flexDirection="column" justifyContent="center">
          <Text.Body fontWeight={300} style={{ fontSize: '11px' }}>
            {collectionName}
          </Text.Body>
          <Text.H5 fontSize={1}>{name}</Text.H5>
        </Flex>
        <Flex flexDirection="column" justifyContent="center">
          <Text.Body fontWeight={300} style={{ fontSize: '11px' }}>
            Floor price
          </Text.Body>
          <Text.H5 fontSize={1}>{floorPrice ?? '0'}</Text.H5>
        </Flex>
      </Flex>
    </Flex>
  </Row>
);
