# Usage:
# ./copy-desk.sh <ship_name> <desk>
# ./copy-desk.sh zod ballot

mkdir -p "ships/$1/$2" && cp -R -f desk/* ships/$1/$2 && echo "~$1" > ships/$1/$2/desk.ship


# find $2/desk/* -type f \( -iname \*.hoon -o -iname \*.bill -o -iname \*.docket-0 -o -iname \*.ship -o -iname \*.kelvin \) | xargs cp -t ships/$1/$2

# find ballot/desk/* -iname f \( -iname \*.hoon -o -iname \*.bill -o -iname \*.docket-0 -o -iname \*.ship -o -iname \*.kelvin \) -exec cp {} ships/zod/vote \;

# find ballot/desk/* -type f \( -iname \*.hoon -o -iname \*.bill -o -iname \*.docket-0 -o -iname \*.ship -o -iname \*.kelvin \) -exec cp -R -f {} ships/zod/vote \;

# find ballot/desk/* -type f -not -iname \*.md  -exec cp -R -f {} ships/pod/{} \;

# cp -r  ballot/desk/!(\*readme.md|\*/README.md) ships/pod/ballot
