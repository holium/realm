# Holium Realm

A desktop environment for Urbit.

We use yarn workspace to manage the multiple modules.

## Getting started

We use yarn workspace to build all libs and packages for Realm.

Simply run `yarn` to build the libs and app.

```zsh
## Build libs
yarn link:all
## Build project
yarn build
# Once the install and build is complete
yarn start
```

### Dev setup

1. In order to run Urbit locally, you will need to create a local fake ship. To setup a fake ship see [`/.docs/DEV_SETUP.md`](/.docs/DEV_SETUP.md)

2. Once these ships are created, you can then go to [`/app/README.md`](/app/README.md) to get started with Realm.

### Downloading the binary from Releases

If you download from releases, you will have to include a github token env when you open Realm for now, see docs in [`/app/release/app`](https://github.com/holium/realm/tree/main/app/release/app/README.md).

In the debug build you can bypass the invite code and email with `~admins-admins-admins` and `admin@admin.com` (only if DEBUG_PROD=true).

`~hostyv` hosts several of the desks needed for Realm, you may have to manually install them for now.
