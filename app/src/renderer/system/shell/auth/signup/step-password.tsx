import { FC, useMemo } from 'react';
import { createField, createForm } from 'mobx-easy-form';
import * as yup from 'yup';
import { useMst } from 'renderer/logic/store';

import {
  Grid,
  Sigil,
  Text,
  Input,
  Label,
  FormControl,
  Box,
  Flex,
} from '../../../../components';

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
  });

  const confirmPassword = createField({
    id: 'confirm',
    form: passwordForm,
    initialValue: '',
    validationSchema: yup.object({
      password: yup.string().required('Password is required'),
      passwordConfirmation: yup
        .string()
        .oneOf([yup.ref('password'), null], 'Passwords must match'),
    }),
  });

  return {
    passwordForm,
    password,
    confirmPassword,
  };
};

type StepPasswordProps = {
  // isValid: boolean;
  // setValid: (isValid: boolean) => void;
};

export const StepPassword: FC<StepPasswordProps> = (
  props: StepPasswordProps
) => {
  const { shipStore } = useMst();
  const shipName = '~lomder-librun';
  const shipColor = '#F08735';
  const avatar = null;
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
        Your password will encrypt your local data. It is only needed for Realm.
      </Text>
      <Grid.Row noGutter>
        <Grid.Column
          noGutter
          align="center"
          justify="center"
          pr={6}
          lg={5}
          xl={5}
        >
          <Sigil
            simple={false}
            size={52}
            avatar={avatar}
            patp={shipName}
            borderRadiusOverride="6px"
            color={[shipColor, 'white']}
          />
          <Text mt={3}>{shipName}</Text>
        </Grid.Column>
        <Grid.Column noGutter lg={7} xl={7}>
          <FormControl.FieldSet>
            <FormControl.Field>
              <Label>Password</Label>
              <Input
                tabIndex={1}
                name="password"
                type="password"
                placeholder="***************"
                error={!password.computed.isDirty || password.computed.error}
                onChange={(e: any) => password.actions.onChange(e.target.value)}
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
    </Grid.Column>
  );
};

export default StepPassword;
