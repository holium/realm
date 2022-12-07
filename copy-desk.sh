# Usage:
# ./copy-desk.sh <ship_name> <desk>
# ./copy-desk.sh zod playground

mkdir -p "ships/$1/$2" && cp -R -f desks/$2/* ships/$1/$2 && echo "~$1" > ships/$1/$2/desk.ship

cp -R -f ships/$1/garden/mar/docket-0.hoon ships/$1/realm/mar/docket-0.hoon
cp -R -f ships/$1/garden/lib/docket.hoon ships/$1/realm/lib/docket.hoon
cp -R -f ships/$1/garden/sur/docket.hoon ships/$1/realm/sur/docket.hoon
cp -R -f ships/$1/garden/sur/treaty.hoon ships/$1/realm/sur/treaty.hoon
cp -R -f ships/$1/garden/sur/hark-store.hoon ships/$1/realm/sur/hark-store.hoon
cp -R -f ships/$1/landscape/sur/resource.hoon ships/$1/realm/sur/resource.hoon
cp -R -f ships/$1/landscape/sur/contact-store.hoon ships/$1/realm/sur/contact-store.hoon
cp -R -f ships/$1/landscape/lib/resource.hoon ships/$1/realm/lib/resource.hoon
cp -R -f ships/$1/landscape/mar/dm-hook-action.hoon ships/$1/realm/mar/dm-hook-action.hoon
cp -R -f ships/$1/garden/lib/hark-store.hoon ships/$1/realm/lib/hark-store.hoon
cp -R -f ships/$1/landscape/lib/dm-hook.hoon ships/$1/realm/lib/dm-hook.hoon

# groups 2 (hark)
# cp -R -f ships/$1/groups/lib/hark-json.hoon ships/$1/realm/lib/hark-json.hoon
# cp -R -f ships/$1/groups/mar/hark/action.hoon ships/$1/realm/mar/hark/action.hoon
# cp -R -f ships/$1/groups/mar/hark/blanket.hoon ships/$1/realm/mar/hark/blanket.hoon
# cp -R -f ships/$1/groups/mar/hark/carpet.hoon ships/$1/realm/mar/hark/carpet.hoon
# cp -R -f ships/$1/groups/mar/hark/yarn.hoon ships/$1/realm/mar/hark/yarn.hoon
# cp -R -f ships/$1/groups/sur/hark.hoon ships/$1/realm/sur/hark.hoon
# cp -R -f ships/$1/groups/sur/groups.hoon ships/$1/realm/sur/groups.hoon
# cp -R -f ships/$1/groups/sur/meta.hoon ships/$1/realm/sur/meta.hoon
# cp -R -f ships/$1/groups/sur/epic.hoon ships/$1/realm/sur/epic.hoon

cp -R -f ships/$1/garden/mar/hark ships/$1/realm/mar/hark