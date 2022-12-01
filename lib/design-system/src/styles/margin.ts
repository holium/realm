export type MarginProps = {
  m?: number;
  mt?: number;
  mr?: number;
  mb?: number;
  ml?: number;
  mx?: number;
  my?: number;
};

export const marginToTailwindClass = ({
  m,
  mt,
  mr,
  mb,
  ml,
  mx,
  my,
}: MarginProps) =>
  [
    m && `m-${m}`,
    mt && `mt-${mt}`,
    mr && `mr-${mr}`,
    mb && `mb-${mb}`,
    ml && `ml-${ml}`,
    mx && `mx-${mx}`,
    my && `my-${my}`,
  ].filter(Boolean) as string[];
