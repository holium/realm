import { FC } from 'react';
import { BaseInput, Icon, TextButton } from '../..';

type AvatarInputProps = {
  id: string;
  onSubmit: (url: string) => void;
};

export const AvatarInput: FC<AvatarInputProps> = (props: AvatarInputProps) => {
  const { id, onSubmit } = props;
  return (
    <BaseInput
      width={300}
      rightInteractive
      leftAdornment={<Icon name="ProfileImage" opacity={0.3} size={24} />}
      rightAdornment={
        <TextButton
          onClick={() => {
            console.log('clicking');
            // onSubmit();
          }}
        >
          Save
        </TextButton>
      }
      inputId={id}
    >
      <input id={id} tabIndex={1} placeholder="Paste image link here" />
    </BaseInput>
  );
};

AvatarInput.defaultProps = {};
