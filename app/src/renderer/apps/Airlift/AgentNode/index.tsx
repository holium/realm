import { Flex } from '@holium/design-system';
import { AirliftAgent } from './AirliftAgent';

const handleStyle = { left: 10 };

export function AgentNode({ data, isConnectable }) {
  return (
    <Flex className="text-updater-node">
      {/*<Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
  />*/}
      <label htmlFor="text">Text:</label>
      {/*<Flex>
      </Flex>*/}
      {/*<Handle
        type="source"
        position={Position.Bottom}
        id="a"
        style={handleStyle}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="b"
        isConnectable={isConnectable}
  />*/}
      <AirliftAgent desk="asdf" agent="asdf" />
    </Flex>
  );
}
