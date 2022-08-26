import { FC, useEffect } from 'react';
import { observer } from 'mobx-react';

import { useServices } from 'renderer/logic/store';
import { ShellActions } from 'renderer/logic/actions/shell';
import { Flex, IconButton, Icons } from 'renderer/components';
import { OnboardingStep } from 'os/services/onboarding/onboarding.model';

type OnboardingProps = {
  firstTime: boolean;
  exit: () => void;
};
export const Onboarding: FC<OnboardingProps> = observer(
  (props: OnboardingProps) => {
    let { onboarding } = useServices();

    useEffect(() => {
      ShellActions.openDialog(
        props.firstTime ? onboarding.currentStep : OnboardingStep.HAVE_URBIT_ID
      );

      return () => {
        ShellActions.closeDialog();
      };
    }),
      [];

    return (
      <Flex position="absolute" bottom={40} left={40}>
        {/* <IconButton
          onClick={() => {
            ShellActions.closeDialog();
            props.exit();
          }}
        >
          <Icons name="ArrowLeftLine" />
        </IconButton> */}
      </Flex>
    );
  }
);

export default Onboarding;
