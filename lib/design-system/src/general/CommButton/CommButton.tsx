import { Box, Tooltip } from '../../../general';
import { ColorVariants } from '../../../util';
import { Icon } from '../Icon/Icon';
import { IconPathsType } from '../Icon/icons';
import { CommCircle } from './CommButton.styles';

interface CommButtonProps {
  tooltip: string | null;
  icon: IconPathsType;
  customBg?: ColorVariants;
  size?: number;
  isDisabled?: boolean;
  onClick: (evt: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

export const CommButton = ({
  icon,
  tooltip,
  customBg,
  isDisabled = false,
  size = 28,
  onClick,
}: CommButtonProps) => (
  <Box position="relative">
    <Tooltip
      id={`${icon}-button`}
      content={isDisabled ? `${tooltip} permissions are disabled` : tooltip}
      placement="top"
      wrapperStyle={{
        marginTop: 10,
        display: tooltip ? 'inline-block' : 'none',
      }}
    >
      {isDisabled && (
        <Box position="absolute" right={-2} top={-2}>
          <Icon size={14} name="Error" fill="intent-alert" />
        </Box>
      )}

      <CommCircle
        isDisabled={isDisabled}
        customBg={customBg}
        onClick={!isDisabled && onClick}
      >
        <Icon size={size} name={icon} />
      </CommCircle>
    </Tooltip>
  </Box>
);
