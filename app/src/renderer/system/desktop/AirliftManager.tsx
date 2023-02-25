import { observer } from 'mobx-react';
import { motion } from 'framer-motion';
import { useServices } from 'renderer/logic/store';
import ReactFlow, {
  ReactFlowProvider,
  ReactFlowInstance,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { AgentNode } from 'renderer/apps/Airlift/AgentNode';
import 'renderer/apps/Airlift/AgentNode/index.css';
import { useCallback, useMemo, useRef, useState } from 'react';
import { AirliftActions } from 'renderer/logic/actions/airlift';
import { getSnapshot } from 'mobx-state-tree';

const AirliftManagerPresenter = () => {
  const { shell, airlift, desktop } = useServices();
  const id = 'airlift-fill';

  const nodeTypes = useMemo(() => {
    return {
      agent: AgentNode,
    };
  }, []);

  airlift.flowStore.nodes.map((node) => node.position.x + node.position.y);
  const nodes = useMemo(() => {
    return Array.from(airlift.flowStore.nodes);
  }, [getSnapshot(airlift.flowStore.nodes)]);

  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const onConnect = useCallback(
    (params: any) => setEdges((es) => es.concat(params)),
    []
  );

  const onDragOver = useCallback((event: any) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);

  const getId = (nodeType: string) =>
    `airlift_${nodeType}_${airlift.flowStore.nodes.length + 1}`;

  const onDrop = useCallback(
    (event: any) => {
      event.preventDefault();

      // @ts-ignore
      const reactFlowBounds = reactFlowWrapper.current!.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');

      // check if the dropped element is valid
      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = reactFlowInstance!.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });
      const newNode = {
        id: getId(type),
        type,
        position,
        data: { label: `${type} node`, value: 123, agent: 'asdf' },
      };

      AirliftActions.dropAirlift(newNode);
    },
    [reactFlowInstance]
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
      <ReactFlowProvider>
        <div style={{ flexGrow: 1, height: '100%' }} ref={reactFlowWrapper}>
          <ReactFlow
            id="airlift-manager"
            nodes={nodes}
            edges={edges}
            onNodesChange={AirliftActions.onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            nodeTypes={nodeTypes}
            panOnDrag={false}
            zoomOnDoubleClick={false}
            zoomOnPinch={false}
            zoomOnScroll={false}
            onMouseDownCapture={() => {
              dispatchEvent(new MouseEvent('mousedown'));
            }}
            onNodeDrag={(event) => {
              const mouseEventInit: MouseEventInit = {
                clientX: event.clientX,
                clientY: event.clientY,
                screenX: event.clientX,
                screenY: event.clientY,
                bubbles: true,
                cancelable: true,
              };
              dispatchEvent(new MouseEvent('mousemove', mouseEventInit));
            }}
            onNodeDragStop={() => {
              dispatchEvent(new MouseEvent('mouseup'));
            }}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onDragEnter={(event) => {
              event.preventDefault();
            }}
            onDragLeave={(event) => {
              event.preventDefault();
            }}
            fitViewOptions={{ minZoom: 1, maxZoom: 1 }}
            autoPanOnNodeDrag={false}
            proOptions={{ hideAttribution: true }}
          />
        </div>
      </ReactFlowProvider>
    </motion.div>
  );
};

export const AirliftManager = observer(AirliftManagerPresenter);
