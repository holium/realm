import { FC, useEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { createField, createForm } from 'mobx-easy-form';
import * as yup from 'yup';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { TwitterPicker, SwatchesPicker } from 'react-color';

import {
  Grid,
  Sigil,
  Text,
  Input,
  Label,
  FormControl,
  FileUpload,
  Icons,
  Box,
  Flex,
  TextButton,
  Spinner,
} from '../../../components';
import { observer, Observer } from 'mobx-react';
import { useServices } from 'renderer/logic/store';
import { SignupActions } from 'renderer/logic/actions/signup';
import { ColorTile, ColorTilePopover } from 'renderer/components/ColorTile';

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
      .optional()
      .matches(
        /((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
        'Enter correct url!'
      ),
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
  next: () => void;
  // setValid: (isValid: boolean) => void;
};

export const ProfileSetup: FC<ProfileSetupProps> = observer(
  (props: ProfileSetupProps) => {
    const { identity } = useServices();
    const { signup } = identity;
    const colorPickerRef = useRef(null);
    const { next } = props;
    const shipName = signup.signupShip!.patp;

    const [color, setColor] = useState(signup.signupShip!.color || '#000000');
    // const [avatarEl, setAvatar] = useState(signup.signupShip!.avatar || '');
    const [colorPickerOpen, setColorPickerOpen] = useState(false);

    const handleClickOutside = (event: any) => {
      const domNode = ReactDOM.findDOMNode(colorPickerRef.current);
      const pickerNode = document.getElementById('signup-color-tile-popover');
      const isVisible = pickerNode
        ? pickerNode!.getAttribute('data-is-open') === 'true'
        : false; // get if the picker is visible currently
      if (!domNode || !domNode.contains(event.target)) {
        if ('signup-color-tile' === event.target.id) {
          return;
        }
        // You are clicking outside
        if (isVisible) {
          setColorPickerOpen(false);
        }
      }
    };

    useEffect(() => {
      document.addEventListener('click', handleClickOutside, true);
      sigilColor.actions.onChange(signup.signupShip!.color || '#000000');
      () => {
        document.removeEventListener('click', handleClickOutside, true);
      };
    }, []);

    const shipInfo = {
      nickname: signup.signupShip!.nickname,
      sigilColor: color,
      avatar: signup.signupShip!.avatar || '',
    };

    const { profileForm, nickname, avatar, sigilColor } = useMemo(
      () => createProfileForm(shipInfo),
      []
    );

    // const onAvatarUpload = (file: any) => {
    //   console.log(file);
    // };

    const shouldSave = profileForm.computed.isDirty;

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
          We’ve loaded the profile from your ship. Feel free to edit it here.
        </Text>
        <Grid.Row noGutter>
          <Grid.Column
            noGutter
            align="center"
            justify="center"
            lg={6}
            xl={6}
            pr={6}
          >
            <Sigil
              simple={false}
              size={52}
              avatar={
                avatar.state.value && !avatar.computed.ifWasEverBlurredThenError
                  ? avatar.state.value
                  : null
              }
              patp={shipName}
              borderRadiusOverride="6px"
              color={[sigilColor.state.value, 'white']}
            />
            <Observer>
              {() => (
                <Flex
                  style={{ width: 210 }}
                  transition={{
                    duration: nickname.computed.isDirty ? 0.15 : 0,
                  }}
                  animate={{ marginBottom: nickname.state.value ? 24 : 0 }}
                  position="relative"
                  mt={3}
                  alignItems="center"
                  flexDirection="column"
                >
                  {nickname.state.value && (
                    <Text position="absolute" fontWeight={500}>
                      {nickname.state.value}
                    </Text>
                  )}
                  <Text
                    transition={{
                      opacity: {
                        duration: nickname.computed.isDirty ? 0.15 : 0,
                      },
                      y: { duration: nickname.computed.isDirty ? 0.15 : 0 },
                    }}
                    animate={{
                      opacity: nickname.state.value ? 0.5 : 1,
                      y: nickname.state.value ? 22 : 0,
                    }}
                  >
                    {shipName}
                  </Text>
                </Flex>
              )}
            </Observer>
          </Grid.Column>
          <Grid.Column noGutter justify="center" lg={6} xl={6}>
            <FormControl.FieldSet>
              <FormControl.Field>
                <Label>Sigil Color</Label>
                <Flex flex={1} alignItems="flex-start" position="relative">
                  <ColorTile
                    id="signup-color-tile"
                    tileColor={sigilColor.state.value}
                    onClick={(evt: any) => {
                      console.log('clicking tile', colorPickerOpen);
                      setColorPickerOpen(!colorPickerOpen);
                    }}
                  />
                  <ColorTilePopover
                    id="signup-color-tile-popover"
                    ref={colorPickerRef}
                    isOpen={colorPickerOpen}
                    data-is-open={colorPickerOpen}
                  >
                    <TwitterPicker
                      width="inherit"
                      className="cursor-style"
                      color={sigilColor.state.value}
                      onChange={(color: { hex: string }) => {
                        sigilColor.actions.onChange(color.hex);
                        // setColor(color.hex);
                      }}
                      triangle="top-left"
                      colors={[
                        '#D9682A',
                        '#D9A839',
                        '#52B278',
                        '#3E89D1',
                        '#96A0A8',
                        '#CC314C',
                        '#CF8194',
                        '#8419D9',
                      ]}
                    />
                  </ColorTilePopover>
                </Flex>
              </FormControl.Field>
              {/* <Grid.Row
              expand
              noGutter
              align="flex-start"
              justify="space-between"
            > */}
              <FormControl.Field>
                <Label>Avatar</Label>
                <Flex>
                  {/* <FileUpload
                    required
                    name="avatar"
                    label="Avatar"
                    width={40}
                    onChange={(e: any) => setAvatar(e.target.value)}
                    onBlur={(e: any) => setAvatar(e.target.value)}
                    icon={
                      <Icons name="ProfileImage" color="#C1C1C1" size={30} />
                    }
                    onNewFile={(avatar: any) => onAvatarUpload(avatar)}
                  /> */}
                  <Box
                    display="flex"
                    flex={1}
                    borderRadius={4}
                    borderColor="ui.input.borderColor"
                    borderStyle="solid"
                    borderWidth={1}
                    backgroundColor="bg.tertiary"
                    justifyContent="center"
                    minWidth={32}
                    minHeight={30}
                    mr={2}
                    alignItems="center"
                  >
                    {avatar.state.value &&
                    !avatar.computed.ifWasEverBlurredThenError ? (
                      <img
                        src={avatar.state.value}
                        width="32"
                        height="32"
                        style={{ borderRadius: 4 }}
                      />
                    ) : (
                      <Icons name="ProfileImage" color="#C1C1C1" size={24} />
                    )}
                  </Box>
                  <Input
                    tabIndex={3}
                    name="avatar"
                    placeholder="Paste image link here"
                    wrapperStyle={{ height: 35 }}
                    // value={avatarEl}
                    value={avatar.state.value}
                    // error={!avatar.computed.isDirty || avatar.computed.error}
                    onChange={(e: any) =>
                      avatar.actions.onChange(e.target.value)
                    }
                    onFocus={() => avatar.actions.onFocus()}
                    onBlur={() => avatar.actions.onBlur()}
                  />
                </Flex>
              </FormControl.Field>
              <FormControl.Field>
                <Label>Nickname</Label>
                <Input
                  tabIndex={1}
                  name="nickname"
                  placeholder="optional"
                  defaultValue={nickname.state.value}
                  error={!nickname.computed.isDirty || nickname.computed.error}
                  onChange={(e: any) =>
                    nickname.actions.onChange(e.target.value)
                  }
                  onFocus={() => nickname.actions.onFocus()}
                  onBlur={() => nickname.actions.onBlur()}
                />
              </FormControl.Field>
              {/* </Grid.Row> */}
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
              onClick={(evt: any) => {
                if (profileForm.computed.isDirty) {
                  const formData = profileForm.actions.submit();
                  SignupActions.saveProfile(shipName, {
                    color: formData['sigil-color'],
                    nickname: formData['nickname'],
                    avatar: formData['avatar'],
                  })
                    .then((value: any) => {
                      next();
                      evt.target.blur();
                      return null;
                    })
                    .catch((reason: any) => {
                      console.log(reason);
                    });
                } else {
                  next();
                }
              }}
            >
              {signup.isLoading ? (
                <Spinner size={0} />
              ) : shouldSave ? (
                'Save'
              ) : (
                'Next'
              )}
            </TextButton>
          </Flex>
        </Box>
      </Grid.Column>
    );
  }
);

export default ProfileSetup;
