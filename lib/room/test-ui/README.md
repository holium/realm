# room/test-ui

This is a test UI for the rooms primitive.

## Running

Run `yarn dev`, and boot two fake ships.

Then in respective dojo sessions, run:

```hoon
|pass [%e [%approve-origin 'http://localhost:5174']]
```

Then visit `http://localhost:5174/~zod` and `http://localhost:5174/~bus` in your browser.

Make sure to create a `ships.json` configuration file in `test-ui/public`. Here's an example:

```json
{
  "~zod": {
    "ship": "zod",
    "url": "http://localhost",
    "code": "lidlut-tabwed-pillex-ridrup"
  },
  "~bus": {
    "ship": "bus",
    "url": "http://localhost:8080",
    "code": "riddec-bicrym-ridlev-pocsef"
  },
  "~dev": {
    "ship": "dev",
    "url": "http://localhost:8081",
    "code": "magsub-micsev-bacmug-moldex"
  },
  "~fes": {
    "ship": "fes",
    "url": "http://localhost:8083",
    "code": "lagfep-borweb-sabler-dacnus"
  },
  "~sun": {
    "ship": "sun",
    "url": "http://localhost:8087",
    "code": "parsyr-dibwyt-livpen-hatsym"
  }
}
```

Lastly, to connect `~bus` to a room hosted by `~zod`, you must manually poke. In the dojo of `~bus`, run:

```hoon
:rooms-v2 &rooms-v2-session-action [%set-provider ~zod]
```
