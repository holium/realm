import { Flex, TextInput } from '@holium/design-system';
import { KeyboardEventHandler, useState } from 'react';
import { observer } from 'mobx-react';
import { AirliftArm } from './AirliftArm';
import { AirliftDataType } from 'os/services/shell/airlift.model';
import { AirliftActions } from 'renderer/logic/actions/airlift';

interface AgentNodeProps {
  data: AirliftDataType;
  isConnectable: boolean;
}

export const AgentNode = observer(({ data, isConnectable }: AgentNodeProps) => {
  const [created, setCreated] = useState(false);
  const onKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter') {
      setCreated(true);
      AirliftActions.toggleAgentExpand(data.id);
    }
  };
  return (
    <Flex
      flexDirection="column"
      gap={30}
      border={data.showDelete ? '2px solid red' : 'none'}
    >
      <TextInput
        id={`${data.id}-name`}
        name={`${data.id}-name`}
        type="text"
        defaultValue="%"
        value={data.name}
        onChange={(event: any) => {
          event.preventDefault();
          const name = event.target.value;
          if (name.at(0) === '%') {
            AirliftActions.setAgentName(data.id, name);
          }
        }}
        onKeyDown={onKeyDown}
        disabled={created}
        onClick={() => AirliftActions.toggleAgentExpand(data.id)}
      />
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
  );
});
