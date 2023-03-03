import { isValidElement, MouseEvent, ReactNode } from 'react';
import { Slot } from '@radix-ui/react-slot';

type Props = {
  id: string;
  children: ReactNode;
  asChild?: boolean;
  onOtherClick?: (patp: string) => void;
  onClick?: (event: MouseEvent) => void;
  onOtherOver?: (patp: string) => void;
  onMouseOver?: (event: MouseEvent) => void;
  onOtherUp?: (patp: string) => void;
  onMouseUp?: (event: MouseEvent) => void;
  onOtherDown?: (patp: string) => void;
  onMouseDown?: (event: MouseEvent) => void;
  onOtherOut?: (patp: string) => void;
  onMouseOut?: (event: MouseEvent) => void;
};

export const Clickable = ({
  id,
  children,
  asChild,
}: // onOtherClick,
// onClick,
// onOtherOver,
// onMouseOver,
// onOtherUp,
// onMouseUp,
// onOtherDown,
// onMouseDown,
// onOtherOut,
// onMouseOut,
Props) => {
  const Component = asChild && isValidElement(children) ? Slot : 'button';

  return <Component data-multi-click-id={id} />;
};
