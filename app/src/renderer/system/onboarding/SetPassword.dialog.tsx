import { FC } from 'react';
import { useForm, useField } from 'mobx-easy-form';
import * as yup from 'yup';

import {
  Grid,
  Sigil,
  Text,
  Input,
  Label,
  FormControl,
  Box,
  Flex,
  TextButton,
} from 'renderer/components';
import { observer } from 'mobx-react';
import { useServices } from 'renderer/logic/store';
import { BaseDialogProps } from 'renderer/system/dialog/dialogs';

export const SetPassword: FC<BaseDialogProps> = observer(
  (props: BaseDialogProps) => {
    const { onboarding } = useServices();

    const shipName = onboarding.ship!.patp;
    const shipNick = onboarding.ship!.nickname;
    const shipColor = onboarding.ship!.color!;
    const avatar = onboarding.ship!.avatar;

    const passwordForm = useForm({
      async onSubmit({ values }) {
        props.onNext && props.onNext();
      },
    });

    const password = useField({
      id: 'password',
      form: passwordForm,
      initialValue: '',
      validationSchema: yup.string().required('Password is required'),
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
        <Grid.Row noGutter>
          <Grid.Column
            noGutter
            align="center"
            justify="center"
            pr={6}
            lg={6}
            xl={6}
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
          </Grid.Column>
          <Grid.Column noGutter justify="center" lg={6} xl={6}>
            <FormControl.FieldSet>
              <FormControl.Field>
                <Label>Password</Label>
                <Input
                  tabIndex={1}
                  name="password"
                  type="password"
                  placeholder="***************"
                  error={!password.computed.isDirty || password.computed.error}
                  onChange={(e: any) =>
                    password.actions.onChange(e.target.value)
                  }
                  onFocus={() => password.actions.onFocus()}
                  onBlur={() => password.actions.onBlur()}
                />
              </FormControl.Field>
              <FormControl.Field>
                <Label>Confirm password</Label>
                <Input
                  tabIndex={2}
                  name="confirm-password"
                  type="password"
                  placeholder="***************"
                  error={
                    !confirmPassword.computed.isDirty ||
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
          </Grid.Column>
        </Grid.Row>
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
              // onClick={(evt: any) => {
              //   next();
              // }}
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
