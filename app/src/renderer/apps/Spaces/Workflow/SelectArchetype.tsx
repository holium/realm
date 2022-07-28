import { FC, useState } from 'react';
import { Grid, Text, Flex } from 'renderer/components';
// import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import { useServices } from 'renderer/logic/store';
import { BaseDialogProps } from 'renderer/system/dialog/dialogs';
import { SelectRow } from '../components/SelectionRow';

export const SelectArchetype: FC<BaseDialogProps> = observer(
  (props: BaseDialogProps) => {
    const { shell } = useServices();
    const { windowColor } = shell.desktop.theme;
    const { workflowState, setState } = props;
    const [selectedArchetype, setSelectedArchetype] = useState<string | null>(
      null
    );

    const setWorkspaceState = (obj: any) => {
      setState &&
        setState({
          ...workflowState,
          ...obj,
        });
    };
    return (
      <Grid.Column noGutter lg={12} xl={12}>
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
          mb={6}
        >
          Archetypes are presets for making a space. You can change the
          configuration later.
        </Text>
        <Flex flexDirection="column" justifyContent="flex-start">
          <SelectRow
            {...(workflowState && workflowState.title !== 'New Space'
              ? { image: workflowState.image }
              : { icon: 'SpacesColor' })}
            title={workflowState && workflowState.title}
            subtitle={workflowState && workflowState.subtitle}
          />
          <Flex pl={4} pr={4} mt={4} flex={1} gap={12} flexDirection="column">
            <SelectRow
              customBg={windowColor}
              title="Community"
              subtitle="A space to hangout and chat with friends."
              selected={selectedArchetype === 'lodge'}
              onClick={() => {
                setSelectedArchetype('lodge');
                setWorkspaceState({
                  archetype: 'lodge',
                  archetypeTitle: 'Community',
                });
              }}
            />
            <SelectRow
              disabled
              customBg={windowColor}
              title="Creator DAO"
              subtitle="Launch a media empire with your followers."
            />
            <SelectRow
              disabled
              customBg={windowColor}
              title="Service DAO"
              subtitle="From branding to software, build a DAO of contractors."
            />
            <SelectRow
              disabled
              customBg={windowColor}
              title="Investment DAO"
              subtitle="Pool resources and invest with friends."
            />
          </Flex>
        </Flex>
      </Grid.Column>
    );
  }
);
