import { FC, Fragment } from 'react';
import { observer } from 'mobx-react';
import { AirliftActions } from 'renderer/logic/actions/airlift';
import { BarStyle, Button, Icon } from '@holium/design-system';
import { Handle, Position } from 'reactflow';

export type AirliftArmProps = {
  airliftId: string;
  arm: any;
};

const BUTTON_SIZE = 30;

export const AirliftArm: FC<AirliftArmProps> = observer(
  (props: AirliftArmProps) => {
    const { airliftId, arm } = props;

    const onArmExpand = () => {
      AirliftActions.expandArm(airliftId, arm.name);
    };

    return (
      <>
        {arm.expanded ? (
          <BarStyle
            flexDirection="row"
            pl="2px"
            pr={1}
            flex={1}
            overflowX="visible"
            width="80px"
            justifyContent={'space-between'}
          >
            <Button.IconButton size={BUTTON_SIZE + 10} style={{ fill: 'none' }}>
              <Icon name="AirliftCode" size={15} overflow="visible" mr={2} />
            </Button.IconButton>
            <Button.IconButton size={BUTTON_SIZE + 10}>
              <Icon name="AirliftCards" overflow="visible" size={20} />
            </Button.IconButton>
            <Handle
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
            />
          </BarStyle>
        ) : (
          <Handle
            id={airliftId + arm.name}
            type="source"
            position={Position.Right}
            style={{
              /*bottom: 10,
              top: 'auto',
              background: '#555',*/
              width: '20px',
              height: '20px',
              borderRadius: '3px',
            }}
            onConnect={(params) => console.log('handle onConnect', params)}
            isConnectable={true}
            onClick={onArmExpand}
            onClickCapture={onArmExpand}
          />
        )}
      </>
    );
  }
);
