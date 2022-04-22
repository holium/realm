import { FC } from 'react';
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
} from '../../../../components';
// @ts-expect-error its there...
import UrbitSVG from '../../../../../../assets/urbit.svg';

export const createShipForm = (
  defaults: any = {
    urbitId: '~labruc-dillyx-lomder-librun',
    shipUrl: 'https://test-moon-1.holium.network',
    accessKey: 'mapfel-dalmec-halfen-sorhes',
  }
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
        /((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
        'Enter correct url!'
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
  urbitId: any;
  shipUrl: any;
  accessKey: any;
  // isValid: boolean;
  // setValid: (isValid: boolean) => void;
};

export const AddShip: FC<AddShipProps> = (props: AddShipProps) => {
  // const { shipStore } = useMst();
  const { urbitId, shipUrl, accessKey } = props;
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
              </FormControl.Field>
            </FormControl.FieldSet>
          </Grid.Column>
        </Grid.Column>
      </Grid.Column>
    </Grid.Row>
  );
};

export default AddShip;
