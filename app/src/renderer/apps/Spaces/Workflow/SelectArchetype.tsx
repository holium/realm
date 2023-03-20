import { FC, useState, useEffect } from 'react';
import { Text, Flex } from 'renderer/components';
// import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import { useServices } from 'renderer/logic/store';
import { BaseDialogProps } from 'renderer/system/dialog/dialogs';
import { SelectRow } from '../components/SelectionRow';

export const SelectArchetype: FC<BaseDialogProps> = observer(
  (props: BaseDialogProps) => {
    const { theme } = useServices();
    const { windowColor } = theme.currentTheme;
    const { workflowState, setState } = props;
    const [selectedArchetype, setSelectedArchetype] = useState<string | null>(
      'community'
    );

    const setWorkspaceState = (obj: any) => {
      setState &&
        setState({
          ...workflowState,
          ...obj,
        });
    };

    useEffect(() => {
      setSelectedArchetype('community');
      setWorkspaceState({
        archetype: 'community',
        archetypeTitle: 'Community',
      });
    }, []);
    return (
      <Flex flexDirection="column" width="100%">
        <Text
          fontSize={5}
          lineHeight="24px"
          fontWeight={500}
          mb={2}
          variant="body"
        >
          Choose an archetype
        </Text>
        <Text
          fontSize={3}
          fontWeight={200}
          lineHeight="20px"
          variant="body"
          opacity={0.6}
        >
          Archetypes are presets for making a space. You can change the
          configuration later.
        </Text>
        {/* <Flex flexDirection="column" justifyContent="flex-start" flex={1}>
          <SelectRow
            {...(workflowState && workflowState.title !== 'New Space'
              ? { image: workflowState.image }
              : { icon: 'SpacesColor' })}
            title={workflowState && workflowState.title}
            subtitle={workflowState && workflowState.subtitle}
          />
        </Flex> */}
        <Flex
          pl={4}
          pr={4}
          flex={1}
          mb={60}
          gap={12}
          flexDirection="column"
          justifyContent="center"
        >
          <SelectRow
            hideIcon
            customBg={windowColor}
            title="Community"
            subtitle="A space to hangout and chat with friends."
            selected={selectedArchetype === 'community'}
            onClick={() => {
              setSelectedArchetype('community');
              setWorkspaceState({
                archetype: 'community',
                archetypeTitle: 'Community',
              });
            }}
          />
          <SelectRow
            hideIcon
            disabled
            customBg={windowColor}
            title="Creator DAO"
            subtitle="Launch a media empire with your followers."
          />
          <SelectRow
            hideIcon
            disabled
            customBg={windowColor}
            title="Service DAO"
            subtitle="From branding to software, build a DAO of contractors."
          />
          <SelectRow
            hideIcon
            disabled
            customBg={windowColor}
            title="Investment DAO"
            subtitle="Pool resources and invest with friends."
          />
        </Flex>
      </Flex>
    );
  }
);
