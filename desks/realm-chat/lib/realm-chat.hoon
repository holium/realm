::  realm-chat [realm]:
::
::  Chat message lib within Realm. Mostly handles [de]serialization
::    to/from json from types stored in realm-chat sur.
::
/-  *realm-chat, db=chat-db
|%
::
:: helpers
::
++  scry-peers
  |=  [=path =bowl:gall]
  ^-  (list peer-row:db)
  =/  paths  (weld /(scot %p our.bowl)/chat-db/(scot %da now.bowl)/db/peers-for-path path)
  =/  tbls
    .^
      db-dump:db
      %gx
      (weld paths /noun)
    ==
  =/  tbl  `table:db`(snag 0 tables.tbls)
  ?+  -.tbl  !!
    %peers  (snag 0 ~(val by peers-table.tbl))
  ==
++  into-insert-message-pokes
  |=  [p=peer-row:db act=insert-message-action:db]
  [%pass /dbpoke %agent [patp.p %chat-db] %poke %action !>([%insert act])]
::
::  poke actions
::
++  send-message
::  :realm-chat &action [%send-message [/a/path/to/a/chat (limo [[[%plain 'hello'] ~ ~] ~])]]
  |=  [act=insert-message-action:db state=state-0 =bowl:gall]
  ^-  (quip card state-0)
  :: read the peers for the path
  =/  pathpeers  (scry-peers path.act bowl)
  ~&  >  pathpeers
  =/  cards  
    %:  turn
      pathpeers
      |=(a=peer-row:db (into-insert-message-pokes a act))
    ==
  :: then send pokes to all the peers about inserting a message
  [cards state]
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
