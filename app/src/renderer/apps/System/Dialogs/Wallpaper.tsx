import { FC, useMemo, useState } from 'react';
import { observer } from 'mobx-react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  Button,
  Flex,
  FormControl,
  Grid,
  Label,
  Input,
  Text,
  TextButton,
  Spinner,
} from 'renderer/components';
import * as yup from 'yup';
import { DesktopActions } from 'renderer/logic/actions/desktop';
import { ShellActions } from 'renderer/logic/actions/shell';
import { useServices } from 'renderer/logic/store';
import { createField, createForm } from 'mobx-easy-form';
import { toJS } from 'mobx';
import { darken, lighten } from 'polished';
import { DialogConfig } from 'renderer/system/dialog/dialogs';

export const WallpaperDialogConfig: DialogConfig = {
  component: (props: any) => <WallpaperDialog {...props} />,
  onClose: () => {},
  window: {
    id: 'wallpaper-dialog',
    title: 'Wallpaper Dialog',
    zIndex: 13,
    type: 'dialog',
    dimensions: {
      x: 0,
      y: 0,
      width: 300,
      height: 300,
    },
  },
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

export const WallpaperDialog: FC = observer(() => {
  const { theme, spaces } = useServices();
  const [loading, setLoading] = useState(false);
  const { inputColor, windowColor } = theme.currentTheme;
  const { wallpaperForm, imageUrl } = useMemo(
    () => createWallpaperForm({ imageUrl: theme.currentTheme.wallpaper }),
    []
  );

  const onChange = (evt: any) => {
    const formData = wallpaperForm.actions.submit();
    setLoading(true);
    theme.setWallpaper(spaces.selected!.path!, formData.imageUrl).then(() => {
      ShellActions.closeDialog();
      ShellActions.setBlur(false);
      setLoading(false);
    });
  };

  return (
    <Flex
      flex={1}
      width="100%"
      height="100%"
      flexDirection="column"
      justifyContent="space-between"
    >
      <WallpaperPreview src={theme.currentTheme.wallpaper} />
      <FormControl.Field>
        <Input
          autoFocus
          tabIndex={0}
          name="imageUrl"
          wrapperStyle={{
            backgroundColor: inputColor,
          }}
          placeholder="https://my-image.google.com"
          defaultValue={imageUrl.state.value}
          error={!imageUrl.computed.isDirty || imageUrl.computed.error}
          onChange={(e: any) => imageUrl.actions.onChange(e.target.value)}
          onFocus={() => imageUrl.actions.onFocus()}
          onBlur={() => imageUrl.actions.onBlur()}
        />
        {imageUrl.computed.ifWasEverBlurredThenError &&
          imageUrl.computed.isDirty && (
            <FormControl.Error>{imageUrl.computed.error}</FormControl.Error>
          )}
      </FormControl.Field>

      <Flex justifyContent="space-between">
        <TextButton
          tabIndex={2}
          style={{ fontWeight: 400 }}
          highlightColor="#EC415A"
          textColor="#EC415A"
          onClick={() => {
            ShellActions.closeDialog();
            ShellActions.setBlur(false);
          }}
        >
          Close
        </TextButton>
        <TextButton
          tabIndex={1}
          style={{ fontWeight: 400 }}
          onClick={(evt: any) => onChange(evt)}
        >
          {loading ? <Spinner size={0} /> : 'Change'}
        </TextButton>
      </Flex>
    </Flex>
  );
});
