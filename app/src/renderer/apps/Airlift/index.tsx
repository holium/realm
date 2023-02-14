import { FC } from 'react';
import { observer } from 'mobx-react';
import { AirliftAgent } from './AirliftAgent';

export type AirliftProps = {
  isResizing: boolean;
};

export const Airlift: FC<AirliftProps> = observer((/*props: AirliftProps*/) => {
  const desk = '0';
  const agent = 'test';
  // const { airlift } = useServices();
  // const arms = airlift.model.desks.get(desk)!.agents.get(agent)!.arms;
  const arms = {};

  return <AirliftAgent desk={desk} agent={agent} arms={arms} />;
});
