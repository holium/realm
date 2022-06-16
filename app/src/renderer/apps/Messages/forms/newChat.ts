import { createField, createForm } from 'mobx-easy-form';
import { isValidPatp } from 'urbit-ob';

export const createNewChatForm = (
  defaults: any = {
    urbitId: '',
  }
) => {
  const newChatForm = createForm({
    onSubmit({ values }) {
      return values;
    },
  });

  const urbitId = createField({
    id: 'urbit-id',
    form: newChatForm,
    initialValue: defaults.urbitId || '',
    validate: (patp: string) => {
      // if (addedShips.includes(patp)) {
      //   return { error: 'Already added', parsed: undefined };
      // }

      if (patp.length > 1 && isValidPatp(patp)) {
        return { error: undefined, parsed: patp };
      }

      return { error: 'Invalid patp', parsed: undefined };
    },
  });
  return {
    newChatForm,
    urbitId,
  };
};
