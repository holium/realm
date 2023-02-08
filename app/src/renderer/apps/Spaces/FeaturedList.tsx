import { useState } from 'react';
import { observer } from 'mobx-react';

import { Flex, Text, Spinner, TextButton } from 'renderer/components';
import { Row } from 'renderer/components/NewRow';

import { useServices } from 'renderer/logic/store';
import { WindowedList } from '@holium/design-system';
import { EmptyGroup } from './SpaceRow';
import { SpacesActions } from 'renderer/logic/actions/spaces';

export interface Space {
  color?: string;
  description?: string;
  picture: string;
  title: string;
  memberCount: number;
  token?: string;
}

const FeaturedListPresenter = () => {
  const { theme, spaces, bulletin } = useServices();
  const { windowColor } = theme.currentTheme;

  const [joining, setJoining] = useState(false);

  const listData = bulletin.list;
  // console.log(bulletin.list);
  if (listData.length === 0) {
    return (
      <Flex flex={1} py={1} px={4} width="100%">
        <Text fontWeight={200} opacity={0.5}>
          No featured spaces
        </Text>
      </Flex>
    );
  }
  return (
    <Flex flex={1} width="100%">
      <WindowedList
        key={`featured-spaces-${listData.length}`}
        width={354}
        data={listData}
        rowRenderer={(data: any) => {
          const onJoin = async () => {
            setJoining(true);
            SpacesActions.joinSpace(data.path.substring(1))
              .then(() => {
                SpacesActions.selectSpace(data.path);
                SpacesActions.setJoin('loaded');
                setJoining(false);
              })
              .catch((err) => {
                console.error(err);
                setJoining(false);
              });
          };
          const hasJoined = spaces.getSpaceByPath(data.path) !== undefined;
          return (
            <Row
              selected
              gap={8}
              customBg={windowColor}
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
                    <Text mb="2px" opacity={0.9} fontSize={3} fontWeight={500}>
                      {data.name}
                    </Text>
                    <Text opacity={0.5} fontSize={2} fontWeight={400}>
                      {data.description}
                    </Text>
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
                <TextButton
                  fontSize={2}
                  showBackground
                  disabled={hasJoined}
                  style={{ borderRadius: 6 }}
                  highlightColor="#4E9EFD"
                  onClick={(evt: any) => {
                    evt.stopPropagation();
                    !hasJoined && onJoin();
                  }}
                >
                  {!hasJoined && (joining ? <Spinner size={0} /> : 'Join')}
                  {hasJoined && 'Joined'}
                </TextButton>
              </Flex>
            </Row>
          );
        }}
      />
    </Flex>
  );
};

export const FeaturedList = observer(FeaturedListPresenter);
