# How we do forms

## Input validation

We use Formik coupled with Yup for instant input field validation.

1. Wrap your form in a Formik component
2. Define your initial values and validation schema
3. Use the `FormField` component in this directory for inputs and pass in the `name` attribute
4. Pass the `errors` object from Formik to the `isError` prop of the `FormField` component, and disable the submit button if there are any errors
5. If you need to access `errors` or `values` deep down the component tree, you can use the `useFormikContext` hook

Check out `OnboardDialog.tsx` for an example, or the code below:

```tsx
import { Formik } from 'formik';

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email')
    .required('Required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Required'),
});

<Formik
  initialValues={{ email: '', password: '' }}
  validationSchema={validationSchema}
  onSubmit={(values) => {
    // The values object will look like this:
    // { email: 'foo', password: 'bar' }
  }}
>
  {({ errors }) => (
    <FormField
      type="email"
      name="email"
      isError={!!errors.email}
    />
    <FormField
      type="password"
      name="password"
      isError={!!errors.password}
    />
    <button disabled={Object.keys(errors).length > 0}>
      Submit
    </button>
  )}
</Formik>;
```

Note that `isError` simply highlights the field red, it does not display any error messages, as it should be obvious what the error is, and a label would make the form shift and look cluttered.

## Form submission

When all fields are valid, and the form response still returns an error, display the error message at the bottom of the form using the `ErrorBox` component.

```tsx
{error && <ErrorBox>{error}</ErrorBox>}
```
