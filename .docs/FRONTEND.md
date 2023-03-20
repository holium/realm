# Frontend Style Guide

This document is meant to be a reference for frontend style principles that are not automatically enforced by ESLint in the Realm monorepo.

## Component Naming

Component names should be in pascal case. The component name, file name, and folder name (if applicable), should match. For example, a component named `MyComponent` should reside in `MyComponent/MyComponent.tsx`. Avoid calling a component `index.tsx` since it is not clear what the component is and makes it harder to find.

## Component Exports

Exports should be named:

```tsx
export const MyComponent = () => { ... };
```

Avoid default exports as they lead to poor discoverability and makes it harder to refactor.

## Component Props

Props should be destructured in the component signature:

```tsx
const MyComponent = ({ prop1, prop2 = 'default', ...rest }: Props) => {};
```

Avoid using the `FC` type as it bloats the signature and is discouraged by [Big Brother](https://github.com/facebook/create-react-app/pull/8177) themselves. Also avoid `defaultProps` as it is deprecated. Instead, use default parameters as shown above.

## Component Wrapping

Components should be named before being wrapped:

```tsx
const MyComponentPresenter = () => { ... };

export const MyComponent = observer(MyComponentPresenter);
```

This makes sure `eslint-plugin-react-hooks` identifies the React component and will lint its hooks correctly. We use the `Presenter` suffix to indicate that the component is unwrapped and should not be used directly.

## Component Null Checks

Any nullable value that is critical to the component should be null checked before being used:

```tsx
const MyComponent = ({ prop }: { prop: string | null }) => {
  if (!prop) return null;

  return <div>{prop}</div>;
};
```

Note that the component might need to broken down into smaller components to achieve this without calling hooks conditionally.

Alternatively, if a nullable value is not critical to the component, it can be defaulted to a placeholder value (e.g. `''` or `[]`).

Avoid using `!` to assert that a value is not null as it will cause a runtime error if the value is null.
