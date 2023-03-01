import { FC } from 'react';
import { observer } from 'mobx-react';
import { AirliftActions } from 'renderer/logic/actions/airlift';
import { Flex, BarStyle, Button, Icon } from '@holium/design-system';
import { Handle, Position } from 'reactflow';

export type AirliftArmProps = {
  airliftId: string;
  arm: any;
  index: number;
};

const BUTTON_SIZE = 30;

export const AirliftArm: FC<AirliftArmProps> = observer(
  (props: AirliftArmProps) => {
    const { airliftId, arm } = props;

    const toggleArmExpand = () => {
      AirliftActions.toggleArmExpand(airliftId, arm.name);
    };
    console.log('hidden', !arm.expanded);

    return (
      <>
        <Flex
          id={'flex_' + airliftId + arm.name}
          flexDirection="row"
          pl="20px"
          // flex={1}
          // overflowX="visible"
          position="relative"
        >
          <Handle
            id={airliftId + arm.name}
            type="source"
            position={Position.Left}
            style={{
              bottom: 10,
              top: 'auto',
              background: '#555',
              width: '20px',
              height: '20px',
              borderRadius: '3px',
            }}
            onConnect={(params) => console.log('handle onConnect', params)}
            isConnectable={true}
            hidden={false}
            onClickCapture={toggleArmExpand}
          />
          <BarStyle
            flexDirection="row"
            flex={1}
            overflowX="visible"
            style={{ display: arm.expanded ? 'flex' : 'none' }}
          >
            <Button.IconButton size={BUTTON_SIZE + 10} style={{ fill: 'none' }}>
              <Icon name="AirliftCode" size={15} overflow="visible" mr={2} />
            </Button.IconButton>
            <Button.IconButton size={BUTTON_SIZE + 10}>
              <Icon name="AirliftCards" overflow="visible" size={20} />
            </Button.IconButton>
          </BarStyle>
        </Flex>
      </>
    );
  }
);
