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
++  scry-path-row
  |=  [=path =bowl:gall]
  ^-  path-row:db
  =/  paths  (weld /(scot %p our.bowl)/chat-db/(scot %da now.bowl)/db/path path)
  =/  tbls
    .^
      db-dump:db
      %gx
      (weld paths /noun)
    ==
  =/  tbl  `table:db`(snag 0 tables.tbls)
  ?+  -.tbl  !!
    %paths  (snag 0 ~(val by paths-table.tbl))
  ==
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
++  into-insert-message-poke
  |=  [p=peer-row:db act=[=path fragments=(list minimal-fragment:db)] ts=@da]
  [%pass /dbpoke %agent [patp.p %chat-db] %poke %action !>([%insert ts act])]
++  into-all-peers-kick-pokes
  |=  [kickee=ship peers=(list peer-row:db)]
  ^-  (list card)
  %:  turn
    peers
    |=(p=peer-row:db [%pass /dbpoke %agent [patp.p %chat-db] %poke %action !>([%kick-peer path.p kickee])])
  ==
::
::  poke actions
::
++  create-chat
::  :realm-chat &action [%create-chat ~ %chat]
  |=  [act=create-chat-data state=state-0 =bowl:gall]
  ^-  (quip card state-0)
  ?>  =(type.act %chat)  :: for now only support %chat type paths
  =/  chat-path  /realm-chat/(scot %uv (sham [our.bowl now.bowl]))
  =/  cards  
    [%pass /dbpoke %agent [our.bowl %chat-db] %poke %action !>([%create-path chat-path act])]~
  [cards state]
++  add-ship-to-chat
::  :realm-chat &action [%add-ship-to-chat /realm-chat/path-id ~bus]
  |=  [act=[=path =ship] state=state-0 =bowl:gall]
  ^-  (quip card state-0)
  =/  pathrow  (scry-path-row path.act bowl)
  =/  pathpeers  (scry-peers path.act bowl)
  =/  cards
    :-  
      ::  we poke the newly-added ship's db with a create-path,
      ::  since that will automatically handle them joining as a member
      [%pass /dbpoke %agent [ship.act %chat-db] %poke %action !>([%create-path pathrow])]

      :: we poke all peers/members' db with add-peer (including ourselves)
      %:  turn
        pathpeers
        |=(p=peer-row:db [%pass /dbpoke %agent [patp.p %chat-db] %poke %action !>([%add-peer path.act ship.act])])
      ==
  [cards state]
::  allows self to remove self, or %host to kick others
++  remove-ship-from-chat
:: TODO fix %host removes self fails to update other peers properly
::  :realm-chat &action [%remove-ship-from-chat /realm-chat/path-id ~bus]
  |=  [act=[=path =ship] state=state-0 =bowl:gall]
  ^-  (quip card state-0)
  =/  pathpeers  (scry-peers path.act bowl)
  =/  host  (snag 0 (skim pathpeers |=(p=peer-row:db =(role.p %host))))
  =/  cards
    ?:  =(ship.act patp.host)
      :: if src.bowl is %host, we have to send kick-peer for all the peers
      :: to all the peers and then leave-path the host
      :-  [%pass /dbpoke %agent [patp.host %chat-db] %poke %action !>([%leave-path path.act])]
      %-  zing
      %:  turn
        pathpeers
        |=(p=peer-row:db (into-all-peers-kick-pokes patp.p pathpeers))
      ==
    :: otherwise we just send kick-peer to all the peers (db will ensure permissions)
    (into-all-peers-kick-pokes ship.act pathpeers)
  [cards state]
::
++  send-message
::  :realm-chat &action [%send-message /realm-chat/path-id (limo [[[%plain 'hello'] ~ ~] ~])]
  |=  [act=[=path fragments=(list minimal-fragment:db)] state=state-0 =bowl:gall]
  ^-  (quip card state-0)
  :: read the peers for the path
  =/  pathpeers  (scry-peers path.act bowl)
  =/  official-time  now.bowl
  =/  cards  
    %:  turn
      pathpeers
      |=(a=peer-row:db (into-insert-message-poke a act official-time))
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
