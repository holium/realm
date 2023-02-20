import { KeyboardEventHandler, useEffect, useState } from 'react';
import { isValidPatp } from 'urbit-ob';
import { useForm, useField } from 'mobx-easy-form';
import * as yup from 'yup';
import {
  Grid,
  Label,
  FormControl,
  Box,
  Spinner,
  Flex,
  UrbitSVG,
} from 'renderer/components';
import { observer } from 'mobx-react';
import { OnboardingActions } from 'renderer/logic/actions/onboarding';
import { BaseDialogProps } from 'renderer/system/dialog/dialogs';
import { useServices } from 'renderer/logic/store';
import { useToggle } from 'renderer/logic/lib/useToggle';
import { Button, Icon, TextInput } from '@holium/design-system';

const AddShipPresenter = (props: BaseDialogProps) => {
  const { theme } = useServices();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { identity } = useServices();
  const showAccessKey = useToggle(false);

  useEffect(() => {
    // Reset onboarding conduit when this page loads
    OnboardingActions.closeConduit();
  }, []);

  const shipForm = useForm({
    async onSubmit({ values }: any) {
      setError('');
      setLoading(true);
      try {
        // Parse the url, fail otherwise
        values.url = new URL(values.url).origin;
        const result = await OnboardingActions.addShip(values);
        setLoading(false);
        if (!result.success) {
          setError(result.errorMessage || 'Connection failed.');
          return;
        }

        props.setState &&
          props.setState({ ...props.workflowState, ship: values });
        props.onNext && props.onNext(values);
      } catch (reason: any) {
        setLoading(false);
        console.error(`Cannot add ship: ${reason.toString()}`);
        setError(`Something went wrong while trying to connect.`);
      }
    },
  });

  const urbitId = useField({
    id: 'patp',
    form: shipForm,
    initialValue: '',
    validate: (patp: string) => {
      if (identity.auth.addedShips.includes(patp)) {
        return { error: 'Already added', parsed: undefined };
      }

      if (patp.length > 1 && isValidPatp(patp)) {
        return { error: undefined, parsed: patp };
      }

      return { error: 'Invalid patp', parsed: undefined };
    },
  });

  const shipUrl = useField({
    id: 'url',
    form: shipForm,
    initialValue: '',
    validationSchema: yup
      .string()
      .matches(
        /(?:^|\s)((https?:\/\/)?(?:localhost|[\w-]+(?:\.[\w-]+)+)(:\d+)?(\/\S*)?)/,
        'Enter correct url'
      )
      .required('Please enter url'),
  });
  const accessKey = useField({
    id: 'code',
    form: shipForm,
    initialValue: '',
    validationSchema: yup
      .string()
      .matches(
        /[a-z][a-z-]{5}-[a-z][a-z-]{5}-[a-z][a-z-]{5}-[a-z][a-z-]{5}$/,
        'Access key not in correct format'
      )
      .required('Please enter access key'),
  });

  const onKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter') {
      if (shipForm.computed.isValid && !loading) shipForm.actions.submit();
    }
  };

  return (
    <Grid.Column xl={12} noGutter>
      <Grid.Column lg={7} xl={7} px={50}>
        <Grid.Column gap={12}>
          <Flex width="100%" justifyContent="center">
            <UrbitSVG
              mode={theme.currentTheme.mode as 'light' | 'dark'}
              size={56}
            />
          </Flex>
          <Flex mt={2} flexDirection="column">
            <FormControl.FieldSet>
              <FormControl.Field>
                <Label>Urbit ID</Label>
                <TextInput
                  mt={1}
                  height={36}
                  id="onboarding-patp"
                  tabIndex={1}
                  name="patp"
                  placeholder="~sampel-palnet"
                  defaultValue={urbitId.state.value}
                  autoCapitalize="false"
                  autoCorrect="false"
                  spellCheck="false"
                  error={
                    urbitId.computed.ifWasEverBlurredThenError &&
                    urbitId.computed.isDirty &&
                    urbitId.computed.error
                  }
                  onChange={(e: any) => {
                    setError('');
                    urbitId.actions.onChange(e.target.value);
                  }}
                  onFocus={() => urbitId.actions.onFocus()}
                  onBlur={() => urbitId.actions.onBlur()}
                  onKeyDown={onKeyDown}
                />
              </FormControl.Field>
              <FormControl.Field>
                <Label>URL</Label>
                <TextInput
                  mt={1}
                  height={36}
                  id="onboarding-ship-url"
                  tabIndex={2}
                  name="url"
                  placeholder="https://my-ship.host.com"
                  defaultValue={shipUrl.state.value}
                  autoCapitalize="false"
                  autoCorrect="false"
                  spellCheck="false"
                  error={
                    shipUrl.computed.ifWasEverBlurredThenError &&
                    shipUrl.computed.isDirty &&
                    shipUrl.computed.error
                  }
                  onChange={(e: any) => {
                    setError('');
                    shipUrl.actions.onChange(e.target.value);
                  }}
                  onFocus={() => shipUrl.actions.onFocus()}
                  onBlur={() => shipUrl.actions.onBlur()}
                  onKeyDown={onKeyDown}
                />
              </FormControl.Field>
              <FormControl.Field>
                <Label>Access key</Label>
                <TextInput
                  mt={1}
                  height={36}
                  id="onboarding-access-key"
                  tabIndex={3}
                  name="code"
                  placeholder="sample-micsev-bacmug-moldex"
                  defaultValue={accessKey.state.value}
                  autoCapitalize="false"
                  autoCorrect="false"
                  spellCheck="false"
                  type={showAccessKey.isOn ? 'text' : 'password'}
                  error={
                    accessKey.computed.ifWasEverBlurredThenError &&
                    accessKey.computed.isDirty &&
                    accessKey.computed.error
                  }
                  onChange={(e: any) => {
                    setError('');
                    accessKey.actions.onChange(e.target.value);
                  }}
                  onFocus={() => accessKey.actions.onFocus()}
                  onBlur={() => accessKey.actions.onBlur()}
                  onKeyDown={onKeyDown}
                  rightAdornment={
                    <Button.IconButton onClick={showAccessKey.toggle}>
                      <Icon
                        name={showAccessKey.isOn ? 'EyeOff' : 'EyeOn'}
                        opacity={0.5}
                        size={18}
                      />
                    </Button.IconButton>
                  }
                />
              </FormControl.Field>
            </FormControl.FieldSet>
          </Flex>
          <Flex width="100%" justifyContent="center" mt={2}>
            <FormControl.Error>{error}</FormControl.Error>
          </Flex>
        </Grid.Column>
      </Grid.Column>
      <Box position="absolute" right={24} bottom={24}>
        <Button.TextButton
          py={1}
          showOnHover
          fontWeight={500}
          disabled={!shipForm.computed.isValid || loading}
          onClick={shipForm.actions.submit}
          style={{ minWidth: 45 }}
        >
          {loading ? <Spinner size={0} /> : 'Next'}
        </Button.TextButton>
      </Box>
    </Grid.Column>
  );
};

export const AddShip = observer(AddShipPresenter);
