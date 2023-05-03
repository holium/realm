import { ChangeEventHandler, useState } from 'react';

import { Box, Button } from '@holium/design-system/general';
import { TextInput } from '@holium/design-system/inputs';
import { useToggle } from '@holium/design-system/util';

type Props = {
  initialWallpaper: string;
  onSave: (src: string) => void;
};

export const CustomWallpaper = ({ initialWallpaper, onSave }: Props) => {
  const [src, setSrc] = useState(initialWallpaper);
  const error = useToggle(false);

  const onChange: ChangeEventHandler<HTMLInputElement> = (value) => {
    const src = value.target.value;
    setSrc(src);

    const valid = src.match(
      /(?:^|\s)((https?:\/\/)?(?:localhost|[\w-]+(?:\.[\w-]+)+)(:\d+)?(\/\S*)?)/
    );
    error.setToggle(!valid);
  };

  return (
    <TextInput
      id="customWallpaper"
      name="customWallpaper"
      type="text"
      placeholder="Paste url here"
      width="100%"
      background="rgba(var(--rlm-overlay-hover-rgba))"
      inputStyle={{
        background: 'transparent',
      }}
      value={src}
      error={error.isOn}
      onChange={onChange}
      rightAdornment={
        <Box>
          <Button.TextButton disabled={error.isOn} onClick={() => onSave(src)}>
            Save
          </Button.TextButton>
        </Box>
      }
    />
  );
};
