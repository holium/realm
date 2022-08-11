import { FC, MouseEvent, useEffect, useMemo } from 'react';
import { observer } from 'mobx-react';
import { rgba, darken } from 'polished';
import {
  Flex,
  SpacePicture,
  Input,
  Icons,
  IconButton,
} from 'renderer/components';
import { SpaceModelType } from 'os/services/spaces/models/spaces';
import { ThemeModelType } from 'os/services/spaces/models/theme';

type SpaceTitlebarProps = {
  space: SpaceModelType;
  membersCount: number;
  theme: ThemeModelType;
  onMemberClick: (evt: MouseEvent) => void;
};

export const SpaceTitlebar: FC<SpaceTitlebarProps> = observer(
  (props: SpaceTitlebarProps) => {
    const { space, membersCount, theme, onMemberClick } = props;

    const iconHoverColor = useMemo(
      () => rgba(darken(0.03, theme.iconColor), 0.1),
      [theme.windowColor]
    );

    return (
      <Flex width="100%">
        <Flex flex={1}>
          <SpacePicture
            size={40}
            membersCount={membersCount}
            space={space}
            textColor={theme.textColor}
          />
        </Flex>
        <Flex alignItems="center" gap={12}>
          <Input
            className="realm-cursor-text-cursor"
            type="text"
            placeholder="Search for apps..."
            bgOpacity={0.3}
            borderColor={'input.borderHover'}
            bg="bg.blendedBg"
            wrapperStyle={{
              borderRadius: 25,
              height: 40,
              width: 336,
              paddingLeft: 12,
              paddingRight: 16,
            }}
            rightIcon={
              <Flex>
                <Icons name="Search" size="18px" opacity={0.5} />
              </Flex>
            }
          />
          <Flex flex={1} justifyContent="flex-end">
            <IconButton
              size={3}
              customBg={iconHoverColor}
              color={theme.iconColor}
              onClick={onMemberClick}
            >
              <Icons name="Members" size="22px" />
            </IconButton>
          </Flex>
        </Flex>
      </Flex>
    );
  }
);
