# Holium Realm

A desktop environment for Urbit.

## Getting started

In order to run Urbit locally, you will need to create a local fake ship. Once these ships are
created, you can then go to [`/app/README.md`](/app/README.md) to get started with Realm.

### Fake ships and Urbit

```zsh
# Make ships folder
mkdir ships
cd ships
# Download latest urbit
curl -JLO https://urbit.org/install/mac/latest
# Uncompress
tar zxvf ./darwin.tgz --strip=1
rm darwin.tgz
```

#### Download latest urbit pill

First, you may need to download `git-lfs`

```zsh
brew install git-lfs
git lfs install
```

After install `git-lfs`, clone the urbit repo.

```zsh
git clone https://github.com/urbit/urbit urbit-repo
```

This will add a `urbit` folder to your local repo which is ignored by git.

#### Booting a fake ship for development

You should run these in two separate terminal windows.

**WARNING**: Never start the same ship twice or there will be networking problems.

```zsh
# The -F will create a fake zod
./urbit -F zod -B ./urbit-repo/bin/multi-brass.pill

# Optional:
#   Fake bus for networking between fake ships
./urbit -F bus -B ./urbit-repo/bin/multi-brass.pill
```

This will start booting a dev ship and may take a while.

[See more docs for working with the developer environment.](https://urbit.org/docs/development/environment)

#### Allow origin (CORS)

You will want to run the following on both ships.

```hoon
~zod:dojo> |pass [%e [%approve-origin 'http://localhost:3010']]
```

```hoon
~bus:dojo> |pass [%e [%approve-origin 'http://localhost:3010']]
```

### Starting the ship after install

Now, you want to start your dev ship `zod`.

**WARNING**: Never start the same ship twice or there will be networking problems. Make sure there is no instance of `~zod` running before running this:

```zsh
./urbit zod
```
