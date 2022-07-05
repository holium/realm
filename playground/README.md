# Playground

A simple app that can be used to test various feature injection through an Urbit AppWindow.

## Start two instances

The env format is `.env.<patp>` as seen in the commands below.

```bash
yarn dev:env zod
```

```bash
yarn dev:env bus
```

## Initial setup

### Setup playground desk in dev ship

Once started, you should run the following commands on your ship.

```hoon
> |merge %playground our %base
>=
> |mount %playground
>=
```

### Updating the desk

Use the `copy-desk.sh` script from the `/realm` dir to copy files from the dev workspace to the ship volume.

```
./copy-desk.sh zod playground
```

After copying with the script, run the following from the dojo.

```hoon
> |commit %playground
```

This will update the dev ship with the changes from `/playground/desk`.

For the playground, you will just need to do this once to register the tile.

### Install playground

```hoon
> |install our %playground
```
