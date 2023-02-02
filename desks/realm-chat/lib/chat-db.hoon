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
  =/  ids  *(list uniq-id:sur)
  |-
  ?.  (has:msgon:sur tbl `uniq-id:sur`[msg-id part-counter])
    [tbl ids]
  $(part-counter +(part-counter), tbl +:(del:msgon:sur tbl [msg-id part-counter]), ids (snoc ids [msg-id part-counter]))
::
++  remove-messages-for-path
  |=  [tbl=messages-table:sur =path]
  =/  badkvs  (skim (tap:msgon:sur tbl) |=(kv=[k=uniq-id:sur v=msg-part:sur] =(path.v.kv path)))
  |-
  ?:  =(0 (lent badkvs))
    tbl
  =/  current  (snag 0 badkvs)
  $(tbl +:(del:msgon:sur tbl -.current), badkvs +:badkvs)
::
++  add-message-to-table
  |=  [tbl=messages-table:sur msg-act=insert-message-action:sur sender=@p]
  =/  msg-id=msg-id:sur   [timestamp.msg-act sender]
  =/  intermediate-fn     |=(a=minimal-fragment:sur (fill-out-minimal-fragment a path.msg-act msg-id (need (find ~[a] fragments.msg-act))))
  =/  msg=message:sur     (turn fragments.msg-act intermediate-fn)
  =/  key-vals            (turn msg |=(a=msg-part:sur [[msg-id.a msg-part-id.a] a]))
  [(gas:msgon:sur tbl key-vals) msg]
++  messages-start-paths
  |=  [=bowl:gall]
  ^-  (list path)
  =/  len-three  (skim ~(val by sup.bowl) |=(a=[p=ship q=path] (gte (lent q.a) 3)))
  =/  matching  (skim len-three |=(a=[p=ship q=path] =([-:q.a +<:q.a +>-:q.a ~] /db/messages/start)))
  (turn matching |=(a=[p=ship q=path] q.a))
::
::  poke actions
::
++  create-path
  ::  :chat-db &action [%create-path /a/path/to/a/chat ~ %chat]
  |=  [act=create-path-action:sur state=state-0 =bowl:gall]
  ^-  (quip card state-0)
  =/  row=path-row:sur   :+
    path.act
    metadata.act
    type.act
  =.  paths-table.state  (~(put by paths-table.state) path.act row)
  ~&  >  '%chat-db: new path created'
  ~&  >  path.act

  :: if this signal comes from ourselves, we are the host, but if it
  :: comes from elsewhere, we are being invited, and they are the host
  =/  thepeers
    ?:  =(src.bowl our.bowl)
      =/  peer=peer-row:sur   :+
        path.act
        our.bowl
        %host
      [peer ~]

    :: else, signal came from not-us
    =/  us=peer-row:sur   :+
      path.act
      our.bowl
      %member
    =/  them=peer-row:sur   :+
      path.act
      src.bowl
      %host
    [them us ~]

  =.  peers-table.state  (~(put by peers-table.state) path.act thepeers)
  =/  thechange  db-change+!>((limo [[%add-row %paths row] [%add-row %peers thepeers] ~]))
  =/  gives  :~
    [%give %fact [/db (weld /db/path path.act) ~] thechange]
  ==
  [gives state]
::
++  leave-path
  ::  :chat-db &action [%leave-path /a/path/to/a/chat]
  |=  [=path state=state-0 =bowl:gall]
  ^-  (quip card state-0)
  ?>  =(our.bowl src.bowl)  :: leave signals are only valid from ourselves. if others want to kick us, that is a different matter
  =.  paths-table.state  (~(del by paths-table.state) path)
  =.  peers-table.state  (~(del by peers-table.state) path)
  =.  messages-table.state  (remove-messages-for-path messages-table.state path)
  =/  thechange  db-change+!>(~[[%del-row %paths path] [%del-row %peers path]])
  =/  gives  :~
    [%give %fact [/db (weld /db/path path) ~] thechange]
  ==
  [gives state]
::
++  insert
::  :chat-db &action [%insert ~2023.2.2..23.11.10..234a /a/path/to/a/chat (limo [[[%plain 'hello'] ~ ~] ~])]
  |=  [msg-act=insert-message-action:sur state=state-0 =bowl:gall]
  ^-  (quip card state-0)

  =/  thepeers   (silt (turn (~(got by peers-table.state) path.msg-act) |=(a=peer-row:sur patp.a)))
  ?>  (~(has in thepeers) src.bowl)  :: messages can only be inserted by ships which are in the peers-list

  =/  add-result  (add-message-to-table messages-table.state msg-act src.bowl)
  =.  messages-table.state  -.add-result
  =/  thechange  db-change+!>((turn +.add-result |=(a=msg-part:sur [%add-row [%messages a]])))
  :: message-paths is all the sup.bowl paths that start with
  :: /db/messages/start since every new message will need to go out to
  :: those subscriptions
  =/  message-paths  (messages-start-paths bowl)
  =/  gives  :~
    [%give %fact (weld message-paths (limo [/db (weld /db/path path.msg-act) ~])) thechange]
  ==
  [gives state]
::
++  edit
::  :chat-db &action [%edit [[~2023.2.2..23.11.10..234a ~zod] [~2023.2.2..23.11.10..234a /a/path/to/a/chat (limo [[[%plain 'poop'] ~ ~] ~])]]]
  |=  [[=msg-id:sur msg-act=insert-message-action:sur] state=state-0 =bowl:gall]
  ^-  (quip card state-0)

  ?>  =(sender.msg-id src.bowl)  :: edit signals are only valid from the ship which is the original sender

  =/  remove-result  (remove-message-from-table messages-table.state msg-id)
  =/  changes=db-change:sur  (turn +.remove-result |=(a=uniq-id:sur [%del-row %messages a]))
  =.  messages-table.state  -.remove-result

  =/  add-result            (add-message-to-table messages-table.state msg-act sender.msg-id)
  =.  messages-table.state  -.add-result
  =/  thechange   db-change+!>((weld changes `db-change:sur`(turn +.add-result |=(a=msg-part:sur [%add-row [%messages a]]))))
  :: message-paths is all the sup.bowl paths that start with
  :: /db/messages/start AND have a timestamp after the timestamp in the
  :: subscription path since they explicitly DONT care about the ones
  :: from earlier
  =/  all-message-paths  (messages-start-paths bowl)
  =/  message-paths  (skim all-message-paths |=(a=path (gth timestamp.msg-id `@da`(slav %da +>+>-:a))))
  =/  gives  :~
    [%give %fact (weld (limo [/db (weld /db/path path.msg-act) ~]) message-paths) thechange]
  ==
  [gives state]
::
++  delete
::  :chat-db &action [%delete [timestamp=~2023.2.2..23.11.10..234a sender=~zod]]
  |=  [=msg-id:sur state=state-0 =bowl:gall]
  ^-  (quip card state-0)

  ?>  =(sender.msg-id src.bowl)  :: delete signals are only valid from the ship which is the original sender

  =/  msg-part=msg-part:sur       (got:msgon:sur messages-table.state `uniq-id:sur`[msg-id 0])
  =/  remove-result  (remove-message-from-table messages-table.state msg-id)
  =.  messages-table.state  -.remove-result
  =/  thechange   db-change+!>((turn +.remove-result |=(a=uniq-id:sur [%del-row %messages a])))
  :: message-paths is all the sup.bowl paths that start with
  :: /db/messages/start AND have a timestamp after the timestamp in the
  :: subscription path since they explicitly DONT care about the ones
  :: from earlier
  =/  all-message-paths  (messages-start-paths bowl)
  =/  message-paths  (skim all-message-paths |=(a=path (gth timestamp.msg-id `@da`(slav %da +>+>-:a))))
  =/  gives  :~
    [%give %fact (weld (limo [/db (weld /db/path path.msg-part) ~]) message-paths) thechange]
  ==
  [gives state]
::
++  add-peer
::  :chat-db &action [%add-peer [/a/path/to/a/chat ~bus]]
  |=  [act=[=path patp=ship] state=state-0 =bowl:gall]
  ^-  (quip card state-0)

  =/  original-peers-list   (~(got by peers-table.state) path.act)
  :: add-peer signals are only valid from the ship which is the
  :: %host of the path
  =/  host-peer-row         (snag 0 (skim original-peers-list |=(p=peer-row:sur =(role.p %host))))
  ?>  =(patp.host-peer-row src.bowl)

  =/  row=peer-row:sur   :+
    path.act
    patp.act
    %member
  =/  peers  (snoc (~(got by peers-table.state) path.act) row)
  =.  peers-table.state  (~(put by peers-table.state) path.act peers)
  =/  thechange  db-change+!>(~[[%del-row %peers path.act] [%add-row [%peers peers]]])
  =/  gives  :~
    [%give %fact [/db (weld /db/path path.act) ~] thechange]
  ==
  [gives state]
++  kick-peer
::  :chat-db &action [%kick-peer /a/path/to/a/chat ~bus]
  |=  [act=[=path patp=ship] state=state-0 =bowl:gall]
  ^-  (quip card state-0)
  ?.  (~(has by paths-table.state) path.act)
    `state  :: do nothing if we get a kick-peer on a path we have already left

  =/  original-peers-list   (~(got by peers-table.state) path.act)
  :: kick-peer signals are only valid from the ship which is the
  :: %host of the path, OR from the ship being kicked (kicking yourself)
  =/  host-peer-row         (snag 0 (skim original-peers-list |=(p=peer-row:sur =(role.p %host))))
  ?>  |(=(patp.host-peer-row src.bowl) =(src.bowl patp.act))

  =/  peers  (skip (~(got by peers-table.state) path.act) |=(a=peer-row:sur =(patp.a patp.act)))
  =/  our-kicked  =(our.bowl patp.act)

  :: remove from all tables if we were the one kicked
  :: otherwise, only update the peers-table
  =.  peers-table.state  ?:(our-kicked (~(del by peers-table.state) path.act) (~(put by peers-table.state) path.act peers))
  =.  paths-table.state  ?:(our-kicked (~(del by paths-table.state) path.act) paths-table.state)
  =.  messages-table.state  ?:(our-kicked (remove-messages-for-path messages-table.state path.act) messages-table.state)

  =/  thechange
    ?:  our-kicked
      :: for now we are assuming that subscribed clients are intelligent
      :: enough to realize that a %del-row %paths also means remove the
      :: related messages
      db-change+!>(~[[%del-row %peers path.act] [%del-row %paths path.act]])
    :: else just update the peers table
    db-change+!>(~[[%del-row %peers path.act] [%add-row %peers peers]])

  =/  gives  :~
    [%give %fact [/db (weld /db/path path.act) ~] thechange]
  ==
  [gives state]
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
    =/  start=uniq-id:sur  [msg-id 0]
    =/  kvs  (tap:msgon:sur (lot:msgon:sur tbl `start ~))
    (turn kvs |=(a=[k=uniq-id:sur v=msg-part:sur] v.a))
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
      [%a (turn ch individual-change)]
    ++  individual-change
      |=  ch=db-change-type:sur
      %-  pairs
      ?-  -.ch
        %add-row
          :~(['type' %s -.ch] ['table' %s -.+.ch] ['row' (any-row db-row.ch)])
        %del-row
          ?-  -.+.ch
            %paths
              :~(['type' %s -.ch] ['table' %s -.+.ch] ['row' s+(spat path.ch)])
            %peers
              :~(['type' %s -.ch] ['table' %s -.+.ch] ['row' s+(spat path.ch)])
            %messages
              :~
                ['type' %s -.ch]
                ['table' %s -.+.ch]
                ['msg-id' a+~[s+(scot %da timestamp.msg-id.uniq-id.ch) s+(scot %p sender.msg-id.uniq-id.ch)]]
                ['msg-part-id' n+(scot %ud msg-part-id.uniq-id.ch)]
              ==
          ==
      ==
    ++  any-row
      |=  =db-row:sur
      ^-  json
      ?-  -.db-row
        %paths
          (path-row path-row.db-row)
        %messages
          (messages-row msg-part.db-row)
        %peers
          a+(turn peers.db-row peer-row)
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
