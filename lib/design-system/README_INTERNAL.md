# @holium/design-system

## Dev setup

```
yarn
yarn storybook
```

## Directory structure

```
/src

  /general - multipurpose components
    /index.ts - exports general components

  /input - input components
    /index.ts - exports input components

  /os - core realm components
    /index.ts - exports os components

  /util - internal helpers

  index.ts - exports all components

general.ts - exports all general components

input.ts - exports all input components

os.ts - exports all os components

util.ts - exports all util components
```

## Component structure

```
/Component
  /Component.tsx - component
  /Component.stories.tsx - storybook stories
```

## Publishing

Remove `postinstall: preconstruct dev` before publishing to npmjs.com.
