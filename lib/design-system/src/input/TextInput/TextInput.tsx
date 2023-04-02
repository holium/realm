import { forwardRef } from 'react';
import { Input, TextArea } from '../Input/Input';
import { InputBox, InputBoxProps } from '../InputBox/InputBox';

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
  autoFocus?: boolean;
  inputStyle?: React.CSSProperties;
  style: React.CSSProperties;
} & Partial<InputBoxProps> & { cols?: number; rows?: number };

export const TextInput = forwardRef(
  (
    {
      id,
      name,
      type, // = 'text',
      required = false,
      value,
      placeholder,
      defaultValue,
      tabIndex,
      disabled,
      readOnly,
      autoFocus,
      style,
      inputStyle,
      onChange,
      onFocus,
      onBlur,
      onKeyDown,
      ...inputBoxProps
    }: TextInputProps,
    ref: React.Ref<HTMLInputElement>
  ) => (
    <InputBox inputId={id} disabled={disabled} style={style} {...inputBoxProps}>
      {type === 'textarea' ? (
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
          autoFocus={autoFocus}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          cols={inputBoxProps.cols}
          rows={inputBoxProps.rows}
        />
      ) : (
        <Input
          ref={ref}
          id={id}
          name={name}
          type={type}
          style={inputStyle}
          placeholder={placeholder}
          defaultValue={defaultValue}
          autoFocus={autoFocus}
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
      )}
    </InputBox>
  )
);
