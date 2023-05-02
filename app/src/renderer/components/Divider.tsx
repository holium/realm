import { motion } from 'framer-motion';
import styled from 'styled-components';
import { compose, space, SpaceProps } from 'styled-system';

type IProps = {
  customBg?: string;
} & SpaceProps;

export const Divider = styled(motion.div)<IProps>`
  display: inline-block;
  width: 2px;
  background-color: ${(props: IProps) =>
    props.customBg || 'rgba(var(--rlm-icon-rgba), 0.5)'};
  margin: 0 16px;
  border-radius: 6px;
  height: 1.3em;
  ${compose(space)}
`;

Divider.defaultProps = {
  ml: 4,
  mr: 4,
};
