import { ComponentProps, ReactNode } from 'react';
import { Field } from 'formik';
import styled, { css } from 'styled-components';

const FormFieldInput = styled(Field)`
  flex: 1;
  gap: 6px;
  height: 40px;
  padding: 0 6px;
  appearance: none;
  outline: none;
  border: none;
  color: rgba(var(--rlm-text-rgba));
  background-color: rgba(var(--rlm-input-rgba));
  font-family: var(--rlm-font);

  &[type='password'] {
    letter-spacing: 0.25em;
  }
  &::placeholder {
    color: rgba(var(--rlm-text-rgba), 0.5);
  }

  /* Gets rid of Chrome's autofill styling */
  input:-webkit-autofill,
  input:-webkit-autofill:focus {
    transition: background-color 600000s 0s, color 600000s 0s;
  }
`;

type ContainerProps = {
  isError?: boolean;
  rightIcon?: ReactNode;
};

const FormFieldContainer = styled.div<ContainerProps>`
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
`;

const FormFieldIconContainer = styled.div`
  margin-right: 6px;
`;

type Props = ComponentProps<typeof Field> & ContainerProps;

export const FormField = ({ isError, rightIcon, ...formikProps }: Props) => (
  <FormFieldContainer isError={isError}>
    <FormFieldInput {...formikProps} />
    {rightIcon && <FormFieldIconContainer>{rightIcon}</FormFieldIconContainer>}
  </FormFieldContainer>
);
