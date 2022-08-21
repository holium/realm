import { FC } from 'react';
import styled from 'styled-components';
import { rgba, darken } from 'polished';
import { Flex, Icons, Text } from 'renderer/components';
import { ThemeType } from 'renderer/theme';
import { useTrayApps } from 'renderer/apps/store';
import { observer } from 'mobx-react';
import { useServices } from 'renderer/logic/store';

type CommCircleProps = {
  customBg: string;
  theme: ThemeType;
};

const ProviderStyle = styled(Flex)<CommCircleProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0px 10px 0px 8px;
  height: 24px;
  border-radius: 12px;
  gap: 6px;
  background: ${(props: CommCircleProps) => darken(0.03, props.customBg)};
  transition: ${(props: CommCircleProps) => props.theme.transition};
  &:hover {
    background: ${(props: CommCircleProps) => darken(0.04, props.customBg)};
    transition: ${(props: CommCircleProps) => props.theme.transition};
  }
`;

interface ProviderSelectorProps {
  connected?: boolean;
  seedColor: string;
  onClick: (evt: any) => void;
}

export const ProviderSelector: FC<ProviderSelectorProps> = observer(
  ({ seedColor, onClick }: ProviderSelectorProps) => {
    const { desktop } = useServices();
    const { windowColor, textColor } = desktop.theme;
    const { roomsApp } = useTrayApps();
    // const accentColor = '#F08735';
    return (
      <ProviderStyle
        customBg={windowColor}
        onClick={(evt: any) => onClick(evt)}
      >
        <Icons size={18} fill={rgba(textColor, 0.7)} name="BaseStation" />
        <Text fontSize={1} color={rgba(textColor, 0.7)}>
          {roomsApp.provider}
        </Text>
      </ProviderStyle>
    );
  }
);
