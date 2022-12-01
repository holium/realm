export type PaddingProps = {
  p?: number;
  pt?: number;
  pr?: number;
  pb?: number;
  pl?: number;
  px?: number;
  py?: number;
};

export const paddingToTailwindClass = ({
  p,
  pt,
  pr,
  pb,
  pl,
  px,
  py,
}: PaddingProps) =>
  [
    p && `p-${p}`,
    pt && `pt-${pt}`,
    pr && `pr-${pr}`,
    pb && `pb-${pb}`,
    pl && `pl-${pl}`,
    px && `px-${px}`,
    py && `py-${py}`,
  ].filter(Boolean) as string[];
