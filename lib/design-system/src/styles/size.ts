export type SizeProps = {
  width?: number | 'full';
  height?: number | 'full';
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
};

export const sizeToTailwindClass = ({
  width,
  height,
  minWidth,
  minHeight,
  maxWidth,
  maxHeight,
}: SizeProps) =>
  [
    width && `w-${width}`,
    height && `h-${height}`,
    minWidth && `min-w-${minWidth}`,
    minHeight && `min-h-${minHeight}`,
    maxWidth && `max-w-${maxWidth}`,
    maxHeight && `max-h-${maxHeight}`,
  ].filter(Boolean) as string[];
