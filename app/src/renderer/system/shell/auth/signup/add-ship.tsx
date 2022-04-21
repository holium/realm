import { FC } from 'react';

import { Grid, Input, Label, FormControl } from '../../../../components';

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
                onChange={(e: any) => urbitId.actions.onChange(e.target.value)}
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
                onChange={(e: any) => shipUrl.actions.onChange(e.target.value)}
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
                error={!accessKey.computed.isDirty || accessKey.computed.error}
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
  );
};

export default AddShip;
