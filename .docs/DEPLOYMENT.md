## Before Deploying Realm Desks

Before you deploy desks from this repo to `~hostyv` for distribution,
make sure the symlinked files from `base-dev` are up to date.

#### Steps

1. Pull latest `urbit/urbit` - `cd urbit && git checkout master && git pull`
2. Copy its `base-dev` files into the `realm` desk
   using the `symbolic-merge` bash script.
3. Note any new files, and verify everything is still working properly.

```bash
# pull urbit/urbit latest
$: git submodule foreach git pull origin master
```

Next, replace the `symbolic-merge.sh` at `urbit/pkg/` with our `symbolic-merge.sh` script at the top level of the monorepo. Then, run it:

```bash
$: cd urbit/pkg
$: ./symbolic-merge.sh base-dev ../../desks/realm
```

Now you'll want to commit the desks to a fakezod, and look for any errors or bugs before deploying.
