import { useRef, useEffect } from 'react';

type Props = {
  index: number;
  children: JSX.Element;
  setSize: (index: number, size: number) => void;
};

export const WindowedRow = ({ index, children, setSize }: Props) => {
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (rowRef.current) {
      const rowHeight = rowRef.current.getBoundingClientRect().height;
      setSize(index, rowHeight);
    }
  }, [setSize, index]);

  return <div ref={rowRef}>{children}</div>;
};
