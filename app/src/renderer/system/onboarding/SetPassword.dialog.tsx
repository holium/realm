import { FC } from 'react';
import { useForm, useField } from 'mobx-easy-form';
import * as yup from 'yup';
import {
  Grid,
  Sigil,
  Text,
  Label,
  FormControl,
  Box,
  Flex,
  TextButton,
} from 'renderer/components';
import { observer } from 'mobx-react';
import { useServices } from 'renderer/logic/store';
import { BaseDialogProps } from 'renderer/system/dialog/dialogs';
import { OnboardingActions } from 'renderer/logic/actions/onboarding';
import { TextInput } from '@holium/design-system';

export const SetPassword: FC<BaseDialogProps> = observer(
  (props: BaseDialogProps) => {
    const { onboarding } = useServices();

    const shipName = onboarding.ship!.patp;
    const shipNick = onboarding.ship!.nickname;
    const shipColor = onboarding.ship!.color!;
    const avatar = onboarding.ship!.avatar;

    const passwordForm = useForm({
      async onSubmit({ values }) {
        await OnboardingActions.setPassword(values.password);
        props.onNext && props.onNext(onboarding.selfHosted);
      },
    });

    const password = useField({
      id: 'password',
      form: passwordForm,
      initialValue: '',
      validationSchema: yup
        .string()
        .required('No password provided.')
        .min(8, 'Password is too short - should be 8 chars minimum.'),
    });

    const confirmPassword = useField({
      id: 'confirm',
      form: passwordForm,
      initialValue: '',
      validate: (confirm) => {
        return password.state.value === confirm
          ? { parsed: confirm }
          : { error: 'Passwords must match.' };
      },
    });

    return (
      <Grid.Column pl={12} noGutter lg={12} xl={12}>
        <Text fontSize={4} mb={1} variant="body">
          Security
        </Text>
        <Text
          fontSize={2}
          fontWeight={200}
          lineHeight="20px"
          variant="body"
          opacity={0.6}
          mb={4}
        >
          Your password will encrypt your local data. It is only needed for
          Realm.
        </Text>
        <Flex
          width="100%"
          height="100%"
          justifyContent="center"
          alignItems="center"
        >
          <Flex
            flex={1}
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
          >
            <Sigil
              simple={false}
              size={52}
              avatar={avatar}
              patp={shipName}
              borderRadiusOverride="6px"
              color={[shipColor || '#000000', 'white']}
            />
            <Flex
              style={{ width: 210 }}
              transition={{ duration: 0 }}
              animate={{ marginBottom: shipNick ? 24 : 0 }}
              position="relative"
              mt={3}
              alignItems="center"
              flexDirection="column"
            >
              {shipNick && (
                <Text position="absolute" fontWeight={500}>
                  {shipNick}
                </Text>
              )}
              <Text
                transition={{ duration: 0, y: { duration: 0 } }}
                animate={{
                  opacity: shipNick ? 0.5 : 1,
                  y: shipNick ? 22 : 0,
                }}
              >
                {shipName}
              </Text>
            </Flex>
          </Flex>
          <Flex
            flex={3}
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
          >
            <FormControl.FieldSet width="100%">
              <FormControl.Field>
                <Label>Password</Label>
                <TextInput
                  mt={1}
                  tabIndex={1}
                  id="onboarding-password-1"
                  name="password"
                  type="password"
                  placeholder="Must have at least 8 characters"
                  className="realm-cursor-text-cursor"
                  width="100%"
                  error={
                    password.computed.ifWasEverBlurredThenError &&
                    password.computed.isDirty &&
                    password.computed.error
                  }
                  onChange={(e: any) =>
                    password.actions.onChange(e.target.value)
                  }
                  onFocus={() => password.actions.onFocus()}
                  onBlur={() => password.actions.onBlur()}
                />
              </FormControl.Field>
              <FormControl.Field mt={2}>
                <Label>Confirm password</Label>
                <TextInput
                  mt={1}
                  id="onboarding-password-2"
                  tabIndex={2}
                  name="confirm-password"
                  type="password"
                  placeholder="Must have at least 8 characters"
                  className="realm-cursor-text-cursor"
                  width="100%"
                  error={
                    confirmPassword.computed.ifWasEverBlurredThenError &&
                    confirmPassword.computed.isDirty &&
                    confirmPassword.computed.error
                  }
                  onChange={(e: any) =>
                    confirmPassword.actions.onChange(e.target.value)
                  }
                  onFocus={() => confirmPassword.actions.onFocus()}
                  onBlur={() => confirmPassword.actions.onBlur()}
                />
              </FormControl.Field>
            </FormControl.FieldSet>
          </Flex>
        </Flex>
        <Box position="absolute" height={40} bottom={20} right={24}>
          <Flex
            mt={5}
            width="100%"
            alignItems="center"
            justifyContent="space-between"
          >
            <TextButton
              onClick={passwordForm.actions.submit}
              disabled={passwordForm.computed.isError}
            >
              Next
            </TextButton>
          </Flex>
        </Box>
      </Grid.Column>
    );
  }
);

export default SetPassword;
