import { motion } from 'framer-motion';
import styled from 'styled-components';

import { Spinner, Text } from '@holium/design-system/general';

const Container = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 54px;
  gap: 16px;
  background-color: rgba(var(--rlm-accent-rgba), 0.1);
`;

export const InboxBodyLoadingHeader = () => (
  <Container
    exit={{ opacity: 0, y: -54 }}
    transition={{ duration: 0.2, ease: 'easeInOut' }}
  >
    <Spinner size="16px" width={1.5} color="var(--rlm-text-color)" />
    <Text.Body>Syncing messages...</Text.Body>
  </Container>
);
