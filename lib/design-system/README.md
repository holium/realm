# @holium/design-system

## Dev setup

```
yarn
yarn storybook
```

## Directory structure

```
/general - multipurpose components
  /index.ts - exports general components

/input - input components
  /index.ts - exports input components

/os - core realm components
  /index.ts - exports os components

/util - internal helpers

index.ts - exports all components
```

## Component structure

```
/Component
  /Component.tsx - component
  /Component.stories.tsx - storybook stories
```

### Publishing

remove `postinstall: preconstruct dev` before publishing to NPM.
