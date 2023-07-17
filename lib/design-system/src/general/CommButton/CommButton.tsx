import { ColorVariants } from '../../../util';
import { Icon } from '../Icon/Icon';
import { IconPathsType } from '../Icon/icons';
import { CommCircle } from './CommButton.styles';

interface CommButtonProps {
  icon: IconPathsType;
  customBg?: ColorVariants;
  size?: number;
  isDisabled?: boolean;
  onClick: (evt: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

export const CommButton = ({
  icon,
  customBg,
  isDisabled = false,
  size = 28,
  onClick,
}: CommButtonProps) => (
  <CommCircle isDisabled={isDisabled} customBg={customBg} onClick={onClick}>
    <Icon size={size} name={icon} />
  </CommCircle>
);
