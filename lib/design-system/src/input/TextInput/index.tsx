import { FC } from 'react';
import { InputBox, BoxProps, Input, InputBoxProps } from '../..';

type TextInputProps = {
  id: string;
  name: string;
  type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url';
  required?: boolean;
  value?: string;
} & BoxProps &
  Partial<InputBoxProps>;

export const TextInput: FC<TextInputProps> = (props: TextInputProps) => {
  const {
    id,
    name,
    type = 'text',
    required = false,
    value,
    placeholder,
    defaultValue,
  } = props;

  return (
    <InputBox {...{ px: 2, ...props, inputId: id }}>
      <Input
        id={id}
        name={name}
        tabIndex={props.tabIndex}
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        value={value}
        required={required}
        disabled={props.disabled}
        onChange={props.onChange}
        onFocus={props.onFocus}
        onBlur={props.onBlur}
        onKeyDown={props.onKeyDown}
      />
    </InputBox>
  );
};
