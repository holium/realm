import { FC, useEffect } from 'react';
import { observer } from 'mobx-react';
import { Grid, Flex, Text } from 'renderer/components';
import { AirliftAgent } from './AirliftAgent';

export type AirliftProps = {
  isResizing: boolean;
};

export const Airlift: FC<AirliftProps> = observer((props: AirliftProps) => {
  const { isResizing } = props;
  const desk = '';
  const agent = 'test';

  return (
    <AirliftAgent desk={desk} agent={agent} arms=''/>
  )
});
