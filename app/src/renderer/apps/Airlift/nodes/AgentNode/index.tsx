import { Flex, TextInput } from '@holium/design-system';
import { KeyboardEventHandler } from 'react';
import { observer } from 'mobx-react';
import { AirliftArm } from './AirliftArm';
import { AirliftDataType } from 'os/services/shell/airlift.model';
import { AirliftActions } from 'renderer/logic/actions/airlift';
import { useServices } from 'renderer/logic/store';

interface AgentNodeProps {
  data: AirliftDataType;
  isConnectable: boolean;
}

export const AgentNode = observer(({ data, isConnectable }: AgentNodeProps) => {
  const { spaces } = useServices();
  const onKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter' && spaces.selected) {
      AirliftActions.setAgentCreated(spaces.selected.path, data.id);
      AirliftActions.toggleAgentExpand(spaces.selected.path, data.id);
    }
  };
  return (
    <Flex
      flexDirection="column"
      gap={25}
      border={data.showDelete ? '2px solid red' : 'none'}
    >
      <TextInput
        id={`${data.id}-name`}
        name={`${data.id}-name`}
        type="text"
        value={data.name || '%'}
        onChange={(event: any) => {
          event.preventDefault();
          const name = event.target.value;
          if (name.at(0) === '%' && spaces.selected) {
            AirliftActions.setAgentName(spaces.selected.path, data.id, name);
          }
        }}
        onKeyDown={onKeyDown}
        disabled={data.created}
        onClick={() =>
          spaces.selected &&
          AirliftActions.toggleAgentExpand(spaces.selected.path, data.id)
        }
        style={{ position: 'relative' }}
      />
      <Flex flexDirection="column" gap={10}>
        {data.agent.expanded &&
          Array.from(data.agent.arms.values()).map((arm, index) => (
            <AirliftArm
              key={arm.name}
              airliftId={data.id}
              arm={arm}
              index={index}
            />
          ))}
      </Flex>
    </Flex>
  );
});
