import { useState } from 'react';
import styled, { css } from 'styled-components';

const sizeMap = {
  sm: {
    width: 36,
    height: 22,
    dot: 14,
  },
  md: {
    width: 48,
    height: 28,
    dot: 20,
  },
  lg: {
    width: 56,
    height: 32,
    dot: 24,
  },
};

type ToggleProps = {
  initialChecked?: boolean;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onChange: (checked: boolean) => void;
};

export const Toggle = ({
  initialChecked = false,
  size = 'sm',
  disabled,
  onChange,
}: ToggleProps) => {
  const [checked, setChecked] = useState(initialChecked);
  return (
    <ToggleStyle size={size} isDisabled={disabled}>
      <label className="toggle-switch">
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(evt) => {
            if (disabled) return;
            setChecked(evt.currentTarget.checked);
            onChange(evt.currentTarget.checked);
          }}
        />
        <span className="toggle-slider round"></span>
      </label>
    </ToggleStyle>
  );
};

type ToggleStyleProps = {
  size: 'sm' | 'md' | 'lg';
  isDisabled?: boolean;
};

export const ToggleStyle = styled.div<ToggleStyleProps>`
  .toggle-switch {
    position: relative;
    display: inline-block;
    width: ${(props) => sizeMap[props.size].width}px;
    height: ${(props) => sizeMap[props.size].height}px;
  }

  .toggle-switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .toggle-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--rlm-overlay-active);
    transition: 0.4s;
  }

  .toggle-slider:before {
    position: absolute;
    content: '';
    height: ${(props) => sizeMap[props.size].dot}px;
    width: ${(props) => sizeMap[props.size].dot}px;
    left: 4px;
    bottom: 4px;
    background-color: var(--rlm-input-color);
    -webkit-transition: 0.4s;
    transition: 0.4s;
  }

  input:checked + .toggle-slider {
    background-color: var(--rlm-accent-color);
  }

  input:focus + .toggle-slider {
    box-shadow: 0 0 1px var(--rlm-accent-color);
  }

  input:checked + .toggle-slider:before {
    -webkit-transform: translateX(${(props) => sizeMap[props.size].dot}px);
    -ms-transform: translateX(${(props) => sizeMap[props.size].dot}px);
    transform: translateX(${(props) => sizeMap[props.size].dot}px);
  }

  /* Rounded sliders */
  .toggle-slider.round {
    border-radius: 34px;
  }

  .toggle-slider.round:before {
    border-radius: 50%;
  }

  ${(props) =>
    props.isDisabled &&
    css`
      opacity: 0.5;
      pointer-events: none;
    `}
`;
