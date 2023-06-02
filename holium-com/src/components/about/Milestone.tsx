import { useEffect, useRef } from 'react';
import { MOBILE_WIDTH } from 'consts';
import { motion, useAnimation, useInView } from 'framer-motion';
import styled from 'styled-components';

import { Flex, Text } from '@holium/design-system/general';

const MilestoneCard = styled(Flex)<{ rightSide: boolean }>`
  flex-direction: column;
  background: rgba(var(--rlm-window-bg-rgba));
  box-shadow: var(--rlm-box-shadow-1);
  border: 1px solid var(--rlm-border-color);
  border-radius: 12px;
  padding: 16px;
  gap: 8px;
  width: 100%;

  ${({ rightSide }) =>
    rightSide &&
    `
    @media (min-width: ${MOBILE_WIDTH}px) {
      transform: translateX(calc(100% + 48px));
    }
  `}
`;

const MilestoneTitle = styled(Text.H5)`
  font-weight: 500;
`;

const MilestoneDescription = styled(Text.Body)`
  font-weight: 300;
  opacity: 0.7;
`;

// Rightside cards should slide in from the right
// Leftside cards should slide in from the left
const getBoxVariant = (rightSide: boolean) => {
  if (rightSide) {
    return {
      hidden: { x: 50, opacity: 0 },
      visible: { x: 0, opacity: 1 },
    };
  }

  return {
    hidden: { x: -50, opacity: 0 },
    visible: { x: 0, opacity: 1 },
  };
};

type MilestoneProps = {
  index: number;
  title: string;
  description: string;
  rightSide?: boolean;
};

export const Milestone = ({
  index,
  title,
  description,
  rightSide = false,
}: MilestoneProps) => {
  const control = useAnimation();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);

  useEffect(() => {
    control.start('hidden');
  }, [control]);

  useEffect(() => {
    if (inView) {
      control.start('visible');
    }
  }, [control, inView]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={control}
      transition={{
        ease: 'easeInOut',
        duration: 0.5,
        delay: 0.25 + index * 0.1,
      }}
      variants={getBoxVariant(rightSide)}
    >
      <MilestoneCard rightSide={rightSide}>
        <MilestoneTitle>{title}</MilestoneTitle>
        <MilestoneDescription>{description}</MilestoneDescription>
      </MilestoneCard>
    </motion.div>
  );
};
