import { FC, useState } from 'react';
import { BoxProps, Icon, Button } from '../../';
import { Input } from '../Input/Input';
import InputBox from '../InputBox/InputBox';
import { isImgUrl } from '../../util/strings';

type AvatarInputProps = {
  id: string;
  tabIndex?: number;
  initialValue?: string;
  onSave: (url: string) => void;
} & BoxProps;

export const AvatarInput: FC<AvatarInputProps> = (props: AvatarInputProps) => {
  const { id, tabIndex, initialValue, onSave } = props;
  const [invalidImg, setInvalidImg] = useState(false);
  const [value, setValue] = useState(initialValue || '');
  const [success, setSuccess] = useState(false);

  let textButtonContent: string | JSX.Element = 'Save';
  if (invalidImg) textButtonContent = 'Clear';
  if (success) textButtonContent = <Icon name="CheckCircle" />;

  return (
    <InputBox
      {...props}
      tabIndex={tabIndex}
      leftAdornment={<Icon name="ProfileImage" opacity={0.3} size={24} />}
      rightAdornment={
        <Button.TextButton
          color={invalidImg ? 'intent-alert' : 'accent'}
          onClick={async (evt: React.MouseEvent<HTMLButtonElement>) => {
            if (invalidImg) {
              setInvalidImg(false);
              setValue('');
              setSuccess(false);
              return;
            }
            evt.preventDefault();
            const isImage: boolean = await isImgUrl(value);
            if (isImage) {
              setInvalidImg(false);
              setSuccess(true);
              onSave(value);
            } else {
              setInvalidImg(true);
              setSuccess(false);
            }
          }}
        >
          {textButtonContent}
        </Button.TextButton>
      }
      error={invalidImg ? 'Invalid image url' : undefined}
      inputId={id}
    >
      <Input
        id={id}
        tabIndex={1}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        className="realm-cursor-text-cursor"
        placeholder="Paste image link here"
        value={value}
        onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
          if (evt.target.value === '') {
            setInvalidImg(false);
            setSuccess(false);
          }
          setValue(evt.target.value);
        }}
        onKeyDown={props.onKeyDown}
      />
    </InputBox>
  );
};
