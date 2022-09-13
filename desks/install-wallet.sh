# Usage:
# ./install-wallet.sh <ship_name> <desk>
# ./install-wallet.sh zod playground

mkdir -p "../ships/$1/$2" && cp -R -f wallet/desk/* ../ships/$1/$2 && echo "~$1" > ../ships/$1/$2/desk.ship