## Getting started

### Fake ships and Urbit

```zsh
# Make ships folder
mkdir ships
cd ships
# Download latest Urbit binary
https://urbit.org/getting-started/cli

# pull down the Urbit repo
git submodule foreach git pull origin master
```

Now you should have the urbit files in the `ships` folder. This folder is ignored by GIT.

#### Booting a fake ship for development

```zsh
# The -F will create a fake zod
./urbit -F zod

# Optional:
#   Fake bus for networking between fake ships
./urbit -F bus
```

[See more docs for working with the developer environment.](https://developers.urbit.org/guides/core/environment)

Now, you want to start your dev ship `zod`.

```zsh
./zod/.run
```

Once started, you should run the following commands on your ship.

For `%realm`:

```hoon
> |new-desk %realm
> |mount %realm
```

For `%courier`:

```hoon
> |new-desk %courier
> |mount %courier
```

```zsh
watch cp -LR 
```

#### Installing %realm and %courier

```hoon
|revive %realm
|revive %courier
```

#### Hosting Realm for other test ships

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
~zod:dojo> |pass [%e [%approve-origin 'http://localhost:3000']]
```

For `~bus`:

```hoon
~bus:dojo> |pass [%e [%approve-origin 'http://localhost:3001']]
```

For `~dev`:

```hoon
~dev:dojo> |pass [%e [%approve-origin 'http://localhost:3002']]
```

READ: https://github.com/urbit/create-landscape-app/tree/master/full
