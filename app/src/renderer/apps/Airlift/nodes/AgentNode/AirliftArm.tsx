import { FC } from 'react';
import { observer } from 'mobx-react';
import { AirliftActions } from 'renderer/logic/actions/airlift';
import { Flex, BarStyle, Button, Icon } from '@holium/design-system';
import { Handle, Position } from 'reactflow';
import { useServices } from 'renderer/logic/store';

export type AirliftArmProps = {
  airliftId: string;
  arm: any;
  index: number;
};

const BUTTON_SIZE = 30;

export const AirliftArm: FC<AirliftArmProps> = observer(
  (props: AirliftArmProps) => {
    const { airliftId, arm } = props;
    const { theme, spaces } = useServices();

    const toggleArmExpand = () => {
      if (spaces.selected)
        AirliftActions.toggleArmExpand(
          spaces.selected.path,
          airliftId,
          arm.name
        );
    };

    return (
      <>
        <Flex
          id={'flex_' + airliftId + arm.name}
          flexDirection="row"
          alignItems="flex-start"
          justifyContent="flex-start"
        >
          <Handle
            id={airliftId + arm.name}
            type="target"
            position={Position.Left}
            style={{
              background: theme.currentTheme.backgroundColor,
              width: '20px',
              height: '20px',
              borderRadius: '3px',
              position: 'relative',
              display: 'flex',
            }}
            onConnect={(params) => console.log('handle onConnect', params)}
            isConnectable={true}
            hidden={false}
            onClickCapture={toggleArmExpand}
          />
          <BarStyle
            flexDirection="row"
            style={{
              display: arm.expanded ? 'flex' : 'none',
            }}
          >
            <Button.IconButton size={BUTTON_SIZE + 10} style={{ fill: 'none' }}>
              <Icon name="AirliftCode" size={15} overflow="visible" mr={2} />
            </Button.IconButton>
            <Button.IconButton size={BUTTON_SIZE + 10}>
              <Icon name="AirliftCards" overflow="visible" size={20} />
            </Button.IconButton>
          </BarStyle>
          {/*<Flex>
            <CodeMirror height="100px" value={arm.body} />
          </Flex>*/}
        </Flex>
      </>
    );
  }
);
