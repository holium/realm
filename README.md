# Holium Realm

A desktop environment for Urbit.

## Directory structure

We use yarn workspace to manage the multiple modules.

```
- app/ - the Realm desktop client
- onboarding/ – the web onboarding flow
- shared/ - shared code in the monorepo
- lib/ - outwards facing packages that are published to npmjs.com
  - conduit/ – SSE event handler
  - design-system/ – component library for Realm apps
  - presence/ – cursor streaming for Realm apps
  - room/ – data streaming for Realm apps
```

## Getting started

We use yarn workspaces to build all packages for Realm.

```zsh
# Install dependencies and build all packages
yarn
# Note: you may have to rebuild sqlite3
cd app
./node_modules/.bin/electron-rebuild
cd ..
# Start the app
yarn start
```

### Dev setup

1. Follow [`/.docs/DEV_SETUP.md`](/.docs/DEV_SETUP.md) to setup fakeships and pull the Urbit submodule down into the Realm repo.

2. Once these ships are created, you can then go to [`/app/README.md`](/app/README.md) to get started with Realm.

### Downloading the binary from Releases

If you download from releases, you will have to include a github token env when you open Realm for now, see docs in [`/app/release/app`](https://github.com/holium/realm/tree/main/app/release/app/README.md).

In the debug build you can bypass the invite code and email with `~admins-admins-admins` and `admin@admin.com` (only if DEBUG_PROD=true).

`~hostyv` hosts several of the desks needed for Realm, you may have to manually install them for now.

### Linux Installation Notes

- Realm is distributed as an AppImage file. AppImages require FUSE version 2 to run. If you are running Ubuntu (>= 22.04), you will need to install fuse version 2. More information here:

https://github.com/AppImage/AppImageKit/wiki/FUSE

### Build prerelease version

```
npx cross-env DEBUG_PROD=true yarn package:prerelease:mac
npx cross-env DEBUG_PROD=true yarn package:prerelease:linux
npx cross-env DEBUG_PROD=true yarn package:prerelease:win
```

Building a prerelease will replace the `.d.ts` files in all the `/dist` folders, so make sure to run `rm -rf ./**/dist` followed by `yarn` in root when you want to run Realm in dev mode again.

## Contributing

For frontend development, make sure to:

1. Install the ESLint extension in your editor of choice ([VSCode link](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)). The Prettier extension is not needed since we're using it as an ESLint plugin.
2. Configure your editor to format on save so you don't have to run `yarn lint` manually ([VSCode instruction](https://code.visualstudio.com/updates/v1_6#_format-on-save)).
3. Follow the [Frontend Style Guide](./.docs/FRONTEND.md).
