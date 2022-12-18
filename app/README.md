# Realm app

An electron app that serves as a GUI for the Realm experience and Urbit. The intention is for this app to be used fullscreen and as a replacement for your old school OS. Once you open Realm, you will be in a new sovereign world where no megacorps can watch you.

## Getting started

You should build the project from root with `yarn` so that all the libs build properly.

**Note**: Run `yarn dev:cursor` one time to build the `mouse.js` preload. Need to refactor the default build
process to include this step.

Start the app in dev mode with `yarn start` or `npm run start`.

## Developing apps within Realm

You can think of Realm like a web browser. You can hot reload apps you are actively developing through Realm by adding some metadata to `src/app.dev.json`.

You can add a record for your development application in the following format:

```jsonc
{
  "ballot-dev": {
    "id": "ballot-dev",
    "title": "Ballot - Dev",
    "type": "dev",
    "color": "#cebef0",
    "icon": "https://lomder-librun.sfo3.digitaloceanspaces.com/tiles/ballot-app-tile.svg",
    "config": {
      "size": [6, 8],
      "showTitlebar": true,
      "titlebarBorder": false
    },
    "web": {
      "url": "http://localhost:3000/apps/ballot/"
    }
  }
}
```

## Architecture

The project is structured with the goal of having a seperate process sync data from your Urbit server and being an offline cache of your Urbit ship state.

```

    ____________          _____________          _________________
   |            |        |             |        |                |
   |  Renderer  | ------ |    Main     | ------ |   Background   |
   |____________|        |_____________|        |________________|
                                |
                                |
                          ____________
                         |            |
                         |    Core    |
                         |____________|
```

- `/renderer` is the GUI layer.
- `/main` is the main electron process
- `/core` is the core background process libs for syncing state and managing data.
- `/background` is the background process logic, starts a tray icon for Realm.

## Packaging for release

Running the below command will place the build output at `/release/build`.

```zsh
yarn package
```

If you include `DEBUG_PROD=true` you can open dev tools and check for errors.

```zsh
npx cross-env DEBUG_PROD=true yarn package
```

## Linking the libs

#### Yarn

```zsh
# In the root directory
yarn
```

#### Yarn link /libs

Link all libs (It'll take a little while):

```zsh
yarn link:all
```

Or link them individually:

`@holium/design-system`:

```zsh
cd lib/design-system
yarn build
yarn link

cd ...
## In the root directory
yarn link "@holium/design-system"
```

`@holium/realm-multiplayer`:

```zsh
cd lib/multiplayer
yarn build
yarn link

cd ...
## In the root directory
yarn link "@holium/realm-multiplayer"
```

`@holium/conduit`:

```zsh
cd lib/conduit

yarn build
yarn link

cd ...
## In the root directory
yarn link "@holium/conduit"
```

`@holium/realm-room`:

```zsh
cd lib/room

yarn build
yarn link

cd ...
## In the root directory
yarn link "@holium/realm-room"
```
