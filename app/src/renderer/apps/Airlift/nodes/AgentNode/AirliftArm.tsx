import { FC } from 'react';
import { observer } from 'mobx-react';
import { AirliftActions } from 'renderer/logic/actions/airlift';
import { BarStyle, Button, Icon } from '@holium/design-system';

export type AirliftArmProps = {
  desk: string;
  agent: string;
  arm: any;
};

const BUTTON_SIZE = 30;

export const AirliftArm: FC<AirliftArmProps> = observer(
  (props: AirliftArmProps) => {
    const { desk, agent, arm } = props;

    const onArmExpand = () => {
      AirliftActions.expandArm(desk, agent, arm.name);
    };

    return (
      <BarStyle pl="2px" pr={1} flex={1} overflowX="visible" width="100px">
        <Button.IconButton size={BUTTON_SIZE} style={{ fill: 'none' }}>
          <Icon name="AirliftCode" overflow="visible" size={30} />
        </Button.IconButton>
        <Button.IconButton size={BUTTON_SIZE}>
          <Icon name="AirliftCards" overflow="visible" size={25} />
        </Button.IconButton>
      </BarStyle>
    );
  }
);
