import { FC, useState, useRef, useCallback } from 'react';
import styled, { css } from 'styled-components';
import { fontSize, fontWeight, margin, MarginProps, FontSizeProps, FontWeightProps } from 'styled-system';
// @ts-expect-error its there...
import UrbitSVG from '../../../../assets/urbit.svg';
import { Grid, Text, Flex, Button, Box, Input, Icons } from 'renderer/components';
import { observer } from 'mobx-react';
import { BaseDialogProps } from 'renderer/system/dialog/dialogs';
import { OnboardingActions } from 'renderer/logic/actions/onboarding';
import _ from 'lodash'
import { AccessCode } from 'os/api/holium';

const AccessCodeInput = (props: any) => {
  return (
    <Flex mt={16} flexDirection="row" alignItems="space-between" justifyContent="center">
      <Box width={300} height={50}>
        <Input noCursor autoFocus
          spellCheck={false}
          textAlign="center"
          fontSize={24}
          fontWeight={500}
          placeholder="alchemists-dao"
          value={props.value} onChange={(e) => props.onChange(e.target.value)} />
      </Box>
    </Flex>
  )
}

const AccessCodeDisplay = (props: { accessCode: AccessCode }) => {
  let accessCode = props.accessCode

  return (
    <Flex width={350} height="100%" flexDirection="column" alignItems="center" justifyContent="flex-start">
      <Flex mt={18} width="100%" flexDirection="row" alignItems="center" justifyContent="space-around">
        {accessCode.image
          ? <img height={60} style={{ borderRadius: 6 }} src={accessCode.image} />
          : <></>
        }
        <Flex width={250} flexDirection="column" alignItems="flex-start" justifyContent="center">
          <Text variant="h5">{accessCode.title}</Text>
          <Text mt={2} variant="body">{accessCode.description}</Text>
        </Flex>
      </Flex>
    </Flex>
  )
}

const AccessCode: FC<BaseDialogProps> = observer(
  (props: BaseDialogProps) => {
    let [ inputText, setInputText ] = useState('');
    let [ codeLoading, setCodeLoading ] = useState(false);
    let [ accessCode, setAccessCode ] = useState<AccessCode | null>(null);
    let [ errorMessage, setErrorMessage ] = useState('');

    async function getAccessCode(code: string) {
      if (code.length < 6) {
        if (code.length === 0) setErrorMessage('')
        return
      }

      setCodeLoading(true);
      let result = await OnboardingActions.getAccessCode(code);
      setCodeLoading(false);

      setAccessCode(result.accessCode);
      result.invalid
        ? setErrorMessage('Invalid access code.')
        : setErrorMessage('')
    }
    const debouncedGetAccessCode = useCallback(_.debounce(getAccessCode, 500, { leading: true }), [])

    function inputChangeHandler(value: string) {
      setInputText(value);
      debouncedGetAccessCode(value);
    }

    function cancelCode() {
      setAccessCode(null);
      setErrorMessage('');
      setInputText('');
    }

    async function redeemCode() {
      await OnboardingActions.setAccessCode(accessCode!);
      props.onNext && props.onNext();
    }

    function proceedWithout() {
      props.onNext && props.onNext();
    }

    return (
      <Grid.Column noGutter lg={12} xl={12} px={32}>
        <Grid.Row>
           <Flex width="100%" height="100%" alignItems="center" justifyContent="center">
            <Icons name="Holium" size={30} color="black" />
            { accessCode
              ? <Text ml={12} fontSize={3} fontWeight={400} color="text.success">Access code found!</Text>
              : <Text ml={12} fontSize={3} fontWeight={400}> Have an Access Code? </Text>
            }
           </Flex>
        </Grid.Row>
        <Grid.Row>
          <Flex width="100%" height="100%" flexDirection="column" alignItems="center" justifyContent="center">
            {accessCode
              ? (
                <>
                  <AccessCodeDisplay accessCode={accessCode} />
                  <Flex width="100%" flexDirection="row" justifyContent="end">
                    <Button variant="minimal" fontWeight={400} onClick={cancelCode}>Cancel</Button>
                    <Box ml={4}>
                      <Button variant="primary" onClick={redeemCode}>Redeem Code</Button>
                    </Box>
                  </Flex>
                </>
              )
              : (
                <>
                  <Box mb={36}>
                    <Text variant="body" textAlign="center">Realm access codes can be used to pre-join certain groups or for pricing discounts. If you have one, please enter it now.</Text>
                  </Box>
                  <Flex flexDirection="column" alignItems="center" justifyContent="center">
                    <AccessCodeInput value={inputText} onChange={inputChangeHandler} />
                    <Box mt={12} height={18}>
                      <Text variant="body" color="text.error">{errorMessage}</Text>
                    </Box>
                    <Box mt={16}>
                      <Button variant="minimal" fontWeight={400} onClick={proceedWithout}> I don't have an access code </Button>
                    </Box>
                  </Flex>
                </>
              )
            }
          </Flex>
        </Grid.Row>
      </Grid.Column>
    )
  }
)

export default AccessCode
