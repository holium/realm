import { FC, useMemo } from 'react';
import { isValidPatp } from 'urbit-ob';
import { createField, createForm } from 'mobx-easy-form';
import * as yup from 'yup';
import {
  Grid,
  Input,
  Label,
  FormControl,
  ActionButton,
  Icons,
  Box,
  Spinner,
  Flex,
  TextButton,
} from '../../../../components';
// @ts-expect-error its there...
import UrbitSVG from '../../../../../../assets/urbit.svg';
import { observer } from 'mobx-react';
import { useAuth } from '../../../../logic/store';

export const createShipForm = (
  defaults: any = {
    urbitId: '',
    shipUrl: '',
    accessKey: '',
  },
  addedShips: string[]
) => {
  const shipForm = createForm({
    onSubmit({ values }) {
      return values;
    },
  });

  const urbitId = createField({
    id: 'urbit-id',
    form: shipForm,
    initialValue: defaults.urbitId || '',
    // validationSchema: yup.string().required('Name is required'),
    validate: (patp: string) => {
      if (addedShips.includes(patp)) {
        return { error: 'Already added', parsed: undefined };
      }

      if (patp.length > 1 && isValidPatp(patp)) {
        return { error: undefined, parsed: patp };
      }

      return { error: 'Invalid patp', parsed: undefined };
    },
  });
  const shipUrl = createField({
    id: 'ship-id',
    form: shipForm,
    initialValue: defaults.shipUrl || '',
    validationSchema: yup
      .string()
      .matches(
        /(?:^|\s)((https?:\/\/)?(?:localhost|[\w-]+(?:\.[\w-]+)+)(:\d+)?(\/\S*)?)/,
        // /((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
        'Enter correct url'
      )
      .required('Please enter url'),
  });
  const accessKey = createField({
    id: 'access-key',
    form: shipForm,
    initialValue: defaults.accessKey || '',
    validationSchema: yup
      .string()
      .matches(
        /[a-z][a-z-]{5}-[a-z][a-z-]{5}-[a-z][a-z-]{5}-[a-z][a-z-]{5}$/,
        'Enter correct access key'
      )
      .required('Please enter access key required'),
  });
  return {
    shipForm,
    urbitId,
    shipUrl,
    accessKey,
  };
};

type AddShipProps = {
  hasShips?: boolean;
  // urbitId: any;
  // shipUrl: any;
  // accessKey: any;
  next: () => void;
  // isValid: boolean;
  // setValid: (isValid: boolean) => void;
};

export const AddShip: FC<AddShipProps> = observer((props: AddShipProps) => {
  const { next } = props;
  const { signupStore, authStore } = useAuth();
  const { shipForm, urbitId, shipUrl, accessKey } = useMemo(
    () =>
      createShipForm(
        undefined,
        Array.from(authStore.ships.values()).map((ship: any) => ship.patp)
      ),
    []
  );
  // const { shipStore } = useMst();
  // const { urbitId, shipUrl, accessKey } = props;
  const isNextDisabled = !shipForm.computed.isValid;
  return (
    <Grid.Row expand noGutter>
      <Grid.Column
        noGutter
        expand
        mt={2}
        lg={5}
        xl={5}
        align="center"
        justify="center"
      >
        <img src={UrbitSVG} alt="urbit logo" />
        <ActionButton
          tabIndex={-1}
          mt={5}
          height={32}
          rightContent={<Icons ml={2} size={1} name="ArrowRightLine" />}
        >
          Get Urbit ID
        </ActionButton>
      </Grid.Column>

      <Grid.Column noGutter lg={7} xl={7}>
        <Grid.Column noGutter gap={12}>
          <Grid.Column mt={3} noGutter>
            <FormControl.FieldSet>
              <FormControl.Field>
                <Label>Urbit ID</Label>
                <Input
                  tabIndex={1}
                  name="urbit-id"
                  placeholder="~sampel-palnet"
                  defaultValue={urbitId.state.value}
                  error={!urbitId.computed.isDirty || urbitId.computed.error}
                  onChange={(e: any) =>
                    urbitId.actions.onChange(e.target.value)
                  }
                  onFocus={() => urbitId.actions.onFocus()}
                  onBlur={() => urbitId.actions.onBlur()}
                />
                {urbitId.computed.ifWasEverBlurredThenError &&
                  urbitId.computed.isDirty && (
                    <FormControl.Error>
                      {urbitId.computed.error}
                    </FormControl.Error>
                  )}
              </FormControl.Field>
              <FormControl.Field>
                <Label>URL</Label>
                <Input
                  tabIndex={2}
                  name="ship-url"
                  placeholder="https://my-ship.host.com"
                  defaultValue={shipUrl.state.value}
                  error={!shipUrl.computed.isDirty || shipUrl.computed.error}
                  onChange={(e: any) =>
                    shipUrl.actions.onChange(e.target.value)
                  }
                  onFocus={() => shipUrl.actions.onFocus()}
                  onBlur={() => shipUrl.actions.onBlur()}
                />
                {shipUrl.computed.ifWasEverBlurredThenError &&
                  shipUrl.computed.isDirty && (
                    <FormControl.Error>
                      {shipUrl.computed.error}
                    </FormControl.Error>
                  )}
              </FormControl.Field>
              <FormControl.Field>
                <Label>Access key</Label>
                <Input
                  tabIndex={3}
                  name="access-key"
                  placeholder="sample-micsev-bacmug-moldex"
                  defaultValue={accessKey.state.value}
                  error={
                    !accessKey.computed.isDirty || accessKey.computed.error
                  }
                  onChange={(e: any) =>
                    accessKey.actions.onChange(e.target.value)
                  }
                  onFocus={() => accessKey.actions.onFocus()}
                  onBlur={() => accessKey.actions.onBlur()}
                />
                {accessKey.computed.ifWasEverBlurredThenError &&
                  accessKey.computed.isDirty && (
                    <FormControl.Error>
                      {accessKey.computed.error}
                    </FormControl.Error>
                  )}
              </FormControl.Field>
            </FormControl.FieldSet>
          </Grid.Column>
        </Grid.Column>
      </Grid.Column>
      <Box position="absolute" height={40} bottom={20} right={24}>
        <Flex
          mt={5}
          width="100%"
          alignItems="center"
          justifyContent="space-between"
        >
          <TextButton
            disabled={isNextDisabled}
            // loading={authStore.isLoading}
            onClick={(evt: any) => {
              const formData = shipForm.actions.submit();
              signupStore
                .addShip({
                  ship: formData['urbit-id'],
                  url: formData['ship-id'],
                  code: formData['access-key'],
                })
                .then(() => {
                  console.log('before next');
                  // eslint-disable-next-line promise/no-callback-in-promise
                  next();
                  evt.target.blur();
                  return null;
                })
                .catch((reason: any) => {
                  console.log(reason);
                });
            }}
          >
            {authStore.isLoading || signupStore.isLoading ? (
              <Spinner size={0} />
            ) : (
              'Next'
            )}
          </TextButton>
        </Flex>
      </Box>
    </Grid.Row>
  );
});

export default AddShip;
