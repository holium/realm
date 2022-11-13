import { FC, useEffect, useMemo, useState, useRef } from 'react';
import {
  Grid,
  Text,
  Flex,
  Label,
  Input,
  Icons,
  Crest,
  RadioGroup,
  FormControl,
  RadioList,
} from 'renderer/components';
import { createField, createForm } from 'mobx-easy-form';
import * as yup from 'yup';
import { observer } from 'mobx-react';
import { TwitterPicker } from 'react-color';

import { useServices } from 'renderer/logic/store';
import { BaseDialogProps } from 'renderer/system/dialog/dialogs';
import { ColorTile, ColorTilePopover } from 'renderer/components/ColorTile';
import ReactDOM from 'react-dom';

const hexRegex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

const isValidHexColor = (hex: string) => {
  return hexRegex.test(`#${hex}`);
};
const urlRegex =
  /((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/;
const isValidImageUrl = (url: string) => {
  return urlRegex.test(url);
};

export const createSpaceForm = (
  defaults: any = {
    name: '',
    description: '',
    color: '#000000',
    picture: '',
  }
) => {
  const spaceForm = createForm({
    onSubmit({ values }) {
      return values;
    },
  });

  const name = createField({
    id: 'name',
    form: spaceForm,
    initialValue: defaults.name || '',
    validationSchema: yup.string().required('Name is required'),
  });
  const description = createField({
    id: 'description',
    form: spaceForm,
    initialValue: defaults.description || '',
  });
  const color = createField({
    id: 'color',
    form: spaceForm,
    initialValue: defaults.color || '',
    validationSchema: yup
      .string()
      .matches(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i, 'Enter a hex value')
      .required('Enter a hex value'),
  });
  const picture = createField({
    id: 'picture',
    form: spaceForm,
    initialValue: defaults.picture || '',
    validationSchema: yup
      .string()
      .optional()
      .matches(
        /((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
        'Enter correct url!'
      ),
  });
  return {
    spaceForm,
    name,
    description,
    color,
    picture,
  };
};

type CrestOptionType = 'color' | 'image';
type AccessOptionType = 'public' | 'antechamber' | 'private' | undefined;

export const SpacesCreateForm: FC<BaseDialogProps> = observer(
  (props: BaseDialogProps) => {
    const { theme } = useServices();
    const { inputColor, windowColor, textColor } = theme.currentTheme;
    const { workflowState, setState } = props;
    const colorPickerRef = useRef(null);

    const [colorPickerOpen, setColorPickerOpen] = useState(false);
    const [crestOption, setCrestOption] = useState<CrestOptionType>('color');
    const [validatedColor, setValidatedColor] = useState('#000000'); // todo add maybe group color
    const [validatedImageUrl, setValidatedImageUrl] = useState(''); // todo add maybe group image url

    const [accessOption, setAccessOption] =
      useState<AccessOptionType>('public');

    const handleClickOutside = (event: any) => {
      const domNode = ReactDOM.findDOMNode(colorPickerRef.current);
      const pickerNode = document.getElementById('space-color-tile-popover');
      const isVisible = pickerNode
        ? pickerNode.getAttribute('data-is-open') === 'true'
        : false; // get if the picker is visible currently
      if (!domNode || !domNode.contains(event.target)) {
        if (event.target.id === 'space-color-tile') {
          return;
        }
        // You are clicking outside
        if (isVisible) {
          setColorPickerOpen(false);
        }
      }
    };

    const setWorkspaceState = (obj: any) => {
      setState &&
        setState({
          ...workflowState,
          ...obj,
        });
      // workflowState.set({
      //   ...workflowState,
      //   ...obj,
      // });
    };

    useEffect(() => {
      // TODO remove after testing
      document.addEventListener('click', handleClickOutside, true);
      if (workflowState.type === 'group') {
        setValidatedImageUrl(workflowState.image);
        setCrestOption('image');
      }
      setWorkspaceState({
        access: 'public',
        color: '#000000',
        picture: workflowState.image || '',
      });
      // props.setState!({
      //   type: 'space',
      //   archetype: 'community',
      //   archetypeTitle: 'Community',
      //   color: '#000000',
      //   access: 'public',
      // });
      () => {
        document.removeEventListener('click', handleClickOutside, true);
      };
    }, []);

    const { spaceForm, name, description, picture, color } = useMemo(
      () => {
        if (workflowState.type === 'group') {
          return createSpaceForm({
            name: workflowState.title,
            //description: workflowState.description,
            color: workflowState.color,
            picture: workflowState.image,
          });
        }
        else {
          return createSpaceForm({ color: validatedColor });
        }
      },
      []
    );

    return (
      <Grid.Column noGutter lg={12} xl={12}>
        <Text
          fontSize={5}
          lineHeight="24px"
          fontWeight={500}
          mb={16}
          variant="body"
        >
          Edit details
        </Text>
        <Flex flexDirection="column" gap={16} justifyContent="flex-start">
          <Flex flexDirection="row" alignItems="center" gap={16}>
            <Crest
              color={validatedColor}
              picture={validatedImageUrl}
              size="md"
            />
            <Flex flex={1} flexDirection="column" gap={4}>
              <RadioGroup
                customBg={windowColor}
                textColor={textColor}
                selected={crestOption}
                options={[
                  { label: 'Color', value: 'color' },
                  { label: 'Image', value: 'image' },
                ]}
                onClick={(value: CrestOptionType) => {
                  setCrestOption(value);
                }}
              />

              <Flex
                initial={{ display: 'flex' }}
                animate={{
                  display: crestOption === 'color' ? 'flex' : 'none',
                }}
                flex={1}
                alignItems="flex-start"
                position="relative"
              >
                <Input
                  name="color"
                  tabIndex={1}
                  height={34}
                  required
                  leftIcon={<Text opacity={0.5}>#</Text>}
                  rightInteractive
                  rightIcon={
                    <Flex position="relative" justifyContent="flex-end">
                      <ColorTile
                        id="space-color-tile"
                        size={26}
                        tileColor={validatedColor}
                        onClick={(_evt: any) => {
                          setColorPickerOpen(!colorPickerOpen);
                        }}
                      />
                      <ColorTilePopover
                        id="space-color-tile-popover"
                        size={26}
                        ref={colorPickerRef}
                        isOpen={colorPickerOpen}
                        data-is-open={colorPickerOpen}
                      >
                        <TwitterPicker
                          width="inherit"
                          className="cursor-style"
                          color={validatedColor}
                          onChange={(newColor: { hex: string }) => {
                            color.actions.onChange(newColor.hex);
                            setWorkspaceState({
                              color: newColor.hex,
                            });
                            setValidatedColor(newColor.hex);
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
                  wrapperStyle={{
                    width: 140,
                    backgroundColor: inputColor,
                    borderRadius: 6,
                    paddingRight: 0,
                  }}
                  value={color.state.value.replace('#', '')}
                  error={color.computed.ifWasEverBlurredThenError}
                  onChange={(e: any) => {
                    if (isValidHexColor(e.target.value)) {
                      setValidatedColor(`#${e.target.value}`);
                      setWorkspaceState({
                        color: `#${e.target.value}`,
                      });
                    }
                    color.actions.onChange(e.target.value);
                  }}
                  onFocus={() => color.actions.onFocus()}
                  onBlur={() => color.actions.onBlur()}
                />
              </Flex>

              <Flex
                flex={1}
                initial={{ display: 'none' }}
                animate={{
                  width: '100%',
                  display: crestOption === 'image' ? 'flex' : 'none',
                }}
                // alignItems="flex-start"
                position="relative"
              >
                <Input
                  leftIcon={
                    <Icons name="ProfileImage" color="#C1C1C1" size={24} />
                  }
                  name="picture"
                  placeholder="Paste image link here"
                  height={34}
                  wrapperStyle={{
                    borderRadius: 6,
                    paddingLeft: 6,
                    backgroundColor: inputColor,
                  }}
                  value={picture.state.value}
                  // error={!avatar.computed.isDirty || avatar.computed.error}
                  onChange={(e: any) => {
                    if (isValidImageUrl(e.target.value)) {
                      setValidatedImageUrl(e.target.value);
                      setWorkspaceState({
                        picture: e.target.value,
                      });
                    }
                    picture.actions.onChange(e.target.value);
                  }}
                  onFocus={() => picture.actions.onFocus()}
                  onBlur={() => picture.actions.onBlur()}
                />
              </Flex>
            </Flex>
          </Flex>
          <Flex mt={1} flex={1} gap={20} flexDirection="column">
            <FormControl.Field>
              <Label fontWeight={500} required>
                Space name
              </Label>
              <Input
                tabIndex={1}
                name="name"
                required
                placeholder="Enter name"
                wrapperStyle={{
                  height: 36,
                  borderRadius: 6,
                  backgroundColor: inputColor,
                }}
                defaultValue={name.state.value}
                error={name.computed.ifWasEverBlurredThenError}
                onChange={(e: any) => {
                  name.actions.onChange(e.target.value);
                  setWorkspaceState({ name: e.target.value });
                }}
                onFocus={() => name.actions.onFocus()}
                onBlur={(e: any) => {
                  name.actions.onBlur();
                }}
              />
            </FormControl.Field>
            <FormControl.Field>
              <Label fontWeight={500} adornment="optional">
                Description
              </Label>
              <Input
                tabIndex={1}
                name="description"
                fontWeight={400}
                fontSize={2}
                placeholder="Enter description"
                wrapperStyle={{
                  height: 36,
                  borderRadius: 6,
                  backgroundColor: inputColor,
                }}
                defaultValue={description.state.value}
                error={description.computed.ifWasEverBlurredThenError}
                onChange={(e: any) =>
                  description.actions.onChange(e.target.value)
                }
                onFocus={() => description.actions.onFocus()}
                onBlur={(e: any) => {
                  setWorkspaceState({
                    description: e.target.value,
                  });
                  description.actions.onBlur();
                }}
              />
            </FormControl.Field>
            <FormControl.Field>
              <Label mb={1} fontWeight={500} required>
                Access
              </Label>
              <RadioList
                customBg={windowColor}
                textColor={textColor}
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
                onClick={(value: AccessOptionType) => {
                  setAccessOption(value);
                  setWorkspaceState({
                    access: value,
                  });
                }}
              />
            </FormControl.Field>
            {/* <FormControl.FieldSet>
              <FormControl.Field>
                <Label>Emblem</Label>
                <Flex flex={1} alignItems="flex-start" position="relative">
                  <ColorTile
                    id="space-color-tile"
                    tileColor={color.state.value}
                    onClick={(evt: any) => {
                      setColorPickerOpen(!colorPickerOpen);
                    }}
                  />
                  <ColorTilePopover
                    id="space-color-tile-popover"
                    ref={colorPickerRef}
                    isOpen={colorPickerOpen}
                    data-is-open={colorPickerOpen}
                  >
                    <TwitterPicker
                      width="inherit"
                      className="cursor-style"
                      color={color.state.value}
                      onChange={(newColor: { hex: string }) => {
                        color.actions.onChange(newColor.hex);
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
                <FormControl.Field>
                  <Label>Space name</Label>
                  <Input
                    tabIndex={1}
                    name="name"
                    defaultValue={name.state.value}
                    wrapperStyle={{ height: 35, backgroundColor: inputColor }}
                    error={!name.computed.isDirty || name.computed.error}
                    onChange={(e: any) => name.actions.onChange(e.target.value)}
                    onFocus={() => name.actions.onFocus()}
                    onBlur={() => name.actions.onBlur()}
                  />
                </FormControl.Field>
                <Label>Avatar</Label>
                <Flex>
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
                    {picture.state.value &&
                    !picture.computed.ifWasEverBlurredThenError ? (
                      <img
                        src={picture.state.value}
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
                    name="picture"
                    placeholder="Paste image link here"
                    wrapperStyle={{ height: 35, backgroundColor: inputColor }}
                    value={picture.state.value}
                    // error={!avatar.computed.isDirty || avatar.computed.error}
                    onChange={(e: any) =>
                      picture.actions.onChange(e.target.value)
                    }
                    onFocus={() => picture.actions.onFocus()}
                    onBlur={() => picture.actions.onBlur()}
                  />
                </Flex>
              </FormControl.Field>

            </FormControl.FieldSet> */}
          </Flex>
        </Flex>
      </Grid.Column>
    );
  }
);
