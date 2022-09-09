import { FC, useEffect, useState } from 'react';
import { isValidPatp } from 'urbit-ob';
import { useForm, useField } from 'mobx-easy-form';
import * as yup from 'yup';
import {
  Grid,
  Input,
  Label,
  FormControl,
  Box,
  Spinner,
  Flex,
  TextButton,
} from 'renderer/components';
// @ts-expect-error its there...
import UrbitSVG from '../../../../assets/urbit.svg';
import { observer } from 'mobx-react';
import { OnboardingActions } from 'renderer/logic/actions/onboarding';
import { BaseDialogProps } from 'renderer/system/dialog/dialogs';
import { useServices } from 'renderer/logic/store';

// /((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,

export const AddShip: FC<BaseDialogProps> = observer(
  (props: BaseDialogProps) => {
    const [loading, setLoading] = useState(false);
    const { identity } = useServices();

    useEffect(() => {
      // Reset onboarding conduit when this page loads
      OnboardingActions.closeConduit();
    }, []);

    const shipForm = useForm({
      async onSubmit({ values }: any) {
        setLoading(true);
        try {
          // Parse the url, fail otherwise
          values['url'] = new URL(values['url']).origin;
          await OnboardingActions.addShip(values);

          props.setState &&
            props.setState({ ...props.workflowState, ship: values });
          props.onNext && props.onNext(values);
          setLoading(false);
        } catch (reason: any) {
          setLoading(false);
          throw new Error(`Cannot add ship: ${reason.toString()}`);
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

    return (
      <Grid.Column xl={12} noGutter>
        <Grid.Column lg={7} xl={7} px={50}>
          <Grid.Column gap={12}>
            <img height={56} src={UrbitSVG} alt="urbit logo" />
            <Flex mt={2} flexDirection="column">
              <FormControl.FieldSet>
                <FormControl.Field>
                  <Label>Urbit ID</Label>
                  <Input
                    tabIndex={1}
                    name="patp"
                    placeholder="~sampel-palnet"
                    borderColor="input.borderColor"
                    defaultValue={urbitId.state.value}
                    autoCapitalize="false"
                    autoCorrect="false"
                    spellCheck="false"
                    error={
                      urbitId.computed.ifWasEverBlurredThenError &&
                      urbitId.computed.isDirty
                    }
                    onChange={(e: any) =>
                      urbitId.actions.onChange(e.target.value)
                    }
                    onFocus={() => urbitId.actions.onFocus()}
                    onBlur={() => urbitId.actions.onBlur()}
                  />
                  {urbitId.computed.ifWasEverBlurredThenError &&
                    urbitId.computed.isDirty && (
                      <FormControl.Error>
                        {urbitId.computed.error}
                      </FormControl.Error>
                    )}
                </FormControl.Field>
                <FormControl.Field>
                  <Label>URL</Label>
                  <Input
                    tabIndex={2}
                    name="url"
                    placeholder="https://my-ship.host.com"
                    defaultValue={shipUrl.state.value}
                    autoCapitalize="false"
                    autoCorrect="false"
                    spellCheck="false"
                    error={
                      shipUrl.computed.ifWasEverBlurredThenError &&
                      shipUrl.computed.isDirty
                    }
                    onChange={(e: any) =>
                      shipUrl.actions.onChange(e.target.value)
                    }
                    onFocus={() => shipUrl.actions.onFocus()}
                    onBlur={() => shipUrl.actions.onBlur()}
                  />
                  {shipUrl.computed.ifWasEverBlurredThenError &&
                    shipUrl.computed.isDirty && (
                      <FormControl.Error>
                        {shipUrl.computed.error}
                      </FormControl.Error>
                    )}
                </FormControl.Field>
                <FormControl.Field>
                  <Label>Access key</Label>
                  <Input
                    tabIndex={3}
                    name="code"
                    placeholder="sample-micsev-bacmug-moldex"
                    defaultValue={accessKey.state.value}
                    autoCapitalize="false"
                    autoCorrect="false"
                    spellCheck="false"
                    error={
                      accessKey.computed.ifWasEverBlurredThenError &&
                      accessKey.computed.isDirty
                    }
                    onChange={(e: any) =>
                      accessKey.actions.onChange(e.target.value)
                    }
                    onFocus={() => accessKey.actions.onFocus()}
                    onBlur={() => accessKey.actions.onBlur()}
                  />
                  {accessKey.computed.ifWasEverBlurredThenError &&
                    accessKey.computed.isDirty && (
                      <FormControl.Error>
                        {accessKey.computed.error}
                      </FormControl.Error>
                    )}
                </FormControl.Field>
              </FormControl.FieldSet>
            </Flex>
          </Grid.Column>
        </Grid.Column>
        <Box position="absolute" left={385} bottom={20}>
          <TextButton
            disabled={!shipForm.computed.isValid || loading}
            onClick={shipForm.actions.submit}
            style={{ minWidth: 45 }}
          >
            {loading ? <Spinner size={0} /> : 'Next'}
          </TextButton>
        </Box>
      </Grid.Column>
    );
  }
);

export default AddShip;
