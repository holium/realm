import { FC, useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { useField, useForm } from 'mobx-easy-form';
import * as yup from 'yup';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { TwitterPicker } from 'react-color';

import {
  Grid,
  Sigil,
  Text,
  Label,
  FormControl,
  Box,
  Flex,
  TextButton,
  Spinner,
} from 'renderer/components';
import { observer, Observer } from 'mobx-react';
import { useServices } from 'renderer/logic/store';
import { OnboardingActions } from 'renderer/logic/actions/onboarding';
import { BaseDialogProps } from 'renderer/system/dialog/dialogs';
import { AvatarInput, TextInput } from '@holium/design-system';

interface ColorTileProps {
  tileColor: string;
}
const ColorTile = styled(Flex)<ColorTileProps>`
  background: ${(props: ColorTileProps) => props.tileColor};
  height: 30px;
  width: 30px;
  cursor: none;
  position: relative;
  outline: none;
  float: left;
  border-radius: 4px;
  margin: 0px 6px 0px 0px;
  outline: none;
  border: 1px solid transparent;
  &:focus,
  &:focus-within,
  &:active {
    transition: ${(props) => props.theme.transition};
    outline: none;
    border-color: ${(props) => props.theme.colors.brand.primary} !important;
    &::placeholder {
      color: transparent;
    }
  }
`;
interface ColorPopoverProps {
  isOpen: boolean;
}
const ColorTilePopover = styled(motion.div)<ColorPopoverProps>`
  position: absolute;
  z-index: 3;
  top: 40px;
  left: -6px;
  width: 170px;
  .cursor-style {
    div {
      cursor: none !important;
    }
  }
  display: ${(props: ColorPopoverProps) => (props.isOpen ? 'block' : 'none')};
`;

export const ProfileSetup: FC<BaseDialogProps> = observer(
  (props: BaseDialogProps) => {
    const { onboarding } = useServices();
    const colorPickerRef = useRef(null);
    const shipName = onboarding.ship!.patp;
    const [loading, setLoading] = useState(false);
    const [profileLoading, setProfileLoading] = useState(true);
    const [avatarImg, setAvatarImg] = useState(
      onboarding.ship ? onboarding.ship.avatar! : ''
    );

    const [colorPickerOpen, setColorPickerOpen] = useState(false);

    const profileForm = useForm({
      async onSubmit({ values }) {
        if (profileForm.computed.isDirty) {
          setLoading(true);
          try {
            const profileData = {
              color: values.color,
              nickname: values.nickname,
              avatar: avatarImg,
            };
            await OnboardingActions.setProfile(profileData);
            props.setState &&
              props.setState({ ...props.workflowState, profile: profileData });
            props.onNext && props.onNext();
            setLoading(false);
          } catch (reason) {
            console.error(reason);
            setLoading(false);
          }
        } else {
          props.onNext && props.onNext();
        }
      },
    });

    const nickname = useField({
      id: 'nickname',
      form: profileForm,
      initialValue: '',
    });

    const sigilColor = useField({
      id: 'color',
      form: profileForm,
      initialValue: '',
      validationSchema: yup
        .string()
        .matches(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i, 'Enter a hex value')
        .required('Enter a hex value'),
    });

    useEffect(() => {
      OnboardingActions.getProfile()
        .then((profile: any) => {
          profileForm.fields.nickname.actions.onChange(profile.nickname);
          profileForm.fields.color.actions.onChange(profile.color);
          setAvatarImg(profile.avatar || '');
          setProfileLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setProfileLoading(false);
        });
    }, []);

    const handleClickOutside = (event: any) => {
      const domNode = ReactDOM.findDOMNode(colorPickerRef.current);
      const pickerNode = document.getElementById('signup-color-tile-popover');
      const isVisible = pickerNode
        ? pickerNode.getAttribute('data-is-open') === 'true'
        : false; // get if the picker is visible currently
      if (!domNode || !domNode.contains(event.target)) {
        if (event.target.id === 'signup-color-tile') {
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
      sigilColor.actions.onChange(onboarding.ship!.color || '#000000');
      () => {
        document.removeEventListener('click', handleClickOutside, true);
      };
    }, []);

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
          {profileLoading ? (
            <Flex flex={1} alignItems="center" justifyContent="center">
              <Spinner size={3} />
            </Flex>
          ) : (
            <>
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
                  avatar={avatarImg}
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
                        as="button"
                        tileColor={sigilColor.state.value}
                        onClick={() => {
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
                  <FormControl.Field>
                    <Label>Avatar</Label>
                    <AvatarInput
                      id="profile-setup-avatar-input"
                      tabIndex={3}
                      initialValue={avatarImg}
                      onSave={(url) => setAvatarImg(url)}
                      height={35}
                    />
                  </FormControl.Field>
                  <FormControl.Field>
                    <Label>Nickname</Label>
                    <TextInput
                      id="onboarding-nickname"
                      name="nickname"
                      className="realm-cursor-text-cursor"
                      width="100%"
                      type="text"
                      placeholder="optional"
                      value={nickname.state.value || ''}
                      onChange={(e: any) =>
                        nickname.actions.onChange(e.target.value)
                      }
                      onFocus={() => nickname.actions.onFocus()}
                      onBlur={() => nickname.actions.onBlur()}
                    />
                  </FormControl.Field>
                </FormControl.FieldSet>
              </Grid.Column>
            </>
          )}
        </Grid.Row>
        <Box position="absolute" height={40} bottom={20} right={24}>
          <Flex
            mt={5}
            width="100%"
            alignItems="center"
            justifyContent="space-between"
          >
            <TextButton onClick={profileForm.actions.submit}>
              {loading ? <Spinner size={0} /> : 'Next'}
            </TextButton>
          </Flex>
        </Box>
      </Grid.Column>
    );
  }
);

export default ProfileSetup;
