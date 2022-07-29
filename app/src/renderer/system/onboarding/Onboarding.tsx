import { FC, useEffect } from 'react';
import { Fill, Layer } from 'react-spaces';
import { observer } from 'mobx-react';

import { useServices } from 'renderer/logic/store';
import { DialogManager } from '../dialog/DialogManager';
import { ShellActions } from 'renderer/logic/actions/shell';
import { OnboardingStep } from 'os/services/onboarding/onboarding.model';

export const Onboarding: FC = observer((props: any) => {
  let { onboarding } = useServices();

  useEffect(() => {
    ShellActions.openDialog(OnboardingStep.DISCLAIMER);

    return () => {
      ShellActions.closeDialog();
    }
  }), [];

  return (
    <Fill>
      <Layer zIndex={2}>
        {/* <DialogManager dialogId={onboarding.currentStep}/> */}
      </Layer>
    </Fill>
  )
})

export default Onboarding;
