import { FC, useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { createField, createForm } from 'mobx-easy-form';
import UrbitSVG from '../../../../assets/urbit.svg';
import { Grid, Text, Flex, ActionButton } from 'renderer/components';
import { observer } from 'mobx-react';
import { BaseDialogProps } from 'renderer/system/dialog/dialogs';

// some stuff goes here
const HaveUrbitDialog: FC<BaseDialogProps> = observer(
  (props: BaseDialogProps) => {
    function selectSelfHosted() {
      props.setState && props.setState({ ...props.workflowState, selfHosted: true });
      props.onNext && props.onNext(true)
    }

    function selectHosted() {
      props.setState && props.setState({ ...props.workflowState, selfHosted: false });
      props.onNext && props.onNext(false)
    }

    return (
      <Grid.Column noGutter lg={12} xl={12}>
        <Flex flexDirection="row" alignItems="baseline" justifyContent="center">
          <img style={{ height: '40px' }} src={UrbitSVG} alt="urbit logo" />
          <Text
            fontSize={3}
            fontWeight={600}
            mb={20}
          >
            Have an Urbit ID?
          </Text>
        </Flex>
        <Text
          fontSize={2}
          fontWeight={300}
          variant="body">
            An Urbit ID is like a phone number. It’s how your friends connect with you on Urbit.
            <br/><br/>
            If you have one hosted already, you can connect it or get a new ID with hosting provided.
        </Text>
        <br/>
        <Flex flexDirection="row" alignItems="baseline">
          <ActionButton
            tabIndex={-1}
            height={36}
            data-close-tray="true"
            onClick={selectSelfHosted}
          >
            Connect
          </ActionButton>
          <span style={{ paddingLeft: "20px", paddingRight: "20px" }}>or</span>
          <ActionButton
            tabIndex={-1}
            height={36}
            data-close-tray="true"
            onClick={selectHosted}
          >
            Get One
          </ActionButton>
        </Flex>
      </Grid.Column>
    )
  }
)

export default HaveUrbitDialog
