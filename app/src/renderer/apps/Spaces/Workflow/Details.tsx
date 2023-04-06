import { useEffect, useMemo, useState, useRef } from 'react';
import { Crest, isValidHexColor, isImgUrl } from 'renderer/components';
import { createField, createForm } from 'mobx-easy-form';
import * as yup from 'yup';
import { observer } from 'mobx-react';
import { TwitterPicker } from 'react-color';
import { BaseDialogProps } from 'renderer/system/dialog/dialogs';
import { ColorTile, ColorTilePopover } from 'renderer/components/ColorTile';
import {
  Flex,
  RadioGroup,
  RadioList,
  Button,
  Icon,
  Text,
  TextInput,
} from '@holium/design-system';
import { useShipStore } from 'renderer/stores/ship.store';

type CreateSpaceFormProps = {
  name: string;
  description: string;
  color: string;
  picture: string;
};

export const createSpaceForm = ({
  name,
  description,
  color,
  picture,
}: CreateSpaceFormProps) => {
  const spaceForm = createForm({
    onSubmit({ values }) {
      return values;
    },
  });

  const nameField = createField({
    id: 'name',
    form: spaceForm,
    initialValue: name,
    validationSchema: yup.string().required('Name is required'),
  });
  const descriptionField = createField({
    id: 'description',
    form: spaceForm,
    initialValue: description,
  });
  const colorField = createField({
    id: 'color',
    form: spaceForm,
    initialValue: color || '#000000',
    validationSchema: yup
      .string()
      .matches(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i, 'Enter a hex value')
      .required('Enter a hex value'),
  });
  const pictureField = createField({
    id: 'picture',
    form: spaceForm,
    initialValue: picture,
    validationSchema: yup.string().optional(),
    // .matches(
    //   /((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
    //   'Enter correct url!'
    // ),
  });
  return {
    spaceForm,
    nameField,
    descriptionField,
    colorField,
    pictureField,
  };
};

type CrestOptionType = 'color' | 'image';
type AccessOptionType = 'public' | 'antechamber' | 'private' | undefined;

const SpacesCreateFormPresenter = ({
  edit,
  workflowState,
  setState,
}: BaseDialogProps) => {
  const { spacesStore } = useShipStore();
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const [invalidImg, setInvalidImg] = useState(false);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [crestOption, setCrestOption] = useState<CrestOptionType>(
    workflowState.image ? 'image' : 'color'
  );

  const [accessOption, setAccessOption] = useState<AccessOptionType>(
    workflowState.access || 'public'
  );

  const handleClickOutside = (event: MouseEvent) => {
    const pickerNode = document.getElementById('space-color-tile-popover');
    const isVisible = pickerNode
      ? pickerNode.getAttribute('data-is-open') === 'true'
      : false; // get if the picker is visible currently

    // Close the color picker if the user clicks outside of it.
    if (isVisible && colorPickerRef.current) {
      if (
        event.target &&
        !colorPickerRef.current.contains(event.target as Node)
      ) {
        setColorPickerOpen(false);
      }
    }
  };

  const setWorkspaceState = (obj: any) => {
    setState?.({
      ...workflowState,
      ...obj,
    });
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside, true);
    if (workflowState.type === 'group') {
      if (workflowState.image) {
        setCrestOption('image');
        setWorkspaceState({ crestOption });
      } else {
        setWorkspaceState({ crestOption });
      }
    } else {
      setWorkspaceState({
        access: 'public',
      });
    }
    if (!workflowState.color) {
      setWorkspaceState({
        crestOption: 'color',
        color: '#000000',
      });
    }
    if (edit) {
      const space = spacesStore.spaces.get(edit.space);
      if (!space) return;
      setWorkspaceState({
        ...space,
        description: space.description,
        access: space.access,
        color: space.color,
        image: space.picture,
        crestOption: space.picture ? 'image' : 'color',
      });
      if (space.picture) {
        setCrestOption('image');
      }
      if (space.access) {
        const spaceAccess: AccessOptionType =
          space.access === 'public'
            ? 'public'
            : space.access === 'antechamber'
            ? 'antechamber'
            : 'private';
        setAccessOption(spaceAccess);
      }
    }

    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, []);

  const { nameField, descriptionField, pictureField, colorField } =
    useMemo(() => {
      if (edit) {
        const space = spacesStore.spaces.get(edit.space);
        if (space) return createSpaceForm(space);
      } else if (workflowState.type === 'group') {
        return createSpaceForm({
          name: workflowState.title,
          description: workflowState.description,
          color: workflowState.color,
          picture: workflowState.image,
        });
      }

      return createSpaceForm({
        name: '',
        description: '',
        color: workflowState.color,
        picture: '',
      });
    }, []);

  return (
    <Flex col width="100%">
      <Text.Custom
        fontSize={5}
        lineHeight="24px"
        fontWeight={500}
        mb={16}
        variant="body"
      >
        Edit details
      </Text.Custom>
      <Flex col width="100%" gap={16} justify="flex-start">
        <Flex row align="center" gap={16}>
          <Crest
            color={crestOption === 'color' ? workflowState.color : '#00000030'}
            picture={crestOption === 'image' ? workflowState.image : ''}
            size="md"
          />
          <Flex flex={1} col gap={4}>
            <Flex row justify="space-between" align="flex-end">
              <RadioGroup
                selected={crestOption}
                options={[
                  { label: 'Color', value: 'color' },
                  { label: 'Image', value: 'image' },
                ]}
                onClick={(value) => {
                  setCrestOption(value as CrestOptionType);
                  setWorkspaceState({ crestOption: value });
                  setWorkspaceState({ crestOption: value });
                }}
              />
              {invalidImg ? (
                <Text.Hint color="intent-alert">Invalid image</Text.Hint>
              ) : (
                <></>
              )}
            </Flex>

            <Flex
              animate={{
                display: crestOption === 'color' ? 'flex' : 'none',
              }}
              flex={1}
              align="flex-start"
              position="relative"
            >
              <TextInput
                id="space-color"
                name="color"
                tabIndex={1}
                height={34}
                required
                leftAdornment={<Text.Custom opacity={0.5}>#</Text.Custom>}
                rightAdornment={
                  <Flex
                    position="relative"
                    justifyContent="flex-end"
                    onClick={(evt) => evt.stopPropagation()}
                  >
                    <ColorTile
                      id="space-color-tile"
                      size={26}
                      tileColor={workflowState.color}
                      onClick={(_evt: any) => {
                        setColorPickerOpen(!colorPickerOpen);
                      }}
                    />
                    <ColorTilePopover
                      id="space-color-tile-popover"
                      size={26}
                      top={146}
                      left={198}
                      ref={colorPickerRef}
                      isOpen={colorPickerOpen}
                      data-is-open={colorPickerOpen}
                    >
                      <TwitterPicker
                        width="inherit"
                        className="cursor-style"
                        color={workflowState.color}
                        onChange={(newColor: { hex: string }) => {
                          colorField.actions.onChange(newColor.hex);
                          setWorkspaceState({
                            color: newColor.hex,
                            crestOption: 'color',
                          });
                          setColorPickerOpen(false);
                          // setValidatedColor(newColor.hex);
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
                }
                inputStyle={{
                  width: 80,
                }}
                style={{
                  borderRadius: 6,
                  paddingRight: 0,
                }}
                value={colorField.state.value.replace('#', '')}
                error={colorField.computed.ifWasEverBlurredThenError}
                onChange={(e: any) => {
                  const color = e.target.value.replace('#', '');
                  if (isValidHexColor(`#${color}`)) {
                    setWorkspaceState({
                      color: `#${color}`,
                      crestOption: 'color',
                    });
                  }
                  colorField.actions.onChange(color);
                }}
                onFocus={colorField.actions.onFocus}
                onBlur={colorField.actions.onBlur}
              />
            </Flex>

            <Flex
              flex={1}
              col
              initial={{ display: 'none', width: '100%' }}
              animate={{
                display: crestOption === 'image' ? 'flex' : 'none',
              }}
              align="flex-start"
              position="relative"
            >
              <TextInput
                id="space-image"
                leftAdornment={
                  <Icon name="ProfileImage" iconColor="#C1C1C1" size={24} />
                }
                name="picture"
                placeholder="Paste image link here"
                height={34}
                style={{
                  borderRadius: 6,
                  paddingLeft: 6,
                  paddingRight: 4,
                }}
                value={pictureField.state.value}
                // error={!avatar.computed.isDirty || avatar.computed.error}
                onChange={async (e: any) => {
                  if (e.target.value === '') {
                    setWorkspaceState({
                      image: '',
                      crestOption: 'image',
                    });
                  }
                  pictureField.actions.onChange(e.target.value);
                }}
                onFocus={pictureField.actions.onFocus}
                onBlur={pictureField.actions.onBlur}
                rightAdornment={
                  <Button.TextButton
                    onClick={async () => {
                      const isImage: boolean = await isImgUrl(
                        pictureField.state.value
                      );
                      if (isImage) {
                        setInvalidImg(false);
                        setWorkspaceState({
                          image: pictureField.state.value,
                          crestOption: 'image',
                        });
                      } else {
                        setInvalidImg(true);
                      }
                    }}
                  >
                    Apply
                  </Button.TextButton>
                }
              />
            </Flex>
          </Flex>
        </Flex>
        <Flex col mt={1} flex={1} gap={20} width="100%">
          <Flex inline col gap={2}>
            <Text.Label fontWeight={500}>
              Space name{' '}
              <span style={{ fontWeight: 400, opacity: 0.3 }}>*</span>
            </Text.Label>
            <TextInput
              tabIndex={1}
              id="space-name"
              name="name"
              required
              placeholder="Enter name"
              style={{
                height: 36,
                borderRadius: 6,
              }}
              defaultValue={nameField.state.value}
              error={nameField.computed.ifWasEverBlurredThenError}
              onChange={(e: any) => {
                nameField.actions.onChange(e.target.value);
                setWorkspaceState({ name: e.target.value });
              }}
              onFocus={() => nameField.actions.onFocus()}
              onBlur={nameField.actions.onBlur}
              disabled={workflowState.type === 'group'}
            />
          </Flex>
          <Flex inline col gap={2}>
            <Text.Label fontWeight={500}>
              Description{' '}
              <span style={{ marginLeft: 4, opacity: 0.3, fontWeight: 400 }}>
                (optional)
              </span>
            </Text.Label>
            <TextInput
              tabIndex={1}
              id="space-description"
              name="description"
              fontWeight={400}
              placeholder="Enter description"
              style={{
                height: 36,
                borderRadius: 6,
              }}
              defaultValue={descriptionField.state.value}
              error={descriptionField.computed.ifWasEverBlurredThenError}
              onChange={(e: any) =>
                descriptionField.actions.onChange(e.target.value)
              }
              onFocus={() => descriptionField.actions.onFocus()}
              onBlur={(e: any) => {
                setWorkspaceState({
                  description: e.target.value,
                });
                descriptionField.actions.onBlur();
              }}
            />
          </Flex>
          <Flex col>
            <Text.Label mb={1} fontWeight={500}>
              Access
            </Text.Label>
            <RadioList
              selected={accessOption}
              options={[
                {
                  icon: 'Public',
                  label: 'Public',
                  value: 'public',
                  sublabel: 'Anyone can join.',
                },
                {
                  icon: 'EyeOff',
                  label: 'Private',
                  value: 'private',
                  sublabel: 'An invitation is required to join.',
                },
                {
                  disabled: true,
                  icon: 'DoorOpen',
                  label: 'Antechamber',
                  value: 'antechamber',
                  sublabel: 'Anyone can join a public holding area.',
                },
              ]}
              onClick={(value) => {
                setAccessOption(value as AccessOptionType);
                setWorkspaceState({
                  access: value,
                });
              }}
            />
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};

export const SpacesCreateForm = observer(SpacesCreateFormPresenter);
