# @holium/realm-multiplayer-notes

Showcase UI for the multiplayer JS lib.

To be published as its own app.

## Running

Run `yarn dev` and boot two fake ships.

Then run `yarn start` in root to start the test UI in Realm. Make sure to have a populated `app/src/app.dev.json`:

```json
{
  "notes-dev": {
    "id": "notes-dev",
    "title": "Notes",
    "type": "dev",
    "icon": "https://lomder-librun.sfo3.digitaloceanspaces.com/tiles/ballot-app-tile.svg",
    "color": "#cebef0",
    "config": {
      "size": [6, 8],
      "showTitlebar": true,
      "titlebarBorder": false
    },
    "web": {
      "url": "http://localhost:5174"
    }
  }
}
```
