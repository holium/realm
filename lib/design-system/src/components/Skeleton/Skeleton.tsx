import { twMerge } from 'tailwind-merge';
import { Box, BoxProps } from '../Box/Box';

export const Skeleton = ({ children, className, ...rest }: BoxProps) => (
  <Box
    className={twMerge(
      'w-full rounded-md bg-[#6b6b6b14] animate-pulse',
      className
    )}
    {...rest}
  >
    {children}
  </Box>
);
