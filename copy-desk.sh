# Usage:
# ./copy-desk.sh <ship_name> <desk>
# ./copy-desk.sh zod playground

mkdir -p "ships/$1/$2" && cp -R -f desks/$2/* ships/$1/$2 && echo "~$1" > ships/$1/$2/desk.ship
