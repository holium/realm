import { FormEventHandler, useState } from 'react';

import {
  Button,
  ErrorBox,
  Spinner,
  SuccessBox,
} from '@holium/design-system/general';
import { TextInput } from '@holium/design-system/inputs';
import { useToggle } from '@holium/design-system/util';

type Props = {
  onClickJoinWaitlist: (email: string) => Promise<boolean>;
};

export const JoinWaitlist = ({ onClickJoinWaitlist }: Props) => {
  const [email, setEmail] = useState('');

  const error = useToggle(false);
  const success = useToggle(false);
  const loading = useToggle(false);

  const handleClickJoinWaitlist = async () => {
    loading.toggleOn();

    error.toggleOff();
    success.toggleOff();

    if (!email) return;

    const result = await onClickJoinWaitlist(email);

    if (result) {
      success.toggleOn();
    } else {
      error.toggleOn();
    }

    loading.toggleOff();
  };

  const onSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <form
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
      onSubmit={onSubmit}
    >
      <TextInput
        id="waitlist-email"
        name="waitlist-email"
        type="email"
        placeholder="Enter email"
        width="100%"
        style={{ boxSizing: 'border-box' }}
        value={email}
        onChange={(e) => setEmail((e.target as any).value)}
        rightAdornment={
          <Button.TextButton
            disabled={loading.isOn}
            onClick={handleClickJoinWaitlist}
          >
            {loading.isOn ? <Spinner size={0} /> : 'Join waitlist'}
          </Button.TextButton>
        }
      />
      {error.isOn && <ErrorBox>Something went wrong</ErrorBox>}
      {success.isOn && (
        <SuccessBox>Successfully added {email} to the waitlist</SuccessBox>
      )}
    </form>
  );
};
