import { Flex } from '@holium/design-system/general';

import {
  OnboardDialogDescription,
  OnboardDialogInputLabel,
  OnboardDialogTitle,
} from '../../components/OnboardDialog.styles';

export type BootingNodeDialogFields = {
  booted: boolean;
};

export const BootingNodeDialogBody = () => {
  // const { errors } = useFormikContext<BootingNodeDialogFields>();

  return (
    <>
      <OnboardDialogTitle pb={3}>Booting your node</OnboardDialogTitle>
      <OnboardDialogDescription>
        This should take around a minute
      </OnboardDialogDescription>
      <Flex flexDirection="column" gap={2}>
        <OnboardDialogInputLabel as="label" htmlFor="eth-address">
          Urbit ID
        </OnboardDialogInputLabel>
      </Flex>
    </>
  );
};
