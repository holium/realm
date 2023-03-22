import { Grid, Text, Flex, Anchor } from 'renderer/components';
import { CheckBox } from '@holium/design-system';
import { theme } from 'renderer/theme';
import { observer } from 'mobx-react';
import { BaseDialogProps } from 'renderer/system/dialog/dialogs';

const DisclaimerDialogPresenter = (props: BaseDialogProps) => {
  const toggleChecked = () => {
    props.setState?.({
      ...props.workflowState,
      disclaimerAccepted: props.workflowState.disclaimerAccepted ? false : true,
    });
  };

  return (
    <Grid.Column noGutter lg={12} xl={12} px={16} pt={12}>
      <Text fontSize={3} fontWeight={500} mb={20}>
        Disclaimer
      </Text>
      <Text fontSize={2} lineHeight="copy" variant="body" mb={20}>
        User acknowledges and agrees that this software and system are
        experimental, that all use thereof is on an “as is” basis, and that
        Holium Corporation makes no warranties and EXPRESSLY DISCLAIMS the
        warranties of merchantability, fitness for a particular purpose, and
        non-infringement. User accordingly agrees to be an Alpha user under
        these conditions.
        <br />
        <br />
        Possible addition, or separate instruction to users: Alpha users are
        encouraged to report any perceived bugs or problems in the software and
        system to Holium Corporation by email at &nbsp;
        <Anchor
          color={theme.light.colors.brand.primary}
          m={0}
          p={0}
          href="mailto:bugs@holium.io"
        >
          bugs@holium.io
        </Anchor>
      </Text>
      <br />
      <Flex flexDirection="row" justifyContent="flex-start">
        <CheckBox
          label="I agree"
          isChecked={Boolean(props.workflowState.disclaimerAccepted)}
          onClick={toggleChecked}
        />
      </Flex>
    </Grid.Column>
  );
};

export const DisclaimerDialog = observer(DisclaimerDialogPresenter);
