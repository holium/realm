import { FC, useEffect, useState } from 'react';
import styled from 'styled-components';
// import { toJS } from 'mobx';
import { motion } from 'framer-motion';
import {
  Grid,
  Text,
  Flex,
  Skeleton,
  isValidImageUrl,
} from 'renderer/components';
import { observer } from 'mobx-react';
import { useServices } from 'renderer/logic/store';
import { BaseDialogProps } from 'renderer/system/dialog/dialogs';
import { SelectRow } from '../components/SelectionRow';
import { ShipActions } from 'renderer/logic/actions/ship';

export const Wrapper = styled(motion.div)`
  position: absolute;
  box-sizing: border-box;
`;

export const CreateSpaceModal: FC<BaseDialogProps> = observer(
  (props: BaseDialogProps) => {
    const { theme } = useServices();
    const { windowColor } = theme.currentTheme;
    const { workflowState, setState } = props;
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
      ShipActions.getOurGroups().then((ourGroups) => {
        setGroups(ourGroups);
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
                  customBg={windowColor}
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
              <Text textAlign="center" fontWeight={300} opacity={0.6}>
                You don't host any groups.
              </Text>
            </Flex>
          )}
        </>
      );
    }
    return (
      <Grid.Column noGutter lg={12} xl={12}>
        <Text
          fontSize={5}
          lineHeight="24px"
          fontWeight={500}
          mb={2}
          variant="body"
        >
          Make a space
        </Text>
        <Text
          fontSize={3}
          fontWeight={200}
          lineHeight="20px"
          variant="body"
          opacity={0.6}
          mb={6}
        >
          A space is a place where people can compute together.
        </Text>
        <Flex flexDirection="column" justifyContent="flex-start">
          <SelectRow
            icon="SpacesColor"
            customBg={windowColor}
            title="New Space"
            buttonText="Create"
            onButtonClick={(data: any) => {
              setState &&
                setState({
                  title: 'New Space',
                  type: 'space',
                  color: '#000000',
                  archetype: 'community',
                  archetypeTitle: 'Community',
                });
              // setWorkspaceState({
              //   archetype: 'community',
              //   archetypeTitle: 'Community',
              // });
              // workflowState.set({
              //   title: 'New Space',
              //   type: 'space',
              // });
              props.onNext && props.onNext(null, data);
              // props.setState &&
              //   props.setState({ title: 'New Space', type: 'space' });
              // props.onNext && props.onNext(data);
            }}
          />
          <Flex mt={8} flex={1} flexDirection="column">
            <Text
              fontWeight={500}
              fontSize={2}
              opacity={0.5}
              mb={2}
              style={{ textTransform: 'uppercase' }}
            >
              Your groups
            </Text>
            <Flex flex={1} gap={6} flexDirection="column">
              {list}
            </Flex>
          </Flex>
        </Flex>
      </Grid.Column>
    );
  }
);
