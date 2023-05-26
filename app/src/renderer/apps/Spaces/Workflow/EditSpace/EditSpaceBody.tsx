import { ChangeEvent, useState } from 'react';

import { Button, Flex, Icon, Text } from '@holium/design-system/general';
import { RadioGroup, RadioList, TextInput } from '@holium/design-system/inputs';
import { useToggle } from '@holium/design-system/util';
import { CreateSpaceInvitePayload } from '@holium/shared';

import { Crest, isImgUrl } from 'renderer/components/Crest';

import { EditSpaceColor } from './EditSpaceColor';
import { JoinLink } from './JoinLink';
import { spaceForm } from './spaceForm';
import {
  accessOptions,
  AccessOptionType,
  CrestOptionType,
  SpaceWorkFlowState,
} from './types';

type Props = {
  initialName: string;
  initialDescription: string;
  initialColor: string;
  initialImage: string;
  initialAccessOption: AccessOptionType;
  initialLink: string;
  isGroupSpace: boolean;
  joinLinkPayload?: CreateSpaceInvitePayload;
  updateState: (state: Partial<SpaceWorkFlowState>) => void;
};

export const EditSpaceBody = ({
  initialName,
  initialDescription,
  initialColor,
  initialImage,
  initialAccessOption,
  isGroupSpace,
  initialLink,
  joinLinkPayload,
  updateState,
}: Props) => {
  const invalidImg = useToggle(false);

  const [color, setColor] = useState(initialColor.replace('#', ''));
  const [image, setImage] = useState(initialImage);
  const [accessOption, setAccessOption] = useState(initialAccessOption);
  const [crestOption, setCrestOption] = useState<CrestOptionType>(
    initialImage ? 'image' : 'color'
  );

  const onClickColorOrImage = (newCrestOption: CrestOptionType) => {
    setCrestOption(newCrestOption);
    updateState({ crestOption: newCrestOption });
  };

  const onChangeSpaceDescription = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target as HTMLInputElement | null;
    if (!input) return;

    descriptionField.actions.onChange(input.value);
    updateState({ description: input.value });
  };

  const onChangeSpaceName = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target as HTMLInputElement | null;
    if (!input) return;

    nameField.actions.onChange(input.value);
    updateState({ name: input.value });
  };

  const onClickApplyImage = async () => {
    const newImage = (
      document.getElementById('space-image') as HTMLInputElement
    ).value;
    const isImage = await isImgUrl(newImage);

    if (isImage) {
      setImage(newImage);
      updateState({ picture: newImage });
      invalidImg.toggleOff();
    } else {
      invalidImg.toggleOn();
    }
  };

  const onClickAccessOption = (newAccessOption: string) => {
    setAccessOption(newAccessOption as AccessOptionType);
    updateState({ access: newAccessOption as AccessOptionType });
  };

  const { nameField, descriptionField } = spaceForm({
    name: initialName,
    description: initialDescription,
  });

  return (
    <Flex col width="100%" minHeight="100%" gap={16} overflow="auto">
      <Text.Custom fontSize={5} lineHeight="24px" fontWeight={500}>
        Edit details
      </Text.Custom>
      <Flex col width="100%" gap={16} justify="flex-start">
        <Flex row align="center" gap={16}>
          <Crest
            color={crestOption === 'color' ? `#${color}` : ''}
            picture={crestOption === 'image' ? image : ''}
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
                onClick={(value) =>
                  onClickColorOrImage(value as CrestOptionType)
                }
              />
              {invalidImg.isOn ? (
                <Text.Hint color="intent-alert">Invalid image</Text.Hint>
              ) : (
                <></>
              )}
            </Flex>

            <Flex
              flex={1}
              align="flex-start"
              position="relative"
              style={{
                display: crestOption === 'color' ? 'flex' : 'none',
              }}
            >
              <EditSpaceColor
                color={color}
                setColor={setColor}
                onValidChange={(color) => updateState({ color })}
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
                defaultValue={initialImage}
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
                rightAdornment={
                  <Button.TextButton onClick={onClickApplyImage}>
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
              onChange={onChangeSpaceName}
              onFocus={() => nameField.actions.onFocus()}
              onBlur={nameField.actions.onBlur}
              disabled={isGroupSpace}
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
              onChange={onChangeSpaceDescription}
              onFocus={descriptionField.actions.onFocus}
              onBlur={descriptionField.actions.onBlur}
            />
          </Flex>
          <Flex col>
            <Text.Label mb={1} fontWeight={500}>
              Access
            </Text.Label>
            <RadioList
              selected={accessOption}
              options={accessOptions}
              onClick={onClickAccessOption}
            />
          </Flex>
          {joinLinkPayload && (
            <Flex col>
              <Text.Label mb={1} fontWeight={500}>
                Join link
              </Text.Label>
              <JoinLink
                payload={joinLinkPayload}
                initialLink={initialLink}
                onGenerateLink={(joinLink) => updateState({ joinLink })}
              />
            </Flex>
          )}
        </Flex>
      </Flex>
    </Flex>
  );
};
