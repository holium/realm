## Tome

TomeDB's full architecture is a bit confusing so please read carefully!

TomeDB has:

1. A gall agent - server-side business logic.
2. Realm IPC handlers / functions. This is the business logic for Tome's JS side.
3. Third-party installable Tome package. This only has one method: `initTome`. `initTome` returns a `Tome` class that has methods for dispatching `keyvalue` and `sqlitejson` creation events.
4. The `Tome` class mentioned in 3.

## Goal

Keep the developer-installed side of Realm packages (what is published) as minimal as possible.

This allows us more flexibility to change things going forward without breaking existing applications / forcing them to standby to update package versions. Holium handles the version conflicts between JS Realm / %realm, not third-party devs.
