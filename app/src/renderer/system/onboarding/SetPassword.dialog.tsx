import { KeyboardEventHandler } from 'react';
import { useForm, useField } from 'mobx-easy-form';
import * as yup from 'yup';
import { Label, FormControl, Box } from 'renderer/components';
import { observer } from 'mobx-react';
import { useServices } from 'renderer/logic/store';
import { BaseDialogProps } from 'renderer/system/dialog/dialogs';
import { OnboardingActions } from 'renderer/logic/actions/onboarding';
import { Flex, Text, Avatar, TextInput, Button } from '@holium/design-system';
import { OnboardingStoreType } from '../../../os/services/onboarding/onboarding.model';

type SetPasswordPresenterViewProps = {
  shipName: string;
  shipNick: string | null;
  shipColor: string | null;
  avatar: string | null;
  onboarding: OnboardingStoreType;
  baseDialogProps: BaseDialogProps;
};

const SetPasswordPresenterView = ({
  shipName,
  shipNick,
  shipColor,
  avatar,
  onboarding,
  baseDialogProps,
}: SetPasswordPresenterViewProps) => {
  const passwordForm = useForm({
    async onSubmit({ values }) {
      await OnboardingActions.setPassword(values.password);
      baseDialogProps.onNext?.(onboarding.selfHosted);
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

  const onKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter') {
      if (!passwordForm.computed.isError) {
        passwordForm.actions.submit();
      }
    }
  };

  return (
    <Flex flexDirection="column" width="100%">
      <Text.Custom fontSize={4} mb={1}>
        Security
      </Text.Custom>
      <Text.Custom
        fontSize={2}
        fontWeight={200}
        lineHeight="20px"
        opacity={0.6}
        mb={4}
      >
        Your password will encrypt your local data. It is only needed for Realm.
      </Text.Custom>
      <Flex
        width="100%"
        height="100%"
        justifyContent="center"
        alignItems="center"
      >
        <Flex
          flexBasis={210}
          mr={4}
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
        >
          <Avatar
            simple={false}
            size={52}
            avatar={avatar}
            patp={shipName}
            borderRadiusOverride="6px"
            sigilColor={[shipColor || '#000000', 'white']}
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
              <Text.Custom
                textAlign="center"
                position="absolute"
                fontWeight={500}
              >
                {shipNick}
              </Text.Custom>
            )}
            <Text.Custom
              textAlign="center"
              transition={{ duration: 0, y: { duration: 0 } }}
              animate={{
                opacity: shipNick ? 0.5 : 1,
                y: shipNick ? 22 : 0,
              }}
            >
              {shipName}
            </Text.Custom>
          </Flex>
        </Flex>
        <Flex
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          width="100%"
        >
          <FormControl.FieldSet width="100%">
            <FormControl.Field>
              <Label>Password</Label>
              <TextInput
                mt={1}
                height={36}
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
                onChange={(e: any) => password.actions.onChange(e.target.value)}
                onFocus={() => password.actions.onFocus()}
                onBlur={() => password.actions.onBlur()}
                onKeyDown={onKeyDown}
              />
            </FormControl.Field>
            <FormControl.Field mt={2}>
              <Label>Confirm password</Label>
              <TextInput
                mt={1}
                height={36}
                id="onboarding-password-2"
                tabIndex={2}
                name="confirm-password"
                type="password"
                placeholder="Must match"
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
                onKeyDown={onKeyDown}
              />
            </FormControl.Field>
          </FormControl.FieldSet>
        </Flex>
      </Flex>
      <Box position="absolute" bottom={24} right={24}>
        <Button.TextButton
          py={1}
          showOnHover
          fontWeight={500}
          onClick={passwordForm.actions.submit}
          disabled={passwordForm.computed.isError}
          style={{ minWidth: 45 }}
        >
          Next
        </Button.TextButton>
      </Box>
    </Flex>
  );
};

const SetPasswordView = observer(SetPasswordPresenterView);

const SetPasswordPresenter = (props: BaseDialogProps) => {
  const { onboarding } = useServices();

  if (!onboarding.ship) return null;

  const shipName = onboarding.ship.patp;
  const shipNick = onboarding.ship.nickname;
  const shipColor = onboarding.ship.color;
  const avatar = onboarding.ship.avatar;

  return (
    <SetPasswordView
      shipName={shipName}
      shipNick={shipNick}
      shipColor={shipColor}
      avatar={avatar}
      onboarding={onboarding}
      baseDialogProps={props}
    />
  );
};

export const SetPassword = observer(SetPasswordPresenter);
