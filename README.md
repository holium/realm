# Holium Realm

A desktop environment for Urbit.

We use yarn workspace to manage the multiple modules.

## Getting started

We use yarn workspaces to build all packages for Realm.

```zsh
# Install dependencies and build all packages
yarn
# Start the app
yarn start
```

### Dev setup

1. In order to run Urbit locally, you will need to create a local fake ship. To setup a fake ship see [`/.docs/DEV_SETUP.md`](/.docs/DEV_SETUP.md)

2. Once these ships are created, you can then go to [`/app/README.md`](/app/README.md) to get started with Realm.

### Downloading the binary from Releases

If you download from releases, you will have to include a github token env when you open Realm for now, see docs in [`/app/release/app`](https://github.com/holium/realm/tree/main/app/release/app/README.md).

In the debug build you can bypass the invite code and email with `~admins-admins-admins` and `admin@admin.com` (only if DEBUG_PROD=true).

`~hostyv` hosts several of the desks needed for Realm, you may have to manually install them for now.

### Build prerelease version

```
npx cross-env DEBUG_PROD=true yarn package:prerelease:mac
npx cross-env DEBUG_PROD=true yarn package:prerelease:linux
npx cross-env DEBUG_PROD=true yarn package:prerelease:win
```

## Contributing

For frontend development, make sure to:

1. Install the ESLint extension in your editor of choice ([VSCode link](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)). The Prettier extension is not needed since we're using it as an ESLint plugin.
2. Configure your editor to format on save so you don't have to run `yarn lint` manually ([VSCode instruction](https://code.visualstudio.com/updates/v1_6#_format-on-save)).
3. Follow the [Frontend Style Guide](./.docs/FRONTEND.md).
