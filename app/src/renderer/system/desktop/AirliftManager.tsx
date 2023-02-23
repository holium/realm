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

const AirliftManagerPresenter = () => {
  // const { getOptions, setOptions } = useContextMenu();
  const { shell, airlift, desktop, spaces } = useServices();
  const id = 'airlift-fill';

  const airlifts = Array.from(
    (spaces.selected && airlift.airlifts.get(spaces.selected.path)?.values()) ||
      []
  );

  /*const initialNodes = [
    {
      id: '2',
      data: { value: 123 },
      position: { x: 100, y: 100 },
      type: 'agent',
    },
  ];*/

  /*const initialNodes = airlifts.map((airlift) => {
    return {
      id: airlift.airliftId,
      data: { value: 123 },
      // position: { x: 100, y: 100 },
      position: airlift.bounds,
      type: 'agent',
    };
  });*/

  const nodeTypes = useMemo(() => {
    return {
      agent: AgentNode,
    };
  }, []);

  // const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  // console.log('nodes', nodes);
  const nodes = Array.from(airlift.flowStore.nodes.values());

  // const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const onConnect = useCallback(
    (params: any) => setEdges((es) => es.concat(params)),
    []
  );

  const onDragOver = useCallback((event: any) => {
    event.preventDefault();
    console.log('dragging over');
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);

  const getId = (nodeType: string) =>
    `airlift_${nodeType}_${airlift.flowStore.nodes.length + 1}`;

  const onDrop = useCallback(
    (event: any) => {
      console.log('ondrop success');
      event.preventDefault();

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
        data: { label: `${type} node`, value: 123 },
      };
      console.log(newNode);

      /*AirliftActions.dropAirlift(
        spaces.selected!.path,
        type,
        getId(type),
        position
      );*/
      AirliftActions.dropAirlift(newNode);
      // setNodes((nds) => nds.concat(newNode));
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
            nodes={nodes}
            edges={edges}
            onNodesChange={AirliftActions.onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            nodeTypes={nodeTypes}
            fitView
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
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragEnter={() => console.log('drag enter')}
            onClick={() => console.log('click')}
          />
        </div>
      </ReactFlowProvider>
    </motion.div>
  );
};

export const AirliftManager = observer(AirliftManagerPresenter);
