::  chat-db [realm]:
::
::  Chat message lib within Realm. Mostly handles [de]serialization
::    to/from json from types stored in courier sur.
::
/-  *versioned-state, sur=chat-db
|%
++  fill-out-minimal-fragment
  |=  [frag=minimal-fragment:sur =path =msg-id:sur index=@ud]
  ^-  msg-part:sur
  [path msg-id index content.frag reply-to.frag metadata.frag timestamp.msg-id]
++  get-full-message
  |=  [tbl=messages-table:sur =msg-id:sur]
  ^-  message:sur
  =/  index  0
  =/  result=message:sur  *message:sur
  |-
  ?~  (~(get by tbl) [msg-id index])
    result
  $(index +(index), result (snoc result (~(got by tbl) [msg-id index])))
::
::  poke actions
::
++  create-path
  ::  :chat-db &action [%create-path [/a/path/to/a/chat ~ %chat]]
  |=  [act=create-path-action:sur state=state-0 =bowl:gall]
  ^-  (quip card state-0)
  =/  row=path-row:sur   :+
    path.act
    metadata.act
    type.act
  =.  paths-table.state  (~(put by paths-table.state) path.act row)
  [~ state]
++  leave-path
  ::  :chat-db &action [%leave-path /a/path/to/a/chat]
  |=  [=path state=state-0 =bowl:gall]
  ^-  (quip card state-0)
  =.  paths-table.state  (~(del by paths-table.state) path)
  [~ state]
++  insert
::  :chat-db &action [%insert [/a/path/to/a/chat (limo [[[%plain 'hello'] ~ ~] ~])]]
  |=  [msg-act=insert-message-action:sur state=state-0 =bowl:gall]
  ^-  (quip card state-0)
  =/  msg-id=msg-id:sur   [now.bowl our.bowl]
  =/  intermediate-fn     |=(a=minimal-fragment:sur (fill-out-minimal-fragment a path.msg-act msg-id (need (find ~[a] fragments.msg-act))))
  =/  msg=message:sur     (turn fragments.msg-act intermediate-fn)
  =/  key-vals            (turn msg |=(a=msg-part:sur [[msg-id.a msg-part-id.a] a]))
  =.  messages-table.state  (gas:msgon:sur messages-table.state key-vals)
  [~ state]
++  edit
  |=  [[=msg-id:sur msg-act=insert-message-action:sur] state=state-0 =bowl:gall]
  ^-  (quip card state-0)
  [~ state]
++  delete
::  :chat-db &action [%delete [timestamp=~2023.1.24..22.54.50..8f5d sender=~zod]]
  |=  [=msg-id:sur state=state-0 =bowl:gall]
  ^-  (quip card state-0)
  =/  part-counter=@ud  0
  =/  result
    |-
    ?.  (has:msgon:sur messages-table.state `uniq-id:sur`[msg-id part-counter])
      messages-table.state
    $(part-counter +(part-counter), messages-table.state +:(del:msgon:sur messages-table.state [msg-id part-counter]))
  =.  messages-table.state  result
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
      :~  path+s+(spat path.path-row)
          metadata+s+'TODO not implemented'
          type+s+type.path-row
      ==
  --
--
