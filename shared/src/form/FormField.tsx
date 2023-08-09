import { ComponentProps, ReactNode } from 'react';
import { Field } from 'formik';
import styled, { css } from 'styled-components';

export const FormFieldInput = styled(Field)`
  flex: 1;
  gap: 6px;
  height: 40px;
  padding: 0 8px;
  appearance: none;
  outline: none;
  border: none;
  color: rgba(var(--rlm-text-rgba));
  background-color: rgba(var(--rlm-input-rgba));
  font-family: var(--rlm-font);

  &[type='password'] {
    &:not(:placeholder-shown) {
      letter-spacing: 0.25em;
    }
  }
  &::placeholder {
    color: rgba(var(--rlm-text-rgba), 0.5);
  }

  /* Gets rid of Chrome's autofill styling */
  &:-webkit-autofill,
  &:-webkit-autofill:focus {
    transition: background-color 600000s 0s, color 600000s 0s;
  }

  &:disabled {
    cursor: not-allowed;
    background-color: var(--rlm-input-color);
    color: rgba(var(--rlm-text-rgba), 0.35);
  }
`;

type ContainerProps = {
  isError?: boolean;
  rightIcon?: ReactNode;
  disabled?: boolean;
};

export const FormFieldContainer = styled.div<ContainerProps>`
  display: flex;
  align-items: center;
  background-color: rgba(var(--rlm-input-rgba));
  border: 1px solid rgba(var(--rlm-border-rgba));
  border-radius: var(--rlm-border-radius-6);
  overflow: hidden;

  &:focus,
  &:focus-within {
    transition: var(--transition);
    outline: none;
    border-color: rgba(var(--rlm-accent-rgba));
  }

  ${({ isError }) =>
    isError &&
    css`
      border-color: rgba(var(--rlm-intent-alert-rgba));

      &:focus,
      &:focus-within,
      &:active {
        border-color: rgba(var(--rlm-intent-alert-rgba));
      }
    `}

  ${({ disabled }) =>
    disabled &&
    css`
      border: none;
    `}
`;

const FormFieldIconContainer = styled.div`
  display: flex;
  align-items: center;
  margin-right: 6px;
`;

type Props = ComponentProps<typeof Field> & ContainerProps;

export const FormField = ({
  isError,
  disabled,
  rightIcon,
  ...formikProps
}: Props) => (
  <FormFieldContainer isError={isError} disabled={disabled}>
    <FormFieldInput {...formikProps} disabled={disabled} />
    {rightIcon && <FormFieldIconContainer>{rightIcon}</FormFieldIconContainer>}
  </FormFieldContainer>
);
