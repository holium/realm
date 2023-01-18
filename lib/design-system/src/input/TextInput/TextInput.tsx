import { InputBox, Input, InputBoxProps } from '../../';

type TextInputProps = {
  id: string;
  name: string;
  type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url';
  required?: boolean;
  value?: string;
  placeholder?: string;
  defaultValue?: string;
} & Partial<InputBoxProps>;

export const TextInput = ({
  id,
  name,
  type = 'text',
  required = false,
  value,
  placeholder,
  defaultValue,
  tabIndex,
  disabled,
  onChange,
  onFocus,
  onBlur,
  onKeyDown,
  ...inutBoxProps
}: TextInputProps) => (
  <InputBox {...{ px: 2, inputId: id, inutBoxProps }}>
    <Input
      id={id}
      name={name}
      type={type}
      placeholder={placeholder}
      defaultValue={defaultValue}
      value={value}
      required={required}
      tabIndex={tabIndex}
      disabled={disabled}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
    />
  </InputBox>
);
