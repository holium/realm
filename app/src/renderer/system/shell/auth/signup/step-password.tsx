import { FC, useMemo } from 'react';
import { createField, createForm } from 'mobx-easy-form';
import * as yup from 'yup';
import { useAuth } from 'renderer/logic/store';

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
  Spinner,
} from '../../../../components';
import { motion } from 'framer-motion';
import { observer } from 'mobx-react';

export const createPasswordForm = () => {
  const passwordForm = createForm({
    onSubmit({ values }) {
      return values;
    },
  });

  const password = createField({
    id: 'password',
    form: passwordForm,
    initialValue: '',
    validationSchema: yup.string().required('Password is required'),
  });

  const confirmPassword = createField({
    id: 'confirm',
    form: passwordForm,
    initialValue: '',
    validationSchema: yup
      .string()
      .oneOf([yup.ref('password'), null], 'Passwords must match'),
  });

  return {
    passwordForm,
    password,
    confirmPassword,
  };
};

type StepPasswordProps = {
  next: () => void;

  // isValid: boolean;
  // setValid: (isValid: boolean) => void;
};

export const StepPassword: FC<StepPasswordProps> = observer(
  (props: StepPasswordProps) => {
    const { signupStore } = useAuth();
    const { next } = props;

    const shipName = signupStore.signupShip!.patp;
    const shipNick = signupStore.signupShip!.nickname;
    const shipColor = signupStore.signupShip!.color!;
    const avatar = signupStore.signupShip!.avatar;
    const { passwordForm, password, confirmPassword } = useMemo(
      () => createPasswordForm(),
      []
    );

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
              // disabled={passwordForm.computed.isError}
              onClick={(evt: any) => {
                next();
              }}
            >
              {signupStore.isLoading ? <Spinner size={0} /> : 'Next'}
            </TextButton>
          </Flex>
        </Box>
      </Grid.Column>
    );
  }
);

export default StepPassword;
