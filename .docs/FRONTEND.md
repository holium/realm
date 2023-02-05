# Frontend Style Guide

Most of Realm's frontend style is automatically enforced by ESLint. This document is meant to be a reference for the few things that are not automatically enforced.

## Component Naming

Component names should be in pascal case. The component name, file name, and folder name (if applicable), should match. For example, a component named `MyComponent` should reside in `MyComponent/MyComponent.tsx`. Avoid calling a component `index.tsx` since it is not clear what the component is and makes it harder to find.

## Component Exports

Avoid default exports as they lead to poor discoverability and makes it harder to refactor. Instead, use named exports:

```tsx
export const MyComponent = () => { ... };
```

## Component Props

Props should be destructured in the component signature:

```tsx
const MyComponent = ({ prop1, prop2 = 'default', ...rest }: Props) => {};
```

Avoid using the `FC` type as it bloats the component signature and is discouraged by [Big Brother](https://github.com/facebook/create-react-app/pull/8177) themselves. Also avoid `defaultProps` as it is deprecated. Instead, use default parameters as shown above.

## Component Wrapping

When wrapping a component, make sure to name the wrapped component:

```tsx
const MyComponentPresenter = () => { ... };

export const MyComponent = observer(MyComponentPresenter);
```

This makes sure `eslint-plugin-react-hooks` identifies the React component and will lint its hooks correctly. We use the `Presenter` suffix to indicate that the component is unwrapped and should not be used directly.
