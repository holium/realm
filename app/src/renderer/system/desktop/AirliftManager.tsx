import { observer } from 'mobx-react';
import { motion } from 'framer-motion';
import { useServices } from 'renderer/logic/store';
import { Airlift } from 'renderer/apps/Airlift';

const AirliftManagerPresenter = () => {
  // const { getOptions, setOptions } = useContextMenu();
  const { shell, airlift, desktop, spaces } = useServices();
  const id = 'airlift-fill';

  const airlifts = Array.from(
    airlift.airlifts.get(spaces.selected!.path)?.values() || []
  );

  console.log('airlifts', airlifts);

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
      {airlifts.map((airlift: any, index: number) => {
        return (
          <Airlift key={`${airlift.airliftId}-${index}`} airlift={airlift} />
        );
      })}
    </motion.div>
  );
};

export const AirliftManager = observer(AirliftManagerPresenter);
