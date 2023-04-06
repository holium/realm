import { useState } from 'react';
import { observer } from 'mobx-react';
import { useServices } from 'renderer/logic/store';
import {
  Flex,
  Text,
  Button,
  Spinner,
  WindowedList,
  Row,
} from '@holium/design-system';
import { EmptyGroup } from './SpaceRow';
import { useShipStore } from 'renderer/stores/ship.store';

export interface Space {
  color?: string;
  description?: string;
  picture: string;
  title: string;
  memberCount: number;
  token?: string;
}

const FeaturedListPresenter = () => {
  const { spacesStore } = useShipStore();
  const { bulletin } = useServices();

  const [joining, setJoining] = useState(false);

  const listData = bulletin.list;
  // console.log(bulletin.list);
  if (listData.length === 0) {
    return (
      <Flex flex={1} py={1} px={4} width="100%">
        <Text.Custom
          fontWeight={200}
          opacity={0.5}
          width="100%"
          mt={4}
          textAlign="center"
        >
          No featured spaces
        </Text.Custom>
      </Flex>
    );
  }
  return (
    <Flex flex={1} width="100%">
      <WindowedList
        key={`featured-spaces-${listData.length}`}
        width={354}
        data={listData}
        itemContent={(_, data) => {
          const onJoin = async () => {
            setJoining(true);
            spacesStore
              .joinSpace(data.path.substring(1))
              .then(() => {
                spacesStore.selectSpace(data.path);
                spacesStore.setJoin('loaded');
                setJoining(false);
              })
              .catch((err) => {
                console.error(err);
                setJoining(false);
              });
          };
          const hasJoined = spacesStore.getSpaceByPath(data.path) !== undefined;
          return (
            <Row
              selected
              gap="8px"
              style={{
                padding: 12,
                flexDirection: 'column',
                alignItems: 'flex-start',
              }}
              onClick={(evt: any) => {
                evt.stopPropagation();
              }}
            >
              <Flex gap={16} flexDirection="row" alignItems="center">
                {data.picture ? (
                  <img
                    style={{ borderRadius: 6 }}
                    height="32px"
                    width="32px"
                    src={data.picture}
                    alt={data.name}
                  />
                ) : (
                  <EmptyGroup color={data.color || '#000000'} />
                )}
                <Flex
                  flex={1}
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Flex flexDirection="column">
                    <Text.Custom
                      mb="2px"
                      opacity={0.9}
                      fontSize={3}
                      fontWeight={500}
                    >
                      {data.name}
                    </Text.Custom>
                    <Text.Custom opacity={0.5} fontSize={2} fontWeight={400}>
                      {data.description}
                    </Text.Custom>
                  </Flex>
                </Flex>
              </Flex>
              <Flex
                gap={10}
                width="100%"
                flex={1}
                flexDirection="row"
                justifyContent="flex-end"
              >
                <Button.TextButton
                  fontSize={2}
                  // showBackground
                  disabled={hasJoined}
                  style={{ borderRadius: 6 }}
                  // color="#4E9EFD"
                  onClick={(evt: any) => {
                    evt.stopPropagation();
                    !hasJoined && onJoin();
                  }}
                >
                  {!hasJoined && (joining ? <Spinner size={0} /> : 'Join')}
                  {hasJoined && 'Joined'}
                </Button.TextButton>
              </Flex>
            </Row>
          );
        }}
      />
    </Flex>
  );
};

export const FeaturedList = observer(FeaturedListPresenter);
