import { ChangeEvent, useState } from 'react';
import { observer } from 'mobx-react';
import {
  Flex,
  Text,
  Button,
  FormControl,
  TextInput,
} from '@holium/design-system';
import { useField, useForm } from 'mobx-easy-form';
import { WalletActions } from 'renderer/logic/actions/wallet';
import { NetworkType } from 'os/services/tray/wallet-lib/wallet.model';

interface CreateWalletProps {
  network: NetworkType;
}

export const CreateWallet = observer((props: CreateWalletProps) => {
  const [loading, setLoading] = useState(false);
  const form = useForm({
    async onSubmit({ values }) {
      if (form.computed.isDirty) {
        setLoading(true);
        try {
          console.log(`creating wallet ${values.nickname}`);
          await WalletActions.createWallet(values.nickname);
          setLoading(false);
        } catch (reason) {
          console.error(reason);
          setLoading(false);
        }
      }
    },
  });

  const nickname = useField({
    id: 'nickname',
    form,
    initialValue: '',
    validate: (nickname: string) => {
      return nickname.length
        ? { parsed: nickname }
        : { error: 'Must enter nickname.' };
    },
  });

  return (
    <Flex p={1} height="100%" width="100%" flexDirection="column">
      <Text.H4 mt={2} variant="h4">
        Create Address
      </Text.H4>
      <Text.Body mt={3} variant="body">
        A new {props.network === 'ethereum' ? 'Ethereum' : 'Bitcoin'} address
        will be created. Give it a memorable nickname.
      </Text.Body>
      <FormControl.FieldSet mt={8}>
        <FormControl.Field>
          <Text.Label mb={1} required={true}>
            Nickname
          </Text.Label>
          <TextInput
            id="wallet-nickname"
            name="wallet-nickname"
            value={nickname.state.value}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              nickname.actions.onChange(e.target.value)
            }
            placeholder="Fort Knox"
          />
        </FormControl.Field>
        <Flex mt={5} width="100%">
          <Button.TextButton
            id="submit"
            width="100%"
            isLoading={loading}
            disabled={!form.computed.isValid}
            onClick={form.actions.submit}
          >
            Create
          </Button.TextButton>
        </Flex>
      </FormControl.FieldSet>
    </Flex>
  );
});
