export type FlexProps = {
  isFlex?: boolean;
  flex?: number;
  flexRow?: boolean;
  flexCol?: boolean;
  alignItems?: 'start' | 'center' | 'end';
  justifyContent?: 'start' | 'center' | 'end';
  flexWrap?: boolean;
  flexWrapReverse?: boolean;
};

export const flexToTailwindClass = ({
  isFlex,
  flex,
  flexRow,
  flexCol,
  alignItems,
  justifyContent,
  flexWrap,
  flexWrapReverse,
}: FlexProps) =>
  [
    isFlex && 'flex',
    flex && `flex-${flex}`,
    flexRow && 'flex-row',
    flexCol && 'flex-col',
    alignItems && `items-${alignItems}`,
    justifyContent && `justify-${justifyContent}`,
    flexWrap && 'flex-wrap',
    flexWrapReverse && 'flex-wrap-reverse',
  ].filter(Boolean) as string[];
