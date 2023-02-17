import { useState, useCallback, KeyboardEvent } from 'react';
import { Grid, Button, Box } from 'renderer/components';
import { HoliumButton, TextInput, Text, Flex } from '@holium/design-system';
import { observer } from 'mobx-react';
import { BaseDialogProps } from 'renderer/system/dialog/dialogs';
import { OnboardingActions } from 'renderer/logic/actions/onboarding';
import _ from 'lodash';
import { AccessCode as AccessCodeType } from 'os/api/holium';

const stubAccessCode = {
  title: 'Combine DAO',
  description: 'Investing in Urbit companies together since 2022.',
  image:
    'https://pbs.twimg.com/profile_images/1488203488655917060/9pP-2qTZ_400x400.jpg',
  id: 'combine-dao',
  type: 'DAO',
};

const AccessCodeDisplay = (props: { accessCode: AccessCodeType }) => {
  const accessCode = props.accessCode;

  return (
    <Flex
      width={350}
      height="100%"
      flexDirection="column"
      alignItems="center"
      justifyContent="flex-start"
    >
      <Flex
        mt={18}
        width="100%"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-around"
      >
        {accessCode.image ? (
          <img
            alt="Accesscode"
            height={60}
            style={{ borderRadius: 6 }}
            src={accessCode.image}
          />
        ) : (
          <></>
        )}
        <Flex
          width={250}
          flexDirection="column"
          alignItems="flex-start"
          justifyContent="center"
        >
          <Text.H5>{accessCode.title}</Text.H5>
          <Text.Custom mt={2} fontSize={2}>
            {accessCode.description}
          </Text.Custom>
        </Flex>
      </Flex>
    </Flex>
  );
};

const AccessCodePresenter = (props: BaseDialogProps) => {
  const [inputText, setInputText] = useState('');
  const [accessCode, setAccessCode] = useState<AccessCodeType | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  async function getAccessCode(code: string) {
    if (code.length < 6) {
      if (code.length === 0) setErrorMessage('');
      return;
    }

    // setCodeLoading(true);
    // const result = await OnboardingActions.getAccessCode(code);
    // setCodeLoading(false);

    // setAccessCode(result.accessCode);
    // result.invalid
    //   ? setErrorMessage('Invalid access code.')
    //   : setErrorMessage('');

    // TODO: Remove when fixed
    if (code === stubAccessCode.id) {
      setAccessCode(stubAccessCode);
      setErrorMessage('');
    } else {
      setErrorMessage('Invalid access code.');
    }
  }
  const debouncedGetAccessCode = useCallback(
    _.debounce(getAccessCode, 500, { leading: true }),
    []
  );

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
    try {
      await OnboardingActions.setAccessCode(accessCode!);
      props.onNext && props.onNext();
    } catch {
      setErrorMessage('Error redeeming access code.');
    }
  }

  function proceedWithout() {
    props.onNext && props.onNext();
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (inputText) redeemCode();
    }
  };

  return (
    <Grid.Column noGutter lg={12} xl={12} px={32}>
      <Grid.Row>
        <Flex
          width="100%"
          height="100%"
          alignItems="center"
          justifyContent="center"
        >
          <HoliumButton />
          {accessCode ? (
            <Text.Custom
              ml={12}
              fontSize={3}
              fontWeight={400}
              color="intent-success"
            >
              Group code found!
            </Text.Custom>
          ) : (
            <Text.Custom ml={12} fontSize={3} fontWeight={400}>
              {' '}
              Have a Group Code?{' '}
            </Text.Custom>
          )}
        </Flex>
      </Grid.Row>
      <Grid.Row>
        <Flex
          width="100%"
          height="100%"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
        >
          {accessCode ? (
            <>
              <AccessCodeDisplay accessCode={accessCode} />
              <Flex width="100%" flexDirection="row" justifyContent="end">
                <Button variant="minimal" fontWeight={400} onClick={cancelCode}>
                  Cancel
                </Button>
                <Box ml={4}>
                  <Button variant="primary" onClick={redeemCode}>
                    Redeem Code
                  </Button>
                </Box>
              </Flex>
            </>
          ) : (
            <>
              <Box mb={36}>
                <Text.Custom fontSize={2} lineHeight="1.4" textAlign="center">
                  Realm group codes can be used to pre-join certain groups or
                  for pricing discounts. If you have one, please enter it now.
                </Text.Custom>
              </Box>
              <Flex
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
              >
                <TextInput
                  name="access-code"
                  id="access-code"
                  fontSize="20px"
                  mt={16}
                  height={50}
                  placeholder="alchemy-dao"
                  textAlign="center"
                  value={inputText}
                  onChange={(evt: any) => inputChangeHandler(evt.target.value)}
                  onKeyDown={onKeyDown}
                />

                <Box mt={12} height={18}>
                  <Text.Custom color="intent-alert">{errorMessage}</Text.Custom>
                </Box>
                <Box mt={16}>
                  <Button
                    variant="minimal"
                    fontWeight={400}
                    onClick={proceedWithout}
                  >
                    {' '}
                    I don't have a group code{' '}
                  </Button>
                </Box>
              </Flex>
            </>
          )}
        </Flex>
      </Grid.Row>
    </Grid.Column>
  );
};

export const AccessCode = observer(AccessCodePresenter);
