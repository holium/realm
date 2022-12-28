import { FC, useState } from 'react';
import { isImgUrl } from '../../utils';
import { BaseInput, Icon, Input, TextButton } from '../..';

type AvatarInputProps = {
  id: string;
  onSave: (url: string) => void;
};

export const AvatarInput: FC<AvatarInputProps> = (props: AvatarInputProps) => {
  const { id, onSave } = props;
  const [invalidImg, setInvalidImg] = useState(false);
  const [value, setValue] = useState('');
  return (
    <BaseInput
      width={300}
      rightInteractive
      leftAdornment={<Icon name="ProfileImage" opacity={0.3} size={24} />}
      rightAdornment={
        <TextButton
          onClick={async (evt: React.MouseEvent<HTMLButtonElement>) => {
            evt.preventDefault();
            const isImage: boolean = await isImgUrl(value);
            if (isImage) {
              setInvalidImg(false);
              onSave(value);
            } else {
              setInvalidImg(true);
            }
          }}
        >
          Save
        </TextButton>
      }
      inputId={id}
    >
      <Input
        id={id}
        tabIndex={1}
        placeholder="Paste image link here"
        value={value}
        onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
          if (evt.target.value === '') {
            setInvalidImg(false);
          }
          setValue(evt.target.value);
        }}
      />
    </BaseInput>
  );
};

AvatarInput.defaultProps = {};
