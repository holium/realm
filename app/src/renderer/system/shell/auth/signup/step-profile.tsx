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

export const createProfileForm = (
  defaults: any = {
    nickname: '',
    sigilColor: '#000000',
    avatar: '',
  }
) => {
  const profileForm = createForm({
    onSubmit({ values }) {
      return values;
    },
  });

  const nickname = createField({
    id: 'nickname',
    form: profileForm,
    initialValue: defaults.nickname || '',
    // validationSchema: yup.string().required('Name is required'),
  });
  const sigilColor = createField({
    id: 'sigil-color',
    form: profileForm,
    initialValue: defaults.sigilColor || '',
    validationSchema: yup
      .string()
      .matches(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i, 'Enter a hex value')
      .required('Enter a hex value'),
  });
  const avatar = createField({
    id: 'avatar',
    form: profileForm,
    initialValue: defaults.avatar || '',
    validationSchema: yup
      .string()
      .matches(
        /((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
        'Enter correct url!'
      )
      .required('Please enter url'),
  });
  return {
    profileForm,
    nickname,
    sigilColor,
    avatar,
  };
};

type ProfileSetupProps = {
  // isValid: boolean;
  // setValid: (isValid: boolean) => void;
};

export const ProfileSetup: FC<ProfileSetupProps> = (
  props: ProfileSetupProps
) => {
  const { shipStore } = useMst();
  const shipName = '~lomder-librun';
  const { profileForm, nickname, sigilColor, avatar } = useMemo(
    () => createProfileForm(),
    []
  );

  return (
    <Grid.Column pl={12} noGutter lg={12} xl={12}>
      <Text fontSize={4} mb={1} variant="body">
        Profile
      </Text>
      <Text
        fontSize={2}
        fontWeight={200}
        lineHeight="20px"
        variant="body"
        opacity={0.6}
        mb={4}
      >
        We’ve loaded the profile from your ship. If you want to customize it,
        you can do it here.
      </Text>
      <Grid.Row noGutter>
        <Grid.Column
          noGutter
          align="center"
          justify="center"
          lg={5}
          xl={5}
          pr={6}
        >
          <Sigil
            simple={false}
            size={52}
            avatar={avatar.state.value}
            patp={shipName}
            borderRadiusOverride="6px"
            color={[sigilColor.state.value, 'white']}
          />
          <Text mt={3}>{shipName}</Text>
        </Grid.Column>
        <Grid.Column noGutter lg={7} xl={7}>
          <FormControl.FieldSet>
            <FormControl.Field>
              <Label>Nickname</Label>
              <Input
                tabIndex={1}
                name={'nickname'}
                placeholder=""
                defaultValue={nickname.state.value}
                error={!nickname.computed.isDirty || nickname.computed.error}
                onChange={(e: any) => nickname.actions.onChange(e.target.value)}
                onFocus={() => nickname.actions.onFocus()}
                onBlur={() => nickname.actions.onBlur()}
              />
            </FormControl.Field>
            <FormControl.Field>
              <Label>Sigil Color</Label>
              <Input
                tabIndex={2}
                name="sigil-color"
                placeholder="#000000"
                defaultValue={sigilColor.state.value}
                error={
                  !sigilColor.computed.isDirty || sigilColor.computed.error
                }
                onChange={(e: any) =>
                  sigilColor.actions.onChange(e.target.value)
                }
                onFocus={() => sigilColor.actions.onFocus()}
                onBlur={() => sigilColor.actions.onBlur()}
              />
            </FormControl.Field>
            <FormControl.Field>
              <Label>Avatar</Label>
              <Input
                tabIndex={3}
                name="avatar"
                placeholder=""
                defaultValue={avatar.state.value}
                error={!avatar.computed.isDirty || avatar.computed.error}
                onChange={(e: any) => avatar.actions.onChange(e.target.value)}
                onFocus={() => avatar.actions.onFocus()}
                onBlur={() => avatar.actions.onBlur()}
              />
            </FormControl.Field>
          </FormControl.FieldSet>
        </Grid.Column>
      </Grid.Row>
    </Grid.Column>
  );
};

export default ProfileSetup;
