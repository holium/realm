:: 
::  %spaces [realm]: 
::
::  A store for Realm space metadata and management.
::
::  Should watch and sync data with the %group-store under /landscape.
::

|_  =bowl:gall
++  on-init   `..on-init
++  on-save   !>(~)
++  on-load   |=(vase `..on-init)
++  on-poke   |=(cage !!)
++  on-watch  |=(path !!)
++  on-leave  |=(path `..on-init)
++  on-peek   |=(path ~)
++  on-agent  |=([wire sign:agent:gall] !!)
++  on-arvo   |=([wire sign-arvo] !!)
++  on-fail   |=([term tang] `..on-init)
--