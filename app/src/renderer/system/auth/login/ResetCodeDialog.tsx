import { useState } from 'react';
import { observer } from 'mobx-react';
import { useField, useForm } from 'mobx-easy-form';
import * as yup from 'yup';
import { Flex, Text, Button, Icon, TextInput } from '@holium/design-system';
import { Spinner } from 'renderer/components';
import { useToggle } from 'renderer/logic/lib/useToggle';
import { DialogConfig } from 'renderer/system/dialog/dialogs';
import { normalizeBounds } from 'os/services/shell/lib/window-manager';
import { ShellActions } from 'renderer/logic/actions/shell';
import { AuthActions } from 'renderer/logic/actions/auth';

export const ResetCodeDialogConfig: (dialogProps: any) => DialogConfig = (
  dialogProps: any
) => ({
  component: () => (
    <ResetCodeDialog ship={dialogProps.ship} password={dialogProps.password} />
  ),
  onClose: () => {
    ShellActions.closeDialog();
  },
  getWindowProps: (desktopDimensions) => ({
    appId: 'reset-code-dialog',
    title: 'Reset Code',
    zIndex: 13,
    type: 'dialog',
    bounds: normalizeBounds(
      {
        x: 0,
        y: 0,
        width: 400,
        height: 170,
      },
      desktopDimensions
    ),
  }),
  hasCloseButton: true,
  noTitlebar: false,
  draggable: false,
});

type ResetCodeProps = {
  ship: string;
  password: string;
};

const ResetCodeDialogPresenter = ({ ship, password }: ResetCodeProps) => {
  const showAccessKey = useToggle(false);
  const [saveShipCodeResult, setSaveShipCodeResult] = useState('');
  const [savingShipCode, setSavingShipCode] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const shipForm = useForm({
    onSubmit: async ({ values }: any) => {
      try {
        setSavingShipCode(true);
        const result = await AuthActions.updateShipCode(
          ship,
          // @ts-ignore
          password,
          // @ts-ignore
          values.code
        );

        setSaveShipCodeResult(result);
        if (result === 'success') {
          accessKey.actions.onChange('');
          ShellActions.closeDialog();
          setSavingShipCode(false);
        }
      } catch (reason: any) {
        setErrorMessage('Error updating ship code.');
      } finally {
        setSavingShipCode(false);
      }
    },
  });

  const accessKey = useField({
    id: 'code',
    form: shipForm,
    initialValue: '',
    validationSchema: yup
      .string()
      .matches(
        /[a-z][a-z-]{5}-[a-z][a-z-]{5}-[a-z][a-z-]{5}-[a-z][a-z-]{5}$/,
        'Access key not in correct format'
      )
      .required('Please enter access key'),
  });

  return (
    <Flex flexDirection="column" width="100%" alignItems="center">
      <Text.Custom
        initial={{ opacity: 0 }}
        exit={{ opacity: 1 }}
        mb="16px"
        animate={{
          opacity: 1,
        }}
        transition={{
          opacity: { duration: 1, ease: 'easeOut' },
        }}
        fontWeight={500}
        fontSize={18}
        textAlign="left"
        width="100%"
      >
        Ship code error
      </Text.Custom>
      <Text.Custom
        mt="1px"
        mb="16px"
        initial={{ opacity: 0 }}
        exit={{ opacity: 1 }}
        animate={{
          opacity: 0.7,
        }}
        transition={{
          opacity: { duration: 1, ease: 'easeOut' },
        }}
        textAlign="left"
        fontWeight={400}
        fontSize={14}
      >
        Has your ship code changed? If so, enter the new code below and click
        Save.
      </Text.Custom>
      <TextInput
        ml={2}
        mr={2}
        id="onboarding-access-key"
        paddingLeft={2}
        name="code"
        placeholder="sample-micsev-bacmug-moldex"
        value={accessKey.state.value}
        autoFocus
        autoCapitalize="false"
        autoCorrect="false"
        spellCheck="false"
        type={showAccessKey.isOn ? 'text' : 'password'}
        width="100%"
        error={
          accessKey.computed.ifWasEverBlurredThenError &&
          accessKey.computed.isDirty &&
          accessKey.computed.error
        }
        onChange={(e: any) => {
          accessKey.actions.onChange(e.target.value);
        }}
        onFocus={() => accessKey.actions.onFocus()}
        onBlur={() => accessKey.actions.onBlur()}
        rightAdornment={
          <Flex flexDirection={'row'} height={32} alignItems={'center'}>
            {saveShipCodeResult === 'success' && (
              <Icon
                mr={1}
                name={'CheckCircle'}
                opacity={1}
                size={18}
                color={'intent-success'}
              />
            )}
            <Button.IconButton onClick={showAccessKey.toggle}>
              <Icon
                name={showAccessKey.isOn ? 'EyeOff' : 'EyeOn'}
                opacity={0.5}
                size={18}
              />
            </Button.IconButton>
            <Button.TextButton
              marginLeft={1}
              onClick={() => {
                if (shipForm.computed.isValid) shipForm.actions.submit();
              }}
            >
              {(savingShipCode && (
                <Flex
                  justifyContent="center"
                  alignItems="center"
                  width={24}
                  height={24}
                >
                  <Spinner size={0} />
                </Flex>
              )) ||
                'Save'}
            </Button.TextButton>
          </Flex>
        }
      />
      {errorMessage !== '' && (
        <Text.Custom mt={1} fontSize={14} color="intent-alert">
          {errorMessage}
        </Text.Custom>
      )}
    </Flex>
  );
};

export const ResetCodeDialog = observer(ResetCodeDialogPresenter);
