import { FC } from 'react';
import { Fill, Layer } from 'react-spaces';
import { observer } from 'mobx-react';

import { useServices } from 'renderer/logic/store';
import { DialogManager } from '../dialog/DialogManager';

export const Onboarding: FC = observer((props: any) => {
  let { onboarding } = useServices();

  return (
    <Fill>
      <Layer zIndex={2}>
        <DialogManager dialogId={onboarding.currentStep}/>
      </Layer>
    </Fill>
  )
})

export default Onboarding;
