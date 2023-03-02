import { observer } from 'mobx-react';
import { motion } from 'framer-motion';
import { useServices } from 'renderer/logic/store';
import ReactFlow, { ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import { AgentNode } from 'renderer/apps/Airlift/nodes/AgentNode';
import 'renderer/apps/Airlift/nodes/AgentNode/index.css';
import { useMemo, useRef } from 'react';
import { getSnapshot } from 'mobx-state-tree';
import { WalletNode } from 'renderer/apps/Airlift/nodes/WalletNode';
import { ButtonNode } from 'renderer/apps/Airlift/nodes/ButtonNode';
import { SliderNode } from 'renderer/apps/Airlift/nodes/SliderNode';
import { TextNode } from 'renderer/apps/Airlift/nodes/TextNode';
import { LinkNode } from 'renderer/apps/Airlift/nodes/LinkNode';
import { AudioPlayer } from 'renderer/apps/Airlift/nodes/AudioPlayer';
import { MediaNode } from 'renderer/apps/Airlift/nodes/MediaNode';
import { Portal } from 'renderer/apps/Airlift/nodes/PortalNode';
import { UqbarContractNode } from 'renderer/apps/Airlift/nodes/UqbarContractNode';
import { ImageNode } from 'renderer/apps/Airlift/nodes/ImageNode';
import { TextInputNode } from 'renderer/apps/Airlift/nodes/TextInputNode';
import { RoomNode } from 'renderer/apps/Airlift/nodes/RoomNode';
import { ColorPickerNode } from 'renderer/apps/Airlift/nodes/ColorPickerNode';
import { Gate } from 'renderer/apps/Airlift/nodes/Gate';
import { Node3D } from 'renderer/apps/Airlift/nodes/Node3D';
import { RelicNode } from 'renderer/apps/Airlift/nodes/RelicNode';

const AirliftDragManagerPresenter = () => {
  const { shell, airlift, desktop } = useServices();
  const id = 'airlift-drag-fill';

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
    return Array.from(airlift.flowStore.nodes.filter((node) => node.dragging));
  }, [getSnapshot(airlift.flowStore.nodes)]);

  const reactFlowWrapper = useRef(null);

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
        pointerEvents: 'none',
        zIndex: 16,
      }}
    >
      <ReactFlowProvider>
        <div style={{ flexGrow: 1, height: '100%' }} ref={reactFlowWrapper}>
          <ReactFlow
            id="airlift-drag-manager"
            nodes={nodes}
            nodeTypes={nodeTypes}
            panOnDrag={false}
            zoomOnDoubleClick={false}
            zoomOnPinch={false}
            zoomOnScroll={false}
            fitViewOptions={{ minZoom: 1, maxZoom: 1 }}
            autoPanOnNodeDrag={false}
            proOptions={{ hideAttribution: true }}
          />
        </div>
      </ReactFlowProvider>
    </motion.div>
  );
};

export const AirliftDragManager = observer(AirliftDragManagerPresenter);
