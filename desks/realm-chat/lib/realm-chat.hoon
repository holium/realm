::  realm-chat [realm]:
::
::  Chat message lib within Realm. Mostly handles [de]serialization
::    to/from json from types stored in realm-chat sur.
::
/-  *realm-chat
|%
::
:: transformation helpers
::


::
::  poke actions
::
++  first-action
::  :realm-chat &action [%first-action /a/path/to/a/chat]
  |=  [act=path state=state-0 =bowl:gall]
  ^-  (quip card state-0)
  `state
::
::  JSON
::
::++  enjs
::  =,  enjs:format
::  |%
::    ++  db-dump :: encodes for on-watch
::      |=  db=db-dump:sur
::      ^-  json
::      %-  pairs
::      :_  ~
::      ^-  [cord json]
::      :-  -.db
::      ?-  -.db
::        :: ::
::          %tables
::        (all-tables:encode tables.db)
::      ==
::  --
::
:: ++  dejs
::   =,  dejs:format
::   |%
::   ++  action
::     |=  jon=json
::     ^-  action:sur
::     =<  (decode jon)
::     |%
::     ++  decode
::       %-  of
::       :~  [%read-dm read-dm]
::       ==
::     ::
::     ++  read-dm
::       %-  ot
::       :~  
::           [%ship (su ;~(pfix sig fed:ag))]
::       ==
::     ::
::     ++  tang 
::       |=  jon=^json
::       ^-  ^tang
::       ?>  ?=(%a -.jon)
::       %-  zing
::       %+  turn
::         p.jon
::       |=  jo=^json
::       ^-  (list tank)
::       ?>  ?=(%a -.jo)
::       %+  turn
::         p.jo
::       |=  j=^json
::       ?>  ?=(%s -.j)
::       ^-  tank
::       leaf+(trip p.j)
::     ::
::     ++  eval
::       %-  ot
::       :~  expression+so
::           output+tang
::       ==
::     ::
::     ::
::     --
::   --
::
::++  encode
::  =,  enjs:format
::  |%
::    ++  all-tables
::      |=  =tables:sur
::      ^-  json
::      %-  pairs
::      %+  turn  tables
::        |=  =table:sur
::        ::[-.table (jsonify-table +.table)]
::        [-.table s+'test']
::    ::
::  --
--
