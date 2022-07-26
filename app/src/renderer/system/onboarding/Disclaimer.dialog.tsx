import { FC, useState } from 'react';
import { Grid, Text, Flex } from 'renderer/components';
import { observer } from 'mobx-react';
import { BaseDialogProps } from 'renderer/system/dialog/dialogs';

const DisclaimerDialog: FC<BaseDialogProps> = observer(
  (props: BaseDialogProps) => {
    let [checked, setChecked] = useState(props.workflowState?.disclaimerAccepted || false)

  function toggleChecked (): void {
    let toggledValue = !checked
    props.setState && props.setState({ ...props.workflowState, disclaimerAccepted: toggledValue })
    setChecked(toggledValue)
  }

    return (
      <Grid.Column noGutter lg={12} xl={12} px={16} pt={12}>
        <Text
          fontSize={3}
          fontWeight={500}
          mb={20}
        >
          Disclaimer
        </Text>
        <Text
          fontSize={2}
          lineHeight="copy"
          variant="body"
          mb={20}>
          User acknowledges and agrees that this software and system are experimental, that all use thereof is on an “as is” basis, and that Holium Corporation makes no warranties and EXPRESSLY DISCLAIMS the warranties of merchantability, fitness for a particular purpose, and non-infringement.  User accordingly agrees to be an Alpha user under these conditions.
          <br/><br/>
          Possible addition, or separate instruction to users:  Alpha users are encouraged to report any perceived bugs or problems in the software and system to Holium Corporation by email at
          <Text color="brand.primary">
            <a style={{ color: 'inherit', margin: '0' }} href="mailto:bugs@holium.io">bugs@holium.io</a>
          </Text>
        </Text>
        <br/>
        <Flex flexDirection="row" justifyContent="flex-start">
          <input type="checkbox" id="disclaimer" onClick={toggleChecked}/>
          <Text ml={16} fontSize={2}>I agree</Text>
        </Flex>
      </Grid.Column>
    )
  }
)

export default DisclaimerDialog
