import { TextInput, Flex } from '@holium/design-system';
import { KeyboardEventHandler, useState } from 'react';
import { AirliftActions } from 'renderer/logic/actions/airlift';
import { observer } from 'mobx-react';

export const AgentNode = observer(({ data, isConnectable }) => {
  const [created, setCreated] = useState(false);
  const onKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter') {
      setCreated(true);
      // profileForm.actions.submit();
    }
  };
  return (
    <Flex border={data.showDelete ? '2px solid red' : 'none'}>
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
      />
    </Flex>
  );
});
