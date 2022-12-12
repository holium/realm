# Usage:
# ./copy-desk.sh <ship_name> <desk>
# ./copy-desk.sh zod realm

mkdir -p "ships/$1/$2" && cp -R -f desks/$2/* ships/$1/$2 && echo "~$1" > ships/$1/$2/desk.ship


if [ $2 = "realm" ]; then
  # Pulling relevant files from base
  cp -R -f ships/$1/base/mar/noun.hoon ships/$1/$2/mar/noun.hoon
  cp -R -f ships/$1/base/mar/kelvin.hoon ships/$1/$2/mar/kelvin.hoon

   # Pulling relevant files from garden
  cp -R -f ships/$1/garden/mar/docket-0.hoon ships/$1/realm/mar/docket-0.hoon
  cp -R -f ships/$1/garden/lib/docket.hoon ships/$1/realm/lib/docket.hoon
  cp -R -f ships/$1/garden/sur/docket.hoon ships/$1/realm/sur/docket.hoon
  cp -R -f ships/$1/garden/sur/treaty.hoon ships/$1/realm/sur/treaty.hoon

  # Pulling relevant files from landscape
  cp -R -f ships/$1/landscape/sur/resource.hoon ships/$1/realm/sur/resource.hoon
  cp -R -f ships/$1/landscape/sur/contact-store.hoon ships/$1/realm/sur/contact-store.hoon
  cp -R -f ships/$1/landscape/lib/resource.hoon ships/$1/realm/lib/resource.hoon
  cp -R -f ships/$1/landscape/mar/dm-hook-action.hoon ships/$1/realm/mar/dm-hook-action.hoon
  cp -R -f ships/$1/landscape/lib/dm-hook.hoon ships/$1/realm/lib/dm-hook.hoon
else
  # Pulling relevant files from base
  cp -R -f ships/$1/base/mar/noun.hoon ships/$1/$2/mar/noun.hoon
  cp -R -f ships/$1/base/mar/kelvin.hoon ships/$1/$2/mar/kelvin.hoon
fi

