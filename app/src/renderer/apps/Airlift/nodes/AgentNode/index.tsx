import { Flex } from '@holium/design-system';
import { KeyboardEventHandler, useState } from 'react';
import { observer } from 'mobx-react';
import { AirliftArm } from './AirliftArm';
import { AirliftDataType } from 'os/services/shell/airlift.model';

interface AgentNodeProps {
  data: AirliftDataType;
  isConnectable: boolean;
}

export const AgentNode = observer(({ data, isConnectable }: AgentNodeProps) => {
  const [created, setCreated] = useState(false);
  const onKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter') {
      setCreated(true);
      // profileForm.actions.submit();
    }
  };
  return (
    <Flex
      flexDirection="column"
      gap={10}
      border={data.showDelete ? '2px solid red' : 'none'}
    >
      {/* name view <TextInput
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
      />*/}
      {Array.from(data.agent.arms.values()).map((arm) => {
        return <AirliftArm key={arm.name} airliftId={data.id} arm={arm} />;
      })}
    </Flex>
  );
});
