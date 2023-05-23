import { ReactNode, useState } from 'react';
import { Formik, FormikErrors, FormikValues } from 'formik';
import * as Yup from 'yup';

import { ErrorBox, Flex, Icon, Spinner } from '@holium/design-system/general';
import { useToggle } from '@holium/design-system/util';

import {
  OnboardDialogBackButton,
  OnboardDialogBody,
  OnboardDialogBodyContainer,
  OnboardDialogCard,
  OnboardDialogFooter,
  OnboardDialogFooterBackButtonFlex,
  OnboardDialogIconContainer,
} from './OnboardDialog.styles';
import { SubmitButton } from './SubmitButton';

type Props = {
  body: (errors?: FormikErrors<FormikValues>) => ReactNode;
  icon?: ReactNode;
  initialValues?: FormikValues;
  validationSchema?: Yup.ObjectSchema<any>;
  nextText?: string;
  nextIcon?: ReactNode;
  hideNextButton?: boolean;
  footer?: ReactNode;
  onBack?: () => void;
  onNext?: (values: FormikValues) => Promise<boolean>;
};

export const OnboardDialog = ({
  body,
  icon,
  initialValues = {},
  validationSchema,
  nextText = 'Next',
  nextIcon,
  hideNextButton,
  footer,
  onBack,
  onNext,
}: Props) => {
  const hasUntouchedFields = useToggle(true);
  const [submitErrorMessage, setSubmitErrorMessage] = useState<string | null>();

  const formValidationFunction = async (values: FormikValues) => {
    if (!validationSchema) return {};

    const untouchedFieds = Object.keys(values).filter(
      (key) => values[key] === undefined
    );
    if (untouchedFieds.length === 0) hasUntouchedFields.toggleOff();

    try {
      await validationSchema.validate(values, { abortEarly: false });
    } catch (error: any) {
      const errors: Record<string, string> = {};
      error.inner.forEach((err: Yup.ValidationError) => {
        // Don't validate untouched fields.
        if (err.path && !untouchedFieds.includes(err.path)) {
          errors[err.path] = err.message;
        }
      });
      return errors;
    }

    return {};
  };

  const onSubmit = async (values: FormikValues) => {
    setSubmitErrorMessage(null);

    // Unfocus all inputs.
    (document.activeElement as HTMLElement)?.blur();

    try {
      const successfull = await onNext?.(values);
      if (!successfull) throw new Error('Something went wrong.');
    } catch (error: any) {
      if (typeof error === 'string') setSubmitErrorMessage(error);
      else if (error.message) setSubmitErrorMessage(error.message);
      else setSubmitErrorMessage('Something went wrong.');
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validate={formValidationFunction}
      onSubmit={onSubmit}
    >
      {({ errors, isSubmitting, isValid }) => (
        <OnboardDialogCard>
          <OnboardDialogBody>
            {icon && (
              <OnboardDialogIconContainer>{icon}</OnboardDialogIconContainer>
            )}
            <OnboardDialogBodyContainer>
              {body(errors)}
              {submitErrorMessage && <ErrorBox>{submitErrorMessage}</ErrorBox>}
            </OnboardDialogBodyContainer>
          </OnboardDialogBody>
          <OnboardDialogFooter>
            <Flex flex={1} alignItems="center">
              <OnboardDialogFooterBackButtonFlex>
                {onBack && (
                  <OnboardDialogBackButton type="button" onClick={onBack}>
                    <Icon
                      name="ArrowLeftLine"
                      size={20}
                      fill="text"
                      opacity={0.3}
                    />
                  </OnboardDialogBackButton>
                )}
              </OnboardDialogFooterBackButtonFlex>
              <Flex flex={5} gap="16px">
                <Flex flex={1} alignItems="center">
                  {footer}
                </Flex>
                {!hideNextButton && (
                  <SubmitButton
                    text={nextText}
                    icon={nextIcon}
                    submitting={isSubmitting}
                    disabled={!onNext || !isValid || hasUntouchedFields.isOn}
                  />
                )}
              </Flex>
            </Flex>
          </OnboardDialogFooter>
        </OnboardDialogCard>
      )}
    </Formik>
  );
};

export const OnboardDialogSkeleton = () => (
  <OnboardDialog
    initialValues={{}}
    validationSchema={Yup.object()}
    icon=""
    body={() => (
      <Flex flex={1} justifyContent="center" alignItems="center">
        <Spinner size={8} />
      </Flex>
    )}
  />
);
