import { FC, useEffect } from 'react';
import { observer } from 'mobx-react';

import { useServices } from 'renderer/logic/store';
import { ShellActions } from 'renderer/logic/actions/shell';

export const Onboarding: FC = observer((props: any) => {
  let { onboarding } = useServices();

  useEffect(() => {
    ShellActions.openDialog(onboarding.currentStep);

    return () => {
      ShellActions.closeDialog();
    };
  }),
    [];

  return <></>;
});

export default Onboarding;
