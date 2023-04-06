import { FC, useEffect, useState } from 'react';
import styled from 'styled-components';
// import { toJS } from 'mobx';
import { motion } from 'framer-motion';
import { Text, Icon, Flex, Skeleton, Button } from '@holium/design-system';
import { observer } from 'mobx-react';
import { BaseDialogProps } from 'renderer/system/dialog/dialogs';
import { SelectRow } from '../components/SelectionRow';
import { useShipStore } from 'renderer/stores/ship.store';

export const Wrapper = styled(motion.div)`
  position: absolute;
  box-sizing: border-box;
`;

export const CreateSpaceModal: FC<BaseDialogProps> = observer(
  (props: BaseDialogProps) => {
    const { getOurGroups, spacesStore } = useShipStore();
    const { setState } = props;
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
      const groupSpaces = Array.from(spacesStore.spaces.values())
        .filter((space) => space.type === 'group')
        .map((space) => space.path);
      getOurGroups().then((ourGroups) => {
        const nonSpaceGroups = ourGroups.filter(
          (group: any) => !groupSpaces.includes(group.path)
        );
        setGroups(nonSpaceGroups);
        setLoading(false);
      });
    }, []);

    let list;
    if (loading) {
      list = (
        <>
          <Skeleton height={48} borderRadius={8} />
          <Skeleton height={48} borderRadius={8} />
        </>
      );
    } else {
      list = (
        <>
          {groups.length ? (
            groups.map((data: any) => {
              const groupKey = data.path.split('/')[2];
              const title = data.name || groupKey;
              const subtitle = `${data.memberCount} ${
                data.memberCount === 1 ? 'member' : 'members'
              }`;
              return (
                <SelectRow
                  key={groupKey}
                  color={data.color}
                  image={data.picture}
                  title={data.name || groupKey}
                  buttonText="Add Space"
                  subtitle={subtitle}
                  onButtonClick={(_evt: any) => {
                    setState &&
                      setState({
                        title,
                        name: title,
                        image: data.picture,
                        color: data.color || '#000000',
                        subtitle,
                        type: 'group',
                        archetype: 'community',
                        archetypeTitle: 'Group',
                        path: data.path,
                        access: data.access,
                      });
                    props.onNext && props.onNext(_evt);
                  }}
                />
              );
            })
          ) : (
            <Flex
              minHeight={100}
              alignItems="center"
              justifyContent="center"
              flex={1}
            >
              <Text.Custom textAlign="center" fontWeight={300} opacity={0.6}>
                You don't host any groups.
              </Text.Custom>
            </Flex>
          )}
        </>
      );
    }
    return (
      <Flex flexDirection="column" width="100%">
        <Text.Custom
          fontSize={5}
          lineHeight="24px"
          fontWeight={500}
          mb={2}
          variant="body"
        >
          Make a space
        </Text.Custom>
        <Text.Custom
          fontSize={3}
          fontWeight={200}
          lineHeight="20px"
          variant="body"
          opacity={0.6}
          mb={4}
        >
          A space is a place where people can compute together.
        </Text.Custom>
        <Flex col justify="flex-start">
          <Flex row justify="space-between">
            <Flex row gap={16} align="center">
              <Icon size={32} name="SpacesColor" />

              <Text.Custom opacity={0.9} fontSize={4} fontWeight={500}>
                New Space
              </Text.Custom>
            </Flex>

            <Button.TextButton
              // fontSize={2}
              onClick={(evt: any) => {
                evt.stopPropagation();
                setState &&
                  setState({
                    title: 'New Space',
                    type: 'space',
                    color: '#000000',
                    image: '',
                    archetype: 'community',
                    archetypeTitle: 'Community',
                    crestOption: 'color',
                  });
                props.onNext && props.onNext(null, 'New Space');
              }}
            >
              Create
            </Button.TextButton>
          </Flex>
          {/* <SelectRow
            icon="SpacesColor"
            title="New Space"
            buttonText="Create"
            onButtonClick={(data: any) => {
              setState &&
                setState({
                  title: 'New Space',
                  type: 'space',
                  color: '#000000',
                  image: '',
                  archetype: 'community',
                  archetypeTitle: 'Community',
                  crestOption: 'color',
                });
              props.onNext && props.onNext(null, data);
            }}
          /> */}
          <Flex mt={4} flex={1} flexDirection="column">
            <Text.Custom
              fontWeight={500}
              fontSize={2}
              opacity={0.5}
              mb={2}
              style={{ textTransform: 'uppercase' }}
            >
              Your groups
            </Text.Custom>
            <Flex flex={1} gap={6} flexDirection="column">
              {list}
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    );
  }
);
