import { FormEvent, ReactNode, useState } from 'react';

import { ErrorBox, Flex, Icon, Spinner } from '@holium/design-system/general';
import { useToggle } from '@holium/design-system/util';

import { SubmitButton } from './hosting/SubmitButton';
import {
  OnboardDialogBackButton,
  OnboardDialogBody,
  OnboardDialogBodyContainer,
  OnboardDialogCard,
  OnboardDialogFooter,
  OnboardDialogFooterBackButtonFlex,
  OnboardDialogIconContainer,
} from './OnboardDialog.styles';

type Props = {
  body: ReactNode;
  icon?: ReactNode;
  nextText?: string;
  nextIcon?: ReactNode;
  hideNextButton?: boolean;
  footer?: ReactNode;
  onBack?: () => void;
  onNext?: () => Promise<boolean>;
};

export const OnboardDialog = ({
  body,
  icon,
  nextText = 'Next',
  nextIcon,
  hideNextButton,
  footer,
  onBack,
  onNext,
}: Props) => {
  const submitting = useToggle(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitting.toggleOn();
    setErrorMessage(null);

    // Unfocus all inputs.
    (document.activeElement as HTMLElement)?.blur();

    try {
      const successfull = await onNext?.();
      if (!successfull) throw new Error('Something went wrong.');
    } catch (error: any) {
      if (typeof error === 'string') setErrorMessage(error);
      else if (error.message) setErrorMessage(error.message);
      else setErrorMessage('Something went wrong.');

      submitting.toggleOff();
    }
  };

  return (
    <OnboardDialogCard onSubmit={onNext ? handleSubmit : undefined}>
      <OnboardDialogBody>
        {icon && (
          <OnboardDialogIconContainer>{icon}</OnboardDialogIconContainer>
        )}
        <OnboardDialogBodyContainer>
          {body}
          {errorMessage && <ErrorBox>{errorMessage}</ErrorBox>}
        </OnboardDialogBodyContainer>
      </OnboardDialogBody>
      <OnboardDialogFooter>
        <Flex flex={1} gap="16px" alignItems="center">
          <OnboardDialogFooterBackButtonFlex>
            {onBack && (
              <OnboardDialogBackButton onClick={onBack} type="button">
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
                submitting={submitting.isOn}
                disabled={!onNext}
              />
            )}
          </Flex>
        </Flex>
      </OnboardDialogFooter>
    </OnboardDialogCard>
  );
};

export const OnboardDialogSkeleton = () => (
  <OnboardDialog
    icon=""
    body={
      <Flex flex={1} justifyContent="center" alignItems="center">
        <Spinner size={8} />
      </Flex>
    }
  />
);
