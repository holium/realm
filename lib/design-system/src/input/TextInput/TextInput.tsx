import { Input, TextArea } from '../Input/Input';
import InputBox, { InputBoxProps } from '../InputBox/InputBox';

type TextInputProps = {
  id: string;
  name: string;
  type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'textarea';
  required?: boolean;
  value?: string;
  disabled?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  defaultValue?: string;
} & Partial<InputBoxProps>;

export const TextInput = ({
  id,
  name,
  type,// = 'text',
  required = false,
  value,
  placeholder,
  defaultValue,
  tabIndex,
  disabled,
  readOnly,
  onChange,
  onFocus,
  onBlur,
  onKeyDown,
  ...inutBoxProps
}: TextInputProps) => (
  <InputBox inputId={id} disabled={disabled} {...inutBoxProps}>
    {type === 'textarea' ?
    <TextArea
      id={id}
      name={name}
      placeholder={placeholder}
      defaultValue={defaultValue}
      value={value}
      required={required}
      tabIndex={tabIndex}
      disabled={disabled}
      readOnly={readOnly}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
    />
    :
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
      readOnly={readOnly}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
    /> }
  </InputBox>
);
