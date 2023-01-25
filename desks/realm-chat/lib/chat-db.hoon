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
  ?~  (has:msgon:sur tbl [msg-id index])
    result
  $(index +(index), result (snoc result (got:msgon:sur tbl [msg-id index])))
++  remove-message-from-table
  |=  [tbl=messages-table:sur =msg-id:sur]
  =/  part-counter=@ud  0
  |-
  ?.  (has:msgon:sur tbl `uniq-id:sur`[msg-id part-counter])
    tbl
  $(part-counter +(part-counter), tbl +:(del:msgon:sur tbl [msg-id part-counter]))
++  add-message-to-table
  |=  [tbl=messages-table:sur msg-act=insert-message-action:sur now=@da sender=@p]
  =/  msg-id=msg-id:sur   [now sender]
  =/  intermediate-fn     |=(a=minimal-fragment:sur (fill-out-minimal-fragment a path.msg-act msg-id (need (find ~[a] fragments.msg-act))))
  =/  msg=message:sur     (turn fragments.msg-act intermediate-fn)
  =/  key-vals            (turn msg |=(a=msg-part:sur [[msg-id.a msg-part-id.a] a]))
  (gas:msgon:sur tbl key-vals)
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
  =/  peer=peer-row:sur   :+
    path.act
    our.bowl
    %host
  =.  peers-table.state  (~(put by peers-table.state) path.act [peer ~])
  =/  gives  :~
    [%give %fact [/db ~] db-change+!>(~[[%add-row [%paths row]] [%add-row [%peers [peer ~]]]])]
  ==
  [gives state]
++  leave-path
  ::  :chat-db &action [%leave-path /a/path/to/a/chat]
  |=  [=path state=state-0 =bowl:gall]
  ^-  (quip card state-0)
  =.  paths-table.state  (~(del by paths-table.state) path)
  =.  peers-table.state  (~(del by peers-table.state) path)
  [~ state]
++  insert
::  :chat-db &action [%insert [/a/path/to/a/chat (limo [[[%plain 'hello'] ~ ~] ~])]]
  |=  [msg-act=insert-message-action:sur state=state-0 =bowl:gall]
  ^-  (quip card state-0)
  =.  messages-table.state  (add-message-to-table messages-table.state msg-act now.bowl our.bowl)
  [~ state]
++  edit
::  :chat-db &action [%edit [[~2023.1.25..18.29.42..0a77 ~zod] [/a/path/to/a/chat (limo [[[%plain 'poop'] ~ ~] ~])]]]
  |=  [[=msg-id:sur msg-act=insert-message-action:sur] state=state-0 =bowl:gall]
  ^-  (quip card state-0)
  =.  messages-table.state  (remove-message-from-table messages-table.state msg-id)
  =.  messages-table.state  (add-message-to-table messages-table.state msg-act timestamp.msg-id sender.msg-id)
  [~ state]
++  delete
::  :chat-db &action [%delete [timestamp=~2023.1.25..18.29.42..0a77 sender=~zod]]
  |=  [=msg-id:sur state=state-0 =bowl:gall]
  ^-  (quip card state-0)
  =.  messages-table.state  (remove-message-from-table messages-table.state msg-id)
  [~ state]
++  add-peer
::  :chat-db &action [%add-peer [/a/path/to/a/chat ~bus]]
  |=  [act=[=path patp=ship] state=state-0 =bowl:gall]
  ^-  (quip card state-0)
  =/  row=peer-row:sur   :+
    path.act
    patp.act
    %member
  =/  peers  (snoc (~(got by peers-table.state) path.act) row)
  =.  peers-table.state  (~(put by peers-table.state) path.act peers)
  [~ state]
++  kick-peer
::  :chat-db &action [%kick-peer [/a/path/to/a/chat ~bus]]
  |=  [act=[=path patp=ship] state=state-0 =bowl:gall]
  ^-  (quip card state-0)
  =/  peers  (skip (~(got by peers-table.state) path.act) |=(a=peer-row:sur =(patp.a patp.act)))
  =.  peers-table.state  (~(put by peers-table.state) path.act peers)
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
    ++  db-change :: encodes for on-watch
      |=  db=db-change:sur
      ^-  json
      (changes:encode db)
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
    ::
    ++  changes
      |=  ch=db-change:sur
      ^-  json
      :: TODO actually convert messages table to json
      [%a (turn ch |=(a=[=db-change-type:sur =db-row:sur] (pairs :~(['type' s+db-change-type.a] ['table' %s -.db-row.a] ['row' (any-row db-row.a)]))))]
    ++  any-row
      |=  =db-row:sur
      ^-  json
      ?-  -.db-row
        %paths
          (path-row path-row.db-row)
        %messages
          (messages-row msg-part.db-row)
        %peers
          (peer-row peer-row.db-row)
      ==
    ++  path-row
      |=  =path-row:sur
      ^-  json
      %-  pairs
      :~  path+s+(spat path.path-row)
          metadata+s+'TODO not implemented'
          type+s+type.path-row
      ==
    ++  messages-row
      |=  =msg-part:sur
      ^-  json
      %-  pairs
      :~  path+s+(spat path.msg-part)
          msg-id+a+~[s+(scot %da timestamp.msg-id.msg-part) s+(scot %p sender.msg-id.msg-part)]
          msg-part-id+n+(scot %ud msg-part-id.msg-part)
          content+s+'TODO'
          reply-to+s+'TODO'
          metadata+s+'TODO'
          timestamp+s+(scot %da timestamp.msg-part)
      ==
    ++  peer-row
      |=  =peer-row:sur
      ^-  json
      %-  pairs
      :~  path+s+(spat path.peer-row)
          ship+s+(scot %p patp.peer-row)
          role+s+role.peer-row
      ==
  --
--
