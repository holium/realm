import styled from 'styled-components';
import { motion } from 'framer-motion';

interface ColorTileProps {
  tileColor: string;
}
export const ColorTile = styled(motion.div)<ColorTileProps>`
  background: ${(props: ColorTileProps) => props.tileColor};
  height: 30px;
  width: 30px;
  cursor: none;
  position: relative;
  outline: none;
  float: left;
  border-radius: 4px;
  margin: 0px 6px 0px 0px;
`;
interface ColorPopoverProps {
  isOpen: boolean;
}
export const ColorTilePopover = styled(motion.div)<ColorPopoverProps>`
  position: absolute;
  z-index: 3;
  top: 40px;
  left: -6px;
  width: 170px;
  .cursor-style {
    div {
      cursor: none !important;
    }
  }
  display: ${(props: ColorPopoverProps) => (props.isOpen ? 'block' : 'none')};
`;
