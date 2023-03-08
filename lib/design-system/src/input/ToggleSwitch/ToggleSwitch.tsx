import { useState } from 'react';
import styled from 'styled-components';

const Switch = styled.label`
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
`;

const Slider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  border-radius: 34px;
  transition: 0.4s;

  &:before {
    position: absolute;
    content: '';
    height: 26px;
    width: 26px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    border-radius: 50%;
    transition: 0.4s;
  }
`;

const Input = styled.input`
  opacity: 0;
  width: 0;
  height: 0;

  &:checked + ${Slider} {
    background-color: #2196f3;
  }

  &:focus + ${Slider} {
    box-shadow: 0 0 1px #2196f3;
  }

  &:checked + ${Slider}:before {
    transform: translateX(26px);
  }
`;

type ToggleSwitchProps = {
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
} & Partial<ToggleSwitchProps> & { cols?: number; rows?: number };

export const ToggleSwitch = ({
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
  onChange,
  onFocus,
  onBlur,
  onKeyDown,
  ...toggleSwitchProps
}: ToggleSwitchProps) => {
  const [isChecked, setIsChecked] = useState(false);

  const handleToggle = () => {
    setIsChecked(!isChecked);
  };

  return (
    <Switch>
      <Input type="checkbox" checked={isChecked} onChange={handleToggle} />
      <Slider />
    </Switch>
  );
};
