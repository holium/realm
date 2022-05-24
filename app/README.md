# Realm app

An electron app that serves as a GUI for the Realm experience and Urbit. The intention is for this app to be used fullscreen and as a replacement for your old school OS. Once you open Realm, you will be in a new sovereign world where no megacorps can watch you.

## Getting started

Install all dependencies with `yarn` or `npm install`.

Start the app in dev mode with `yarn start` or `npm run start`.

## Architecture

The project is structured with the goal of having a seperate process syncing data from your Urbit server and being an offline cache of your
Urbit ship state.

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
