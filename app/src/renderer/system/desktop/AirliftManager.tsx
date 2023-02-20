import { observer } from 'mobx-react';
import { motion } from 'framer-motion';
import { useServices } from 'renderer/logic/store';
import ReactFlow, {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  NodeChange,
  EdgeChange,
  Connection,
  Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { AgentNode } from 'renderer/apps/Airlift/AgentNode';
import 'renderer/apps/Airlift/AgentNode/index.css';
import { useCallback, useMemo, useState } from 'react';

const AirliftManagerPresenter = () => {
  // const { getOptions, setOptions } = useContextMenu();
  const { shell, airlift, desktop, spaces } = useServices();
  const id = 'airlift-fill';

  const airlifts = Array.from(
    (spaces.selected && airlift.airlifts.get(spaces.selected.path)?.values()) ||
      []
  );

  const initialNodes = [
    {
      id: '2',
      data: { value: 123 },
      position: { x: 100, y: 100 },
      type: 'agent',
    },
  ];

  const nodeTypes = useMemo(() => {
    return {
      agent: AgentNode,
    };
  }, []);

  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState([]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      return setNodes((nds) => applyNodeChanges(changes, nds));
    },
    [setNodes]
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );
  const onConnect = useCallback(
    (connection: Edge<any> | Connection) =>
      setEdges((eds: Edge<any>[]) => addEdge(connection, eds)),
    [setEdges]
  );

  return (
    <motion.div
      id={id}
      animate={{
        display: desktop.isHomePaneOpen ? 'none' : 'block',
      }}
      style={{
        bottom: 0,
        padding: '8px',
        position: 'fixed',
        left: 0,
        top: 0,
        right: 0,
        height: `calc(100vh - ${0}px)`,
        paddingTop: shell.isFullscreen ? 0 : 30,
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      />
    </motion.div>
  );
};

export const AirliftManager = observer(AirliftManagerPresenter);
