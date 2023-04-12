# @holium/design-system

## Dev setup

```
yarn
yarn storybook
```

## Directory structure

```
/src
  /blocks
  /general
  /input
  /navigation
  /os
  /util
  index.ts    (@holium/design-system)

blocks.ts     (@holium/design-system/blocks)
general.ts    (@holium/design-system/general)
input.ts      (@holium/design-system/input)
navigation.ts (@holium/design-system/navigation)
os.ts         (@holium/design-system/os)
util.ts       (@holium/design-system/util)
```

## Component structure

```
/Component
  /Component.tsx - component
  /Component.stories.tsx - storybook stories
```

## Publishing

Remove `postinstall: preconstruct dev` before publishing to npmjs.com.
