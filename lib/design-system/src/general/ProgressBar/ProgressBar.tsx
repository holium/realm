import styled from 'styled-components';
import { Box, BoxProps } from '../Box/Box';
import { ColorProps, colorStyle, ColorVariants } from '../../util/colors';

const Bar = styled(Box)`
  position: relative;
  background-color: rgba(var(--rlm-input-rgba));
  border: 1px solid rgba(var(--rlm-border-rgba));
  height: 12px;
  padding: 2px 1px;
  width: 100%;
  border-radius: 6px;
  display: flex;
  align-items: center;
`;

const Progress = styled(Box)<ColorProps>`
  height: 8px;
  border-radius: 4px;
  background-color: rgba(var(--rlm-accent-rgba));
  ${colorStyle};
`;

type ProgressBarProps = {
  percentages: number[];
  progressColors?: ColorVariants[];
} & BoxProps;

export const ProgressBar = ({
  percentages,
  progressColors,
}: ProgressBarProps) => (
  <Bar>
    {percentages
      .sort()
      .reverse()
      .map((percentage, index) => (
        <Progress
          key={`progress-${index}`}
          bg={progressColors?.[index]}
          style={{ position: 'absolute', left: 0, zIndex: index }}
          initial={{ width: '0%' }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, default: { ease: 'linear' } }}
        />
      ))}
  </Bar>
);
