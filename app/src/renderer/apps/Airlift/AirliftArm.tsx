import { FC, useEffect } from 'react';
import { observer } from 'mobx-react';
import { Grid, Flex, Text, Icons } from 'renderer/components';
import { AirliftActions } from 'renderer/logic/actions/airlift';

export type AirliftArmProps = {
  desk: string;
  agent: string;
  arm: any;
};

export const AirliftArm: FC<AirliftArmProps> = observer((props: AirliftArmProps) => {
  const { desk, agent, arm } = props;

  const onArmExpand = () => {
    AirliftActions.expandArm(desk, agent, arm.name);
  }

  return (
    <div>
      {arm.expanded ?
      <div></div>
      :<Icons name='AirliftArm' onClick={onArmExpand}></Icons>}
    </div>
  )
});
