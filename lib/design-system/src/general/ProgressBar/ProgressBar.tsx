import { FC } from 'react';
import styled from 'styled-components';
import { Box, BoxProps } from '../Box/Box';

const Bar = styled(Box)`
  background-color: rgba(var(--rlm-input-rgba));
  border: 1px solid rgba(var(--rlm-border-rgba));
  height: 12px;
  padding: 2px 1px;
  width: 100%;
  border-radius: 6px;
  display: flex;
  align-items: center;
`;

const Progress = styled(Box)`
  height: 8px;
  border-radius: 4px;
  background-color: ${(props) =>
    props.background || 'rgba(var(--rlm-accent-rgba))'};
`;

type ProgressBarProps = {
  percentage: number; // 1-100
  progressColor?: string;
} & BoxProps;

export const ProgressBar: FC<ProgressBarProps> = (props: ProgressBarProps) => {
  const { percentage, progressColor } = props;

  return (
    <Bar>
      <Progress
        background={progressColor}
        initial={{ width: '0%' }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.5, default: { ease: 'linear' } }}
      />
    </Bar>
  );
};
