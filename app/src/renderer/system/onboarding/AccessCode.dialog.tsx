import { FC, useState, useCallback } from 'react';
import {
  Grid,
  Text,
  Flex,
  Button,
  Box,
  Icons,
  BigInput,
} from 'renderer/components';
import { observer } from 'mobx-react';
import { BaseDialogProps } from 'renderer/system/dialog/dialogs';
import { OnboardingActions } from 'renderer/logic/actions/onboarding';
import _ from 'lodash';
import { AccessCode } from 'os/api/holium';
import { useServices } from 'renderer/logic/store';

const stubAccessCode = {
  title: 'Combine DAO',
  description: 'Investing in Urbit companies together since 2022.',
  image:
    'https://pbs.twimg.com/profile_images/1488203488655917060/9pP-2qTZ_400x400.jpg',
  id: 'combine-dao',
  type: 'DAO',
};

const AccessCodeDisplay = (props: { accessCode: AccessCode }) => {
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
          <img height={60} style={{ borderRadius: 6 }} src={accessCode.image} />
        ) : (
          <></>
        )}
        <Flex
          width={250}
          flexDirection="column"
          alignItems="flex-start"
          justifyContent="center"
        >
          <Text variant="h5">{accessCode.title}</Text>
          <Text mt={2} variant="body">
            {accessCode.description}
          </Text>
        </Flex>
      </Flex>
    </Flex>
  );
};

const AccessCode: FC<BaseDialogProps> = observer((props: BaseDialogProps) => {
  const { theme } = useServices();
  const [inputText, setInputText] = useState('');
  const [codeLoading, setCodeLoading] = useState(false);
  const [accessCode, setAccessCode] = useState<AccessCode | null>(null);
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
    setCodeLoading(true);
    if (code === stubAccessCode.id) {
      setAccessCode(stubAccessCode);
      setErrorMessage('');
    } else {
      setErrorMessage('Invalid access code.');
    }
    setCodeLoading(false);
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
    await OnboardingActions.setAccessCode(accessCode!);
    props.onNext && props.onNext();
  }

  function proceedWithout() {
    props.onNext && props.onNext();
  }

  return (
    <Grid.Column noGutter lg={12} xl={12} px={32}>
      <Grid.Row>
        <Flex
          width="100%"
          height="100%"
          alignItems="center"
          justifyContent="center"
        >
          <Icons
            name="Holium"
            size={30}
            color={theme.currentTheme.mode === 'light' ? 'black' : 'white'}
          />
          {accessCode ? (
            <Text ml={12} fontSize={3} fontWeight={400} color="text.success">
              Access code found!
            </Text>
          ) : (
            <Text ml={12} fontSize={3} fontWeight={400}>
              {' '}
              Have an Access Code?{' '}
            </Text>
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
                <Text variant="body" textAlign="center">
                  Realm access codes can be used to pre-join certain groups or
                  for pricing discounts. If you have one, please enter it now.
                </Text>
              </Box>
              <Flex
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
              >
                <BigInput
                  mt={16}
                  value={inputText}
                  placeholder="alchemy-dao"
                  onChange={inputChangeHandler}
                />
                <Box mt={12} height={18}>
                  <Text variant="body" color="text.error">
                    {errorMessage}
                  </Text>
                </Box>
                <Box mt={16}>
                  <Button
                    variant="minimal"
                    fontWeight={400}
                    onClick={proceedWithout}
                  >
                    {' '}
                    I don't have an access code{' '}
                  </Button>
                </Box>
              </Flex>
            </>
          )}
        </Flex>
      </Grid.Row>
    </Grid.Column>
  );
});

export default AccessCode;
