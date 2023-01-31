## Getting started

### Fake ships and Urbit

```zsh
# Make ships folder
mkdir ships
cd ships
# Download latest urbit
curl -JLO https://urbit.org/install/mac/latest
# Uncompress
tar zxvf ./darwin.tgz --strip=1
```

Now you should have the urbit files in the `ships` folder. This folder is ignored by GIT.

#### Download latest urbit repo

```zsh
git clone https://github.com/urbit/urbit
```

This will add a `urbit` folder to your local repo which is ignored by git.

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
./urbit zod
```

Once started, you should run the following commands on your ship.

For `%realm`:

```hoon
> |new-desk %realm
> |mount %realm
```

Then we want to delete the contents of the mounted folder now in `ships/zod/realm`.

```zsh
sudo rm -r ships/zod/realm/*
```

For `%courier`:

```hoon
> |new-desk %courier
> |mount %courier
```

```zsh
sudo rm -r ships/zod/courier/*
```

### Copying the dev desk to a fake ship.

There is a script called `./copy-desk.sh` that takes a ship name and app name. It should also copy all files needed from `base`, `garden`, and `landscape`.

First we need to mount `base`, `garden`, and `landscape` in `~zod` so our script can copy dependencies over.

```hoon
|mount %base
|mount %garden
|mount %landscape
```

Now we can run the copy script.

```zsh
# Only have to run the first time
chmod +x ./copy-desk.sh
# this will copy the desk
./copy-desk.sh zod realm
./copy-desk.sh zod courier
```

This is how we can update and write new code from a dev folder. To have the updates take effect in our ship, run:

```hoon
|commit %realm
|commit %courier
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
