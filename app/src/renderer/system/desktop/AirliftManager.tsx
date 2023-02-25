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
  const { shell, airlift, desktop } = useServices();
  const id = 'airlift-fill';

  const nodeTypes = useMemo(() => {
    return {
      agent: AgentNode,
    };
  }, []);

  airlift.flowStore.nodes.map((node) => node.position.x + node.position.y);
  const nodes = useMemo(() => {
    return Array.from(airlift.flowStore.nodes.slice().values());
  }, [
    airlift.flowStore.nodes.map((node) => [node.position.x, node.position.y]),
  ]);

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
      console.log('ondrop success', event);
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
            fitView
            panOnDrag={false}
            zoomOnDoubleClick={false}
            zoomOnPinch={false}
            zoomOnScroll={false}
            onMouseDownCapture={() => {
              dispatchEvent(new MouseEvent('mousedown'));
            }}
            /*onNodeDragStart={(event) => {
              const draggedNode = event.currentTarget;
              const clonedNodeElement = draggedNode.cloneNode(
                true
              ) as HTMLDivElement;
              // clonedNodeElement.style.overflow = 'auto';
              document.body.appendChild(clonedNodeElement);
              var w = 1000;
              var h = 1000;
              var canvas = document.createElement('canvas');
              canvas.width = w * 2;
              canvas.height = h * 2;
              canvas.style.width = w + 'px';
              canvas.style.height = h + 'px';
              var context = canvas.getContext('2d')!;
              context.scale(2, 2);
              html2canvas(clonedNodeElement, {
                backgroundColor: null,
                height: clonedNodeElement.scrollHeight,
                canvas,
              }).then((canvas) => {
                const serializedNode = canvas.toDataURL();
                dispatchEvent(
                  new CustomEvent('airlift', {
                    detail: serializedNode,
                  })
                );
                document.body.removeChild(clonedNodeElement);
              });
            }}*/
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
          />
        </div>
      </ReactFlowProvider>
    </motion.div>
  );
};

export const AirliftManager = observer(AirliftManagerPresenter);
