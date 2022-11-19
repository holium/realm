import { ComponentProps, useEffect, useRef } from 'react';
import { Flex } from '../Flex/Flex';

type Props = {
  height: number;
  rerenderList?: () => void;
} & ComponentProps<typeof Flex>;

export const VirtualizedRowWithDynamicHeight = ({
  height,
  rerenderList,
  children,
  ...rest
}: Props) => {
  const initialHeight = useRef(height);

  useEffect(() => {
    if (initialHeight.current !== height && rerenderList) {
      rerenderList();
      initialHeight.current = height;
    }
  }, [rerenderList, height]);

  return (
    <Flex flex={1} height={height} {...rest}>
      {children}
    </Flex>
  );
};
