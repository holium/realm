import { FC, useEffect } from 'react';
import { observer } from 'mobx-react';
import { Grid, Flex, Text } from 'renderer/components';
import { AirliftArm } from './AirliftArm';

export type AirliftAgentProps = {
  desk: string,
  agent: string,
  arms: string,
};

export const AirliftAgent: FC<AirliftAgentProps> = observer((props: AirliftAgentProps) => {
  const { desk, agent, arms } = props;

  return (
    <div>
    <Text fontSize={18}>%{agent}</Text>
    <AirliftArm desk={desk} agent={agent} arm='on-poke' />
    <AirliftArm desk={desk} agent={agent} arm='on-poke' />
    <AirliftArm desk={desk} agent={agent} arm='on-poke' />
    <AirliftArm desk={desk} agent={agent} arm='on-poke' />
    <AirliftArm desk={desk} agent={agent} arm='on-poke' />
    <AirliftArm desk={desk} agent={agent} arm='on-poke' />
    <AirliftArm desk={desk} agent={agent} arm='on-poke' />
    <AirliftArm desk={desk} agent={agent} arm='on-poke' />
    {arms && Object.entries(arms).map((arm: any) => {
      return (
        <div>
          <AirliftArm desk={desk} agent={agent} arm='on-poke' />
        </div>
      );
    })}
    </div>
  )
});
