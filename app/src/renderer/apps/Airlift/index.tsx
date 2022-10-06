import { FC, useEffect } from 'react';
import { observer } from 'mobx-react';
import { Grid, Flex, Text } from 'renderer/components';
import { AirliftAgent } from './AirliftAgent';
import { useServices } from 'renderer/logic/store';

export type AirliftProps = {
  isResizing: boolean;
};

export const Airlift: FC<AirliftProps> = observer((props: AirliftProps) => {
  const { isResizing } = props;
  const desk = '0';
  const agent = 'test';
  const { airlift } = useServices();
  const arms = airlift.model.desks.get(desk)!.agents.get(agent)!.arms;

  return (
    <AirliftAgent desk={desk} agent={agent} arms={arms}/>
  )
});
