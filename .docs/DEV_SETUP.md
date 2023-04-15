## Getting started

So, you've just cloned down the Realm monorepo. What now?

## Pull Urbit submodule

```bash
# have `git pull` also get the pinned commit of the Urbit submodule
$: git config --global submodule.recurse true
# init submodule, and then pull it
$: git submodule update --init --recursive
$: git pull
```

Tip: in VSCode add `urbit/*` in "files to exclude" to hide `urbit/urbit` from searches.

### Urbit binary

First, run the following one-time setup commands:

```bash
# Make ships folder
$: mkdir ships && cd ships

# Download latest Urbit binary to the ships folder
https://urbit.org/getting-started/cli
```

### Build a fake ship for development

The following steps will need to be run semi-regularly, as ships become stale.

```bash
# Build a new fakezod
$: ./urbit -F zod

# Optional:
#   Fake bus for testing networking
$: ./urbit -F bus
```

[See more docs for working with the developer environment.](https://developers.urbit.org/guides/core/environment)

On subsequent boots, you can:

```bash
$: ./zod/.run
# and
$: ./bus/.run
```

### Holium Desks

Create and mount `%realm` and `%courier` on `zod` only:

```hoon
|new-desk %realm
|mount %realm
```

```hoon
|new-desk %courier
|mount %courier
```

Watch the desks into your `zod`, so they are always up to date:

```bash
# from the desks directory
$: ./watch-desks.sh ../ships/zod
```

Now the files are on your ship, commit and start the agents:

```hoon
|commit %realm
|revive %realm
```

```hoon
|commit %courier
|revive %courier
```

To test your changes, save the files in your IDE, and then `|commit %<desk-name>` to apply.

### Developing with multiple ships

The best way to update all your test ships at once is to publish `%realm` from `~zod`.

From `~zod`:

```hoon
:treaty|publish %realm
:treaty|publish %courier
```

From `~bus`:

```hoon
|install ~zod %realm
|install ~zod %courier
```

#### Allow origin (CORS)

For `~zod`:

```hoon
|pass [%e [%approve-origin 'http://localhost:3000']]
```

For `~bus`:

```hoon
|pass [%e [%approve-origin 'http://localhost:3001']]
```

For `~dev`:

```hoon
|pass [%e [%approve-origin 'http://localhost:3002']]
```

READ: https://github.com/urbit/create-landscape-app/tree/master/full
