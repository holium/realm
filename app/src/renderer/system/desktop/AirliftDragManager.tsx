import { observer } from 'mobx-react';
import { motion } from 'framer-motion';
import { useServices } from 'renderer/logic/store';
import ReactFlow, { ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import { AgentNode } from 'renderer/apps/Airlift/AgentNode';
import 'renderer/apps/Airlift/AgentNode/index.css';
import { useMemo, useRef } from 'react';
import { getSnapshot } from 'mobx-state-tree';
import { WalletNode } from 'renderer/apps/Airlift/WalletNode';

const AirliftDragManagerPresenter = () => {
  const { shell, airlift, desktop } = useServices();
  const id = 'airlift-drag-fill';

  const nodeTypes = useMemo(() => {
    return {
      agent: AgentNode,
      wallet: WalletNode,
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
