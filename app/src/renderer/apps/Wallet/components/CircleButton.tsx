import { FC } from 'react';

import { Flex, Icon, Text, IconPathsType } from '@holium/design-system';
import styled from 'styled-components';
import { motion } from 'framer-motion';

interface CircleButtonProps {
  icon: IconPathsType;
  iconColor?: string;
  title?: string;
}

const CircleBtn = styled(motion.div)`
  border-radius: 50%;
  height: 32px;
  width: 32px;
  cursor: pointer;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(var(--rlm-overlay-hover-rgba));
  transition: var(--transition);
  /* &:hover {
        transition: var(--transition);
        background-color: rgba(var(--rlm-overlay-hover-rgba));
      } */
  svg: {
    path: {
      fill: white;
    }
  }
`;

const FullButton = styled(Flex)`
  cursor: pointer;

  &:hover {
    transition: var(--transition);
    ${CircleBtn} {
      transition: var(--transition);
      background-color: rgba(var(--rlm-accent-rgba));
    }
    ${Text} {
      transition: var(--transition);
    }
  }
`;

export const CircleButton: FC<CircleButtonProps> = (
  props: CircleButtonProps
) => {
  const { icon, title } = props;
  // const { walletStore } = useMst();

  return (
    <FullButton
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
    >
      <CircleBtn>
        <Icon name={icon} size={24} />
      </CircleBtn>
      {title && (
        <Text.Body mt={2} fontWeight={300} fontSize={2}>
          {title}
        </Text.Body>
      )}
    </FullButton>
  );
};
