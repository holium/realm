::  chat-db [realm]:
::
::  Chat message lib within Realm. Mostly handles [de]serialization
::    to/from json from types stored in courier sur.
::
/-  *versioned-state, sur=chat-db
|%
::
::  poke actions
::
++  create-path
  ::  :chat-db &action [%create-path [/a/path/to/a/chat ~ %chat]]
  |=  [act=create-path-action:sur state=state-0 =bowl:gall]
  ^-  (quip card state-0)
  =/  path-id  (sham [path.act])
  =/  row=path-row:sur   :^
    path-id
    path.act
    metadata.act
    type.act
  =.  paths-table.state  (~(put by paths-table.state) path-id row)
  [~ state]
++  leave-path
  |=  [act=action:sur state=state-0 =bowl:gall]
  ^-  (quip card state-0)
  [~ state]
++  insert
  |=  [act=action:sur state=state-0 =bowl:gall]
  ^-  (quip card state-0)
  [~ state]
++  edit
  |=  [act=action:sur state=state-0 =bowl:gall]
  ^-  (quip card state-0)
  [~ state]
++  delete
  |=  [act=action:sur state=state-0 =bowl:gall]
  ^-  (quip card state-0)
  [~ state]
++  add-peer
  |=  [act=action:sur state=state-0 =bowl:gall]
  ^-  (quip card state-0)
  [~ state]
++  kick-peer
  |=  [act=action:sur state=state-0 =bowl:gall]
  ^-  (quip card state-0)
  [~ state]
::
::  mini helper lib
::
++  from
  |%
  ++  start
    |=  [=msg-id:sur tbl=messages-table:sur]
    ^-  (list msg-part:sur)
    :: TODO actually filter the messages-table mop type into a list of
    :: msg-part that have id gth msg-id passed in
    =/  msg-val  (~(got by tbl) [msg-id 0])
    =/  filtered=messages-table:sur  +:(~(bif by tbl) [msg-id 0] msg-val)
    ~(val by filtered)
  ++  paths-list
    |=  [tbl=paths-table:sur]
    ^-  (list path)
    (turn ~(val by tbl) |=(a=path-row:sur path.a))
  ::++  messages-table
  ::  |=  =tables:sur
  ::  ^-  messages-table:sur
  ::  =/  mini  (skim tables |=(a=table:sur =(-.a %messages)))
  ::  (snag 0 mini)
  --
::
::  JSON
::
++  enjs
  =,  enjs:format
  |%
    ++  db-dump :: encodes for on-watch
      |=  db=db-dump:sur
      ^-  json
      %-  pairs
      :_  ~
      ^-  [cord json]
      :-  -.db
      ?-  -.db
        :: ::
          %tables
        (all-tables:encode tables.db)
      ==
    ::
    ++  messages-table :: encodes for on-watch
      |=  tbl=messages-table:sur
      ^-  json
      (messages-table:encode tbl)
    ::
    ++  path-row :: encodes for on-watch
      |=  =path-row:sur
      ^-  json
      (path-row:encode path-row)
  --
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
++  encode
  =,  enjs:format
  |%
    ++  all-tables
      |=  =tables:sur
      ^-  json
      %-  pairs
      %+  turn  tables
        |=  =table:sur
        ::[-.table (jsonify-table +.table)]
        [-.table s+'test']
    ::
    ++  messages-table
      |=  tbl=messages-table:sur
      ^-  json
      :: TODO actually convert messages table to json
      [%o *(map @t json)]
    ++  path-row
      |=  =path-row:sur
      ^-  json
      %-  pairs
      :~  id+s+(scot %uv id.path-row)
          path+s+(spat path.path-row)
          metadata+s+'TODO not implemented'
          type+s+type.path-row
      ==
  --
--
