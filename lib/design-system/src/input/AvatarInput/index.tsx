import { FC } from 'react';
import { BaseInput, Icon } from '../..';

type AvatarInputProps = {
  id: string;
  onSubmit: (url: string) => void;
};

export const AvatarInput: FC<AvatarInputProps> = (props: AvatarInputProps) => {
  const { id } = props;
  return (
    <BaseInput
      width={300}
      rightInteractive
      leftAdornment={<Icon name="ProfileImage" opacity={0.3} size={24} />}
      rightAdornment={<button>Save</button>}
      inputId={id}
    >
      <input id={id} tabIndex={1} placeholder="Paste image link here" />
    </BaseInput>
  );
};

AvatarInput.defaultProps = {};
