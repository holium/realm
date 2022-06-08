# Realm app

An electron app that serves as a GUI for the Realm experience and Urbit. The intention is for this app to be used fullscreen and as a replacement for your old school OS. Once you open Realm, you will be in a new sovereign world where no megacorps can watch you.

## Getting started

Install all dependencies with `yarn` or `npm install`.

**Note**: Run `yarn start:webview` one time to build the `mouse.js` preload. Need to refactor the default build
process to include this step.

Start the app in dev mode with `yarn start` or `npm run start`.

### Starting two instances

You can start two instances of Realm by placing the `PORT` environment variable in front of the `yarn start` command.

```bash
PORT=1212 yarn start
```

```bash
PORT=1213 yarn start
```

I would not try to log in on the same account for now. This is not supported currently. Sign into separate accounts.

## Developing apps within Realm

You can think of Realm like a web browser. You can hot reload apps you are actively developing through Realm by adding some metadata to `src/renderer/apps/development.ts`.

You can add a record for your development application in the following format:

```jsonc
{
  "ballot-dev": {
    "id": "ballot-dev",
    "title": "Ballot - Dev",
    "type": "web",
    "color": "#cebef0",
    "icon": "https://lomder-librun.sfo3.digitaloceanspaces.com/tiles/ballot-app-tile.svg",
    "web": {
      "openFullscreen": true,
      "url": "http://localhost:3000/apps/ballot/" # the port for your dev server
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

## Layers of the UI

Layer 0: Background
Layer 1: WindowManager
Layer 2: SystemBar
Layer 3: TrayMenus
Layer 4: Modals, ContextMenu, Tooltips, Popovers
