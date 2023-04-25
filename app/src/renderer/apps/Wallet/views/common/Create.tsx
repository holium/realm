import { ChangeEvent, useState } from 'react';
import { Button, Flex, Text, TextInput } from '@holium/design-system';
import { useField, useForm } from 'mobx-easy-form';
import { observer } from 'mobx-react';
import { NetworkType } from 'renderer/stores/models/wallet.model';
import { useShipStore } from 'renderer/stores/ship.store';

interface CreateWalletProps {
  network: NetworkType;
}

export const CreateWallet = observer((props: CreateWalletProps) => {
  const { walletStore } = useShipStore();
  const [loading, setLoading] = useState(false);
  const form = useForm({
    async onSubmit({ values }) {
      if (form.computed.isDirty) {
        setLoading(true);
        try {
          console.log(`creating wallet ${values.nickname}`);
          await walletStore.createWallet(values.nickname);
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
    <Flex p={1} height="100%" width="100%" flexDirection="column" gap={20}>
      <Text.H4 mt={2} variant="h4">
        Create Address
      </Text.H4>
      <Text.Body mt={3} variant="body">
        A new {props.network === 'ethereum' ? 'Ethereum' : 'Bitcoin'} address
        will be created. Give it a memorable nickname.
      </Text.Body>
      {/*<FormControl.FieldSet mt={8}>
        <FormControl.Field>*/}
      <Flex flexDirection="column" gap={10}>
        <Text.Label mb={1}>Nickname</Text.Label>
        <TextInput
          id="wallet-nickname"
          name="wallet-nickname"
          value={nickname.state.value}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            nickname.actions.onChange(e.target.value)
          }
          placeholder="Fort Knox"
        />
      </Flex>
      {/*</FormControl.Field>*/}
      <Flex width="100%">
        <Button.TextButton
          id="submit"
          width="100%"
          onClick={form.actions.submit}
        >
          Create
        </Button.TextButton>
      </Flex>
      {/*</Flex></FormControl.FieldSet>*/}
    </Flex>
  );
});
