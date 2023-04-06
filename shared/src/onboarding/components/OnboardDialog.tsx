import { FormEvent, ReactNode } from 'react';
import { Flex, Icon, useToggle } from '@holium/design-system';
import {
  OnboardDialogBackButton,
  OnboardDialogBody,
  OnboardDialogBodyContainer,
  OnboardDialogCard,
  OnboardDialogFooter,
  OnboardDialogIconContainer,
} from './OnboardDialog.styles';
import { SubmitButton } from './hosting/SubmitButton';

type Props = {
  icon: ReactNode;
  body: ReactNode;
  nextText?: string;
  nextIcon?: ReactNode;
  onBack?: () => void;
  onNext?: () => Promise<boolean>;
};

export const OnboardDialog = ({
  icon,
  body,
  nextText = 'Next',
  nextIcon,
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
        <OnboardDialogIconContainer>{icon}</OnboardDialogIconContainer>
        <OnboardDialogBodyContainer>{body}</OnboardDialogBodyContainer>
      </OnboardDialogBody>
      <OnboardDialogFooter>
        <Flex flex={1} justifyContent="space-between">
          <Flex alignItems="center">
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
          </Flex>
          <Flex alignItems="center" justifyContent="space-between">
            <SubmitButton
              text={nextText}
              icon={nextIcon}
              submitting={submitting.isOn}
              disabled={!onNext}
            />
          </Flex>
        </Flex>
      </OnboardDialogFooter>
    </OnboardDialogCard>
  );
};
