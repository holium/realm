import { useMemo, useState } from 'react';
import { observer } from 'mobx-react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Text, Flex, Spinner, TextInput, Button } from '@holium/design-system';
import * as yup from 'yup';
import { createField, createForm } from 'mobx-easy-form';
import { DialogConfig } from 'renderer/system/dialog/dialogs';
import { useAppState } from 'renderer/stores/app.store';
import { useShipStore } from 'renderer/stores/ship.store';
import { normalizeBounds } from 'renderer/lib/window-manager';
import { Theme } from 'renderer/stores/models/theme.model';

export const WallpaperDialogConfig: DialogConfig = {
  component: (props: any) => <WallpaperDialog {...props} />,
  onClose: () => {},
  getWindowProps: (desktopDimensions) => ({
    appId: 'wallpaper-dialog',
    title: 'Wallpaper Dialog',
    zIndex: 13,
    type: 'dialog',
    bounds: normalizeBounds(
      {
        x: 0,
        y: 0,
        width: 300,
        height: 300,
      },
      desktopDimensions
    ),
  }),
  hasCloseButton: false,
  noTitlebar: true,
};

const WallpaperPreview = styled(motion.img)`
  height: 150px;
  border-radius: 6px;
  transition: all 0.25s ease;
`;

const createWallpaperForm = (
  defaults: any = {
    imageUrl: '',
  }
) => {
  const wallpaperForm = createForm({
    onSubmit({ values }) {
      return values;
    },
  });

  const imageUrl = createField({
    id: 'imageUrl',
    form: wallpaperForm,
    initialValue: defaults.imageUrl || '',
    validationSchema: yup
      .string()
      .matches(
        /(?:^|\s)((https?:\/\/)?(?:localhost|[\w-]+(?:\.[\w-]+)+)(:\d+)?(\/\S*)?)/,
        'Enter correct url'
      )
      .required('Please enter url'),
  });

  return {
    wallpaperForm,
    imageUrl,
  };
};

const WallpaperDialogPresenter = () => {
  const { shellStore, theme } = useAppState();
  const { spacesStore } = useShipStore();
  const [loading, setLoading] = useState(false);
  const { wallpaperForm, imageUrl } = useMemo(
    () => createWallpaperForm({ imageUrl: theme.wallpaper }),
    []
  );

  const closeDialog = () => {
    shellStore.closeDialog();
    shellStore.setIsBlurred(false);
  };

  // TODO prevent changing wallpaper if you are not admin of the space
  const onChange = async () => {
    if (!spacesStore.selected?.path) return;
    setLoading(true);
    const formData = wallpaperForm.actions.submit();
    // setLoading(true);
    const newTheme = await theme.setWallpaper(formData.imageUrl);
    const currentSpace = spacesStore.selected;
    try {
      await currentSpace.setTheme(newTheme);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }

    closeDialog();
  };

  return (
    <Flex
      flex={1}
      width="100%"
      height="100%"
      flexDirection="column"
      justifyContent="space-between"
    >
      <WallpaperPreview src={theme.wallpaper} />
      <TextInput
        autoFocus
        tabIndex={0}
        id="imageUrl"
        name="imageUrl"
        placeholder="https://my-image.google.com"
        defaultValue={imageUrl.state.value}
        error={
          (imageUrl.computed.ifWasEverBlurredThenError &&
            imageUrl.computed.isDirty) ||
          imageUrl.computed.error
        }
        onChange={(e: any) => imageUrl.actions.onChange(e.target.value)}
        onFocus={() => imageUrl.actions.onFocus()}
        onBlur={() => imageUrl.actions.onBlur()}
      />
      {imageUrl.computed.ifWasEverBlurredThenError &&
        imageUrl.computed.isDirty && (
          <Text.Hint color="intent-alert">{imageUrl.computed.error}</Text.Hint>
        )}

      <Flex justifyContent="space-between">
        <Button.Secondary
          tabIndex={2}
          style={{ fontWeight: 400 }}
          onClick={closeDialog}
        >
          Close
        </Button.Secondary>
        <Button.TextButton
          tabIndex={1}
          style={{ fontWeight: 400 }}
          onClick={onChange}
        >
          {loading ? <Spinner size={0} /> : 'Change'}
        </Button.TextButton>
      </Flex>
    </Flex>
  );
};

const WallpaperDialog = observer(WallpaperDialogPresenter);
