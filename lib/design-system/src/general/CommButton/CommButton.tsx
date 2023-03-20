import { Icon } from '../Icon/Icon';
import { IconPathsType } from '../Icon/icons';
import { CommCircle } from './CommButton.styles';

interface CommButtonProps {
  icon: IconPathsType;
  customBg: string;
  onClick: (evt: any) => void;
}

export const CommButton = ({ icon, customBg, onClick }: CommButtonProps) => (
  <CommCircle customBg={customBg} onClick={(evt: any) => onClick(evt)}>
    <Icon size={24} name={icon} />
  </CommCircle>
);
