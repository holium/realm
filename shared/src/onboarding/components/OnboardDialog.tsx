import { FormEvent, ReactNode } from 'react';
import { Flex, Icon, Spinner } from '@holium/design-system/general';
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
import { SubmitButton } from './hosting/SubmitButton';

type Props = {
  body: ReactNode;
  icon?: ReactNode;
  nextText?: string;
  nextIcon?: ReactNode;
  hideNextButton?: boolean;
  footerText?: ReactNode;
  onBack?: () => void;
  onNext?: () => Promise<boolean>;
};

export const OnboardDialog = ({
  body,
  icon,
  nextText = 'Next',
  nextIcon,
  hideNextButton,
  footerText,
  onBack,
  onNext,
}: Props) => {
  const submitting = useToggle(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitting.toggleOn();

    try {
      const successfull = await onNext?.();
      if (!successfull) submitting.toggleOff();
    } catch (error) {
      submitting.toggleOff();
    }
  };

  return (
    <OnboardDialogCard onSubmit={onNext ? handleSubmit : undefined}>
      <OnboardDialogBody>
        {icon && (
          <OnboardDialogIconContainer>{icon}</OnboardDialogIconContainer>
        )}
        <OnboardDialogBodyContainer>{body}</OnboardDialogBodyContainer>
      </OnboardDialogBody>
      <OnboardDialogFooter>
        <Flex flex={1}>
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
          <Flex flex={5} gap="8px">
            <Flex flex={1} alignItems="center">
              {footerText}
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
