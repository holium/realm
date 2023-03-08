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
import { TextInputNode } from 'renderer/apps/Airlift/nodes/TextInputNode';
import { Node3D } from 'renderer/apps/Airlift/nodes/Node3D';
import { Gate } from 'renderer/apps/Airlift/nodes/Gate';
import { UqbarContractNode } from 'renderer/apps/Airlift/nodes/UqbarContractNode';
import { PortalNode } from 'renderer/apps/Airlift/nodes/PortalNode';
import { RelicNode } from 'renderer/apps/Airlift/nodes/RelicNode';
import { RoomNode } from 'renderer/apps/Airlift/nodes/RoomNode';
import { ToggleNode } from 'renderer/apps/Airlift/nodes/ToggleNode';

const AirliftManagerPresenter = () => {
  const { shell, airlift, desktop, spaces } = useServices();
  const id = 'airlift-fill';

  const nodeTypes = useMemo(() => {
    return {
      button: ToggleNode,
      toggle: ToggleNode,
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
      portal: PortalNode,
      wallet: WalletNode,
      relic: RelicNode,
      room: RoomNode,
    };
  }, []);

  const nodes = useMemo(() => {
    return Array.from(
      spaces.selected ? airlift.nodes.get(spaces.selected?.path) || [] : []
    );
  }, [getSnapshot(airlift.nodes), spaces.selected]);

  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const onConnect = useCallback(
    (params: any) => setEdges((es: any) => es.concat(params)),
    []
  );

  const onDragOver = useCallback((event: any) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);

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
        x: event.clientX - reactFlowBounds.left - 15,
        y: event.clientY - reactFlowBounds.top - 15,
      });
      // const airliftId = getId(type);
      const airliftCount = spaces.selected
        ? airlift.nodes.get(spaces.selected?.path)?.length || 0
        : 0;
      const airliftId = `airlift_${type}_${airliftCount + 1}`;
      const newNode: any = {
        id: airliftId,
        type,
        position,
        data: {
          id: airliftId,
          showDelete: false,
          created: false,
          /*agent: {
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
                view: 'options', },
            },
          },*/
        },
      };
      if (type === 'agent') {
        newNode.data.agent = {
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
        };
      }
      if (spaces.selected)
        AirliftActions.dropAirlift(spaces.selected.path, newNode);
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
            onNodeDrag={(event: any, node: any) => {
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
                if (overlap && spaces.selected) {
                  AirliftActions.promptDelete(
                    spaces.selected.path,
                    draggedNode.getAttribute('data-id')!
                  );
                } else {
                  if (spaces.selected)
                    AirliftActions.unpromptDelete(
                      spaces.selected.path,
                      draggedNode.getAttribute('data-id')!
                    );
                }
              }
            }}
            onNodeDragStop={(_: any, node: any) => {
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
                if (overlap && spaces.selected) {
                  AirliftActions.removeAirlift(
                    spaces.selected.path,
                    draggedNode.getAttribute('data-id')!
                  );
                }
              }
            }}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onDragEnter={(event: any) => {
              event.preventDefault();
            }}
            onDragLeave={(event: any) => {
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
