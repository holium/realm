import { Box, BoxProps } from '../Box/Box';

export const Flex = ({ children, ...rest }: BoxProps) => (
  <Box isFlex {...rest}>
    {children}
  </Box>
);
