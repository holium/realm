import { FC } from 'react'
import { Grid, Flex, ActionButton, Icons } from 'renderer/components'
import { DesktopActions } from 'renderer/logic/actions/desktop'
import { OnboardingActions } from 'renderer/logic/actions/onboarding'

export const OnboardingApp: FC = (props) => {
  return (
    <Grid.Column noGutter lg={12} xl={12} marginTop="20px">
      <Flex flexDirection={'column'} alignItems="center">
        <ActionButton
          tabIndex={-1}
          style={{marginBottom: 20}}
          height={36}
          data-close-tray="true"
          onClick={(evt: any) => {
            DesktopActions.openDialog('onboarding:disclaimer');
          }}
        >
          Open Onboarding
        </ActionButton>
        <ActionButton
          tabIndex={-1}
          height={36}
          data-close-tray="true"
          onClick={(evt: any) => {
            OnboardingActions.clear();
          }}
        >
          Clear Onboarding
        </ActionButton>
      </Flex>
    </Grid.Column>
  )
}
