import { createField, createForm } from 'mobx-easy-form';
import * as yup from 'yup';

type SpaceForm = {
  name: string;
  description: string;
};

export const spaceForm = ({ name, description }: SpaceForm) => {
  const spaceForm = createForm({
    onSubmit({ values }) {
      return values;
    },
  });

  const nameField = createField({
    id: 'name',
    form: spaceForm,
    initialValue: name,
    validationSchema: yup.string().required('title is required'),
  });
  const descriptionField = createField({
    id: 'description',
    form: spaceForm,
    initialValue: description,
  });

  return {
    nameField,
    descriptionField,
  };
};
