import { FC } from 'react';
import { InputBox, BoxProps, Input, InputBoxProps, TextArea } from '../..';

type TextInputProps = {
  id: string;
  name: string;
  type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'textarea';
  required?: boolean;
  value?: string;
  rows?: number;
  cols?: number;
  autoFocus?: boolean;
} & BoxProps &
  Partial<InputBoxProps>;

export const TextInput: FC<TextInputProps> = (props: TextInputProps) => {
  const {
    id,
    name,
    type = 'text',
    required = false,
    value,
    rows = 3,
    cols = 20,
    placeholder,
    defaultValue,
  } = props;

  if (type === 'textarea') {
    return (
      <InputBox {...{ px: 2, width: 'fit-content', ...props, inputId: id }}>
        <TextArea
          id={id}
          name={name}
          className="realm-cursor-text-cursor"
          tabIndex={props.tabIndex}
          placeholder={placeholder}
          defaultValue={defaultValue}
          value={value}
          required={required}
          disabled={props.disabled}
          onChange={props.onChange}
          onFocus={props.onFocus}
          onBlur={props.onBlur}
          rows={rows}
          cols={cols}
          autoFocus={props.autoFocus}
        />
      </InputBox>
    );
  } else {
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
          autoFocus={props.autoFocus}
        />
      </InputBox>
    );
  }
};
