import { observer } from 'mobx-react';
import { motion } from 'framer-motion';
import { useServices } from 'renderer/logic/store';
import ReactFlow, {
  ReactFlowProvider,
  ReactFlowInstance,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { AgentNode } from 'renderer/apps/Airlift/nodes/AgentNode';
import { LinkNode } from 'renderer/apps/Airlift/nodes/LinkNode';
import 'renderer/apps/Airlift/nodes/AgentNode/index.css';
import { useCallback, useMemo, useRef, useState } from 'react';
import { AirliftActions } from 'renderer/logic/actions/airlift';
import { getSnapshot } from 'mobx-state-tree';
import { WalletNode } from 'renderer/apps/Airlift/nodes/WalletNode';
import { MediaNode } from 'renderer/apps/Airlift/nodes/MediaNode';
import { ImageNode } from 'renderer/apps/Airlift/nodes/ImageNode';
import { TextNode } from 'renderer/apps/Airlift/nodes/TextNode';
import { AudioPlayer } from 'renderer/apps/Airlift/nodes/AudioPlayer';
import { SliderNode } from 'renderer/apps/Airlift/nodes/SliderNode';
import { ColorPickerNode } from 'renderer/apps/Airlift/nodes/ColorPickerNode';
import { ButtonNode } from 'renderer/apps/Airlift/nodes/ButtonNode';
import { TextInputNode } from 'renderer/apps/Airlift/nodes/TextInputNode';
import { Node3D } from 'renderer/apps/Airlift/nodes/Node3D';
import { Gate } from 'renderer/apps/Airlift/nodes/Gate';
import { UqbarContractNode } from 'renderer/apps/Airlift/nodes/UqbarContractNode';
import { Portal } from 'renderer/apps/Airlift/nodes/Portal';
import { RelicNode } from 'renderer/apps/Airlift/nodes/RelicNode';
import { RoomNode } from 'renderer/apps/Airlift/nodes/RoomNode';

const AirliftManagerPresenter = () => {
  const { shell, airlift, desktop } = useServices();
  const id = 'airlift-fill';

  const nodeTypes = useMemo(() => {
    return {
      button: ButtonNode,
      textinput: TextInputNode,
      slider: SliderNode,
      colorpicker: ColorPickerNode,
      text: TextNode,
      image: ImageNode,
      link: LinkNode,
      audio: AudioPlayer,
      media: MediaNode,
      '3d': Node3D,
      agent: AgentNode,
      gate: Gate,
      uqbar: UqbarContractNode,
      portal: Portal,
      wallet: WalletNode,
      relic: RelicNode,
      room: RoomNode,
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
      const airliftId = getId(type);
      const newNode = {
        id: airliftId,
        type,
        position,
        data: {
          id: airliftId,
          showDelete: false,
          agent: {
            expanded: false,
            arms: {
              'on-init': {
                name: 'on-init',
                body: 'body',
                expanded: false,
                view: 'options',
              },
              'on-save': {
                name: 'on-save',
                body: 'body',
                expanded: false,
                view: 'options',
              },
              'on-load': {
                name: 'on-load',
                body: 'body',
                expanded: false,
                view: 'options',
              },
              'on-poke': {
                name: 'on-poke',
                body: 'body',
                expanded: false,
                view: 'options',
              },
              'on-watch': {
                name: 'on-watch',
                body: 'body',
                expanded: false,
                view: 'options',
              },
              'on-leave': {
                name: 'on-leave',
                body: 'body',
                expanded: false,
                view: 'options',
              },
              'on-peek': {
                name: 'on-peek',
                body: 'body',
                expanded: false,
                view: 'options',
              },
              'on-agent': {
                name: 'on-agent',
                body: 'body',
                expanded: false,
                view: 'options',
              },
              'on-arvo': {
                name: 'on-arvo',
                body: 'body',
                expanded: false,
                view: 'options',
              },
              'on-fail': {
                name: 'on-fail',
                body: 'body',
                expanded: false,
                view: 'options',
              },
            },
          },
        },
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
            onNodeDrag={(event, node) => {
              const mouseEventInit: MouseEventInit = {
                clientX: event.clientX,
                clientY: event.clientY,
                screenX: event.clientX,
                screenY: event.clientY,
                bubbles: true,
                cancelable: true,
              };
              dispatchEvent(new MouseEvent('mousemove', mouseEventInit));
              const dropZone = document.getElementById('trash-bin-icon');
              if (dropZone) {
                const draggedNode = document.querySelector(
                  `[data-id='${node.id}']`
                ) as HTMLDivElement;
                const draggedRect = draggedNode.getBoundingClientRect();
                const dropZoneRect = dropZone.getBoundingClientRect();
                const overlap = !(
                  draggedRect.right < dropZoneRect.left ||
                  draggedRect.left > dropZoneRect.right ||
                  draggedRect.bottom < dropZoneRect.top ||
                  draggedRect.top > dropZoneRect.bottom
                );
                if (overlap) {
                  AirliftActions.promptDelete(
                    draggedNode.getAttribute('data-id')!
                  );
                } else {
                  AirliftActions.unpromptDelete(
                    draggedNode.getAttribute('data-id')!
                  );
                }
              }
            }}
            onNodeDragStop={(_, node) => {
              dispatchEvent(new MouseEvent('mouseup'));
              const dropZone = document.getElementById('trash-bin-icon');
              if (dropZone) {
                const draggedNode = document.querySelector(
                  `[data-id='${node.id}']`
                ) as HTMLDivElement;
                const draggedRect = draggedNode.getBoundingClientRect();
                const dropZoneRect = dropZone.getBoundingClientRect();
                const overlap = !(
                  draggedRect.right < dropZoneRect.left ||
                  draggedRect.left > dropZoneRect.right ||
                  draggedRect.bottom < dropZoneRect.top ||
                  draggedRect.top > dropZoneRect.bottom
                );
                if (overlap) {
                  AirliftActions.removeAirlift(
                    draggedNode.getAttribute('data-id')!
                  );
                }
              }
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
