# Frontend Style Guide

Most of Realm's frontend style is automatically enforced by ESLint. This document is meant to be a reference for the few things that are not automatically enforced.

## Component Naming

Component names should be in pascal case. The component name, file name, and folder name (if applicable), should match. For example, a component named `MyComponent` should reside in `MyComponent/MyComponent.tsx`. Avoid calling a component `index.tsx` since it is not clear what the component is and makes it harder to find.

## Component Exports

Avoid default exports as they lead to poor discoverability and makes it harder to refactor. Instead, use named exports:

```tsx
export const MyComponent = () => { ... };
```

## Component Wrapping

When wrapping a component, make sure to name the wrapped component:

```tsx
const MyComponentPresenter = () => { ... };

export const MyComponent = observer(MyComponentPresenter);
```

This makes sure `eslint-plugin-react-hooks` correctly identifies the component as a React component and will lint its hooks correctly. We use the `Presenter` suffix to indicate that the component is unwrapped and should not be used directly.
