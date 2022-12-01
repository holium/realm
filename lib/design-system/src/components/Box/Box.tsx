import { HTMLMotionProps, motion } from 'framer-motion';
import { FlexProps, flexToTailwindClass } from '../../styles/flex';
import { ColorProps, colorToTailwindClass } from '../../styles/color';
import { MarginProps, marginToTailwindClass } from '../../styles/margin';
import { PaddingProps, paddingToTailwindClass } from '../../styles/padding';
import { SizeProps, sizeToTailwindClass } from '../../styles/size';
import { twMerge } from 'tailwind-merge';

export type BoxProps = HTMLMotionProps<'div'> &
  ColorProps &
  PaddingProps &
  MarginProps &
  FlexProps &
  SizeProps;

export const Box = ({ children, className, ...rest }: BoxProps) => {
  const colorClasses = colorToTailwindClass(rest);
  const paddingClasses = paddingToTailwindClass(rest);
  const marginClasses = marginToTailwindClass(rest);
  const flexClasses = flexToTailwindClass(rest);
  const sizeClasses = sizeToTailwindClass(rest);
  const classNames = [
    className,
    ...colorClasses,
    ...paddingClasses,
    ...marginClasses,
    ...flexClasses,
    ...sizeClasses,
  ].filter(Boolean) as string[];

  return (
    <motion.div className={twMerge(...classNames)} {...rest}>
      {children}
    </motion.div>
  );
};
