## room/test-ui

This is a test UI for the rooms primitive.

### Running

Run `yarn dev` in two different terminals, and boot two fake ships.

Then in respective dojo sessions, run:

```
|pass [%e [%approve-origin 'http://localhost:5173']]
```

```
|pass [%e [%approve-origin 'http://localhost:5174']]
```

Lastly, visit `http://localhost:5173` and `http://localhost:5174` in your browser.

Make sure to create a `ships.json` configuration file in `test-ui/src`. Here's an example:

```
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
