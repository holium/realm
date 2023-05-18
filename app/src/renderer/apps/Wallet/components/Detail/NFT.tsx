import { Flex, Icon, Row, Text } from '@holium/design-system/general';

type Props = {
  imageUrl: string;
  collectionName: string;
  name: string;
  onClickNft: () => void;
};

export const NFT = ({ imageUrl, collectionName, name, onClickNft }: Props) => (
  <Row onClick={onClickNft}>
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
            src={imageUrl}
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
              {collectionName}
            </Text.Body>
            <Text.H5 variant="h5" fontSize={1}>
              {name}
            </Text.H5>
          </Flex>
        </Flex>
      </Flex>
      <Icon name="ChevronRight" height={20} />
    </Flex>
  </Row>
);
