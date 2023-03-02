import { KeyboardEventHandler, useState } from 'react';
import { Label } from 'renderer/components';
import { TextInput, Text, Button, Flex, Spinner } from '@holium/design-system';
import { observer } from 'mobx-react';
import { BaseDialogProps } from 'renderer/system/dialog/dialogs';
import { OnboardingActions } from 'renderer/logic/actions/onboarding';

const AccessGatePresenter = (props: BaseDialogProps) => {
  const [accessCode, setAccessCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onChange = (event: any) => {
    const value = event.target.value.trim();
    setAccessCode(value);
    setError('');
  };

  const checkCode = async () => {
    setLoading(true);
    const response = await OnboardingActions.checkGatedAccess(accessCode);
    setLoading(false);

    if (!response.success) {
      return setError(response.message);
    }

    setError('');
    props.onNext && props.onNext(false);
  };

  const goToEmail = () => {
    setError('');
    props.setState &&
      props.setState({ ...props.workflowState, isRecoveringAccount: true });
    props.onNext && props.onNext(true);
  };

  const onKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter') checkCode();
  };

  return (
    <Flex width="100%" height="100%" flexDirection="column">
      <Text.Custom fontSize={3} fontWeight={500} mb={20}>
        Invite Code
      </Text.Custom>
      <Text.Custom fontSize={2} lineHeight="1.4">
        Access to Realm is currently invite only. If you don't already have a
        code, signup for our waitlist at holium.com
      </Text.Custom>
      <Flex mt={8} flexDirection="column">
        <Label mb={1} required={true}>
          Invite Code
        </Label>
        <TextInput
          id="invite-code-input"
          name="invite-code-input"
          height={36}
          value={accessCode}
          onChange={onChange}
          type="text"
          required={true}
          spellCheck={false}
          onKeyDown={onKeyDown}
        />

        <Flex mt={8} width="100%">
          <Button.Primary
            width="100%"
            py={2}
            justifyContent="center"
            disabled={accessCode.length !== 21}
            onClick={checkCode}
          >
            {loading ? <Spinner size={0} color="#FFF" /> : 'Submit'}
          </Button.Primary>
          {/* <Button
            width="100%"
            disabled={accessCode.length !== 21}
            isLoading={loading}
            onClick={checkCode}
          >
            Submit
          </Button> */}
        </Flex>
        <Text.Custom
          hidden={!error}
          mt={4}
          fontSize={1}
          color="intent-alert"
          textAlign="center"
        >
          {error}
        </Text.Custom>
      </Flex>
      <Flex width="100%" justifyContent="center">
        <Text.Custom
          mt={20}
          fontSize={2}
          fontWeight={400}
          opacity={0.5}
          onClick={goToEmail}
        >
          Already signed up?
        </Text.Custom>
      </Flex>
    </Flex>
  );
};

export const AccessGate = observer(AccessGatePresenter);
