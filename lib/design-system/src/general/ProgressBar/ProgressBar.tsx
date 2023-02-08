import { FC } from 'react';
import styled from 'styled-components';
import { Box, BoxProps } from '../../';

const Bar = styled(Box)`
  background-color: var(--rlm-input-color);
  border: 1px solid var(--rlm-border-color);
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
  background-color: ${(props) => props.background || 'var(--rlm-accent-color)'};
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
