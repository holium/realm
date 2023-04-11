import { ReactNode } from 'react';
import { Flex } from '@holium/design-system';

export const OnboardingDialogWrapper = ({
  children,
}: {
  children: ReactNode;
}) => (
  <Flex
    className="wallpaper"
    justifyContent="center"
    alignItems="center"
    width="100%"
    height="calc(100vh - 32px)"
  >
    {children}
  </Flex>
);
