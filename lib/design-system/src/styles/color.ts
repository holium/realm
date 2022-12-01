type RealmColors =
  | 'base'
  | 'accent'
  | 'input'
  | 'border'
  | 'window'
  | 'card'
  | 'text'
  | 'icon';

export type ColorProps = {
  bg?: RealmColors;
  color?: RealmColors;
  borderColor?: RealmColors;
};

export const colorToTailwindClass = ({ bg, color, borderColor }: ColorProps) =>
  [
    bg && `bg-${bg}`,
    color && `text-${color}`,
    borderColor && `border-${borderColor}`,
  ].filter(Boolean) as string[];
