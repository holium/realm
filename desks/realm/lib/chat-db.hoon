::  chat-db [realm]:
::
::  Chat message lib within Realm. Mostly handles [de]serialization
::    to/from json from types stored in courier sur.
::
/-  *versioned-state, sur=chat-db
|%
::
::  random helpers
::
++  is-valid-inviter
  |=  [=path-row:sur peers=(list peer-row:sur) src=ship]
  ^-  ?
  :: add-peer pokes are only valid from:
  :: a ship within the peers list
  =/  src-peer  (snag 0 (skim peers |=(p=peer-row:sur =(patp.p src)))) :: will crash if src not in list
  :: AND
  :: any peer-ship if set to %anyone
  :: OR a ship whose role matches the path-row `invites` setting
  :: OR whose role is the %host
  |(=(invites.path-row %anyone) =(role.src-peer invites.path-row) =(role.src-peer %host))
::
++  fill-out-minimal-fragment
  |=  [frag=minimal-fragment:sur =path =msg-id:sur index=@ud updated-at=@da expires-at=@da]
  ^-  msg-part:sur
  [path msg-id index content.frag reply-to.frag metadata.frag timestamp.msg-id updated-at expires-at]
::
++  get-full-message
  |=  [tbl=messages-table:sur =msg-id:sur]
  ^-  message:sur
  =/  index  0
  =/  result=message:sur  *message:sur
  |-
  ?~  (has:msgon:sur tbl [msg-id index])
    result
  $(index +(index), result (snoc result (got:msgon:sur tbl [msg-id index])))
::
++  remove-message-from-table
  |=  [tbl=messages-table:sur =msg-id:sur]
  ^-  [messages-table:sur (list uniq-id:sur)]
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
++  remove-messages-for-path-before
  |=  [tbl=messages-table:sur =path before=time]
  ^-  tbl-and-ids:sur
  =/  start=uniq-id:sur  [[before ~zod] 0]
  =/  badkeys=(list uniq-id:sur)
    %+  turn
      %+  skim
        (tap:msgon:sur (lot:msgon:sur tbl `start ~))
      |=(kv=[k=uniq-id:sur v=msg-part:sur] =(path.v.kv path))
    |=(kv=[k=uniq-id:sur v=msg-part:sur] k.kv)
  =/  index=@ud  0
  |-
  ?:  =(index (lent badkeys))
    [tbl badkeys]
  $(tbl +:(del:msgon:sur tbl (snag index badkeys)), index +(index))
::
++  make-msg-from-minimal-frags
  |=  [msg-act=insert-message-action:sur id=msg-id:sur updated-at=@da]
  ^-  message:sur
  =/  result        *message:sur
  =/  counter=@ud   0
  |-
  ?:  =(counter (lent fragments.msg-act)) :: stop condition
    result
  $(result (snoc result (fill-out-minimal-fragment (snag counter fragments.msg-act) path.msg-act id counter updated-at expires-at.msg-act)), counter +(counter))
::
++  add-message-to-table
  |=  [tbl=messages-table:sur msg-act=insert-message-action:sur sender=@p updated-at=@da]
  =/  msg=message:sur     (make-msg-from-minimal-frags msg-act [timestamp.msg-act sender] updated-at)
  =/  key-vals            (turn msg |=(a=msg-part:sur [[msg-id.a msg-part-id.a] a]))
  [(gas:msgon:sur tbl key-vals) msg]
::
++  expire-old-msgs
  |=  [state=state-0 now=@da]
  ^-  state-0
  =/  old-msgs
    ^-  (list [k=uniq-id:sur v=msg-part:sur])
    %+  skim
      :: TODO efficiency by lot:msgon:sur from the last del-log time
      :: since we know we checked then ?
      (tap:msgon:sur messages-table.state)
    |=([k=uniq-id:sur v=msg-part:sur] &(?!(=(*@da expires-at.v)) (gth now expires-at.v)))
  =/  index=@ud   0
  =/  len=@ud     (lent old-msgs)
  =/  tbl         messages-table.state
  =/  ids         *(list uniq-id:sur)
  =/  rm-result
    ^-  [messages-table:sur (list uniq-id:sur)]
    |-
    ?:  =(index len)
      [tbl ids]
    =/  current-key   k:(snag index old-msgs)
    $(index +(index), tbl +:(del:msgon:sur tbl current-key), ids (snoc ids current-key))

  =.  del-log.state         (log-deletes-for-msg-parts state ~ +:rm-result now)
  =.  messages-table.state  -:rm-result
  state
::
++  log-deletes-for-msg-parts
  |=  [state=state-0 p=(unit path) ids=(list uniq-id:sur) now=@da]
  ^-  del-log:sur
  =/  change-rows   
    %+  turn
      ids
    |=  a=uniq-id:sur
    =/  pat
      ?~  p  path:(got:msgon:sur messages-table.state a)
      (need p)
    [%del-messages-row pat a now]
  =/  index=@ud     0
  =/  len=@ud       (lent change-rows)
  =/  new-log       del-log.state
  |-
  ?:  =(index len)
    new-log
  ~&  (snag index change-rows)
                                                    :: adding index to now in order to ensure unique keys
  $(index +(index), new-log (put:delon:sur new-log `@da`(add now index) (snag index change-rows)))
::
++  messages-start-paths
  |=  [=bowl:gall]
  ^-  (list path)
  =/  len-three  (skim ~(val by sup.bowl) |=(a=[p=ship q=path] (gte (lent q.a) 3)))
  =/  matching  (skim len-three |=(a=[p=ship q=path] =([-:q.a +<:q.a +>-:q.a ~] /db/messages/start)))
  (turn matching |=(a=[p=ship q=path] q.a))
++  delete-logs-for-path :: used for clearing del-log when the path itself is deleted, to keep things clean
  |=  [state=state-0 =path]
  ^-  del-log:sur
  =/  removables
    %+  skim :: get all the [k v] pairs of logs we can remove
      (tap:delon:sur del-log.state)
    |=  [k=time v=db-change-type:sur]
    ?+  -.v  %.n :: only possibly remove messages and peers row since we don't want to remove the log that we removed the whole path
      %del-messages-row   =(path path.v)
      %del-peers-row      =(path path.v)
    ==
  =/  index=@ud     0
  =/  len=@ud       (lent removables)
  =/  new-log       del-log.state
  |-
  ?:  =(index len)
    new-log
  $(index +(index), new-log +:(del:delon:sur new-log -:(snag index removables)))
::
::  poke actions
::
:: MUST EXPLICITLY INCLUDE SELF, this function will not add self into peers list
++  create-path
::chat-db &db-action [%create-path /a/path/to/a/chat ~ %chat *@da *@da ~ %host *@dr ~[[~zod %host] [~bus %member]]]
  |=  [[row=path-row:sur peers=ship-roles:sur] state=state-0 =bowl:gall]
  ^-  (quip card state-0)

  ?>  ?!((~(has by paths-table.state) path.row))  :: ensure the path doesn't already exist!!!
  =.  paths-table.state  (~(put by paths-table.state) path.row row)

  =/  thepeers=(list peer-row:sur)
    %+  turn
      peers
    |=([s=@p role=@tas] [path.row s role now.bowl now.bowl])

  =.  peers-table.state  (~(put by peers-table.state) path.row thepeers)
  =/  thechange  chat-db-change+!>((limo [[%add-row %paths row] (turn thepeers |=(p=peer-row:sur [%add-row %peers p]))]))
  =/  gives  :~
    [%give %fact [/db (weld /db/path path.row) ~] thechange]
  ==
  [gives state]
::
++  edit-path
::  :chat-db &db-action [%edit-path /a/path/to/a/chat ~ %.n %host *@dr]
  |=  [[=path metadata=(map cord cord) peers-get-backlog=? invites=@tas max-expires-at-duration=@dr] state=state-0 =bowl:gall]
  ^-  (quip card state-0)

  =/  original-peers-list   (~(got by peers-table.state) path)
  :: edit-path-metadata pokes are only valid from the ship which is
  :: the %host of the path
  =/  host-peer-row         (snag 0 (skim original-peers-list |=(p=peer-row:sur =(role.p %host))))
  ?>  =(patp.host-peer-row src.bowl)

  =/  row=path-row:sur        (~(got by paths-table.state) path)
  =.  updated-at.row          now.bowl
  =.  metadata.row            metadata
  =.  peers-get-backlog.row   peers-get-backlog
  =.  invites.row             invites
  =.  max-expires-at-duration.row   max-expires-at-duration

  =.  paths-table.state  (~(put by paths-table.state) path row)

  =/  thechange  chat-db-change+!>(~[[%upd-paths-row row]])
  =/  gives  :~
    [%give %fact [/db (weld /db/path path) ~] thechange]
  ==
  [gives state]
::
++  edit-path-pins
::  :chat-db &db-action [%edit-path-pins /a/path/to/a/chat ~]
  |=  [[=path =pins:sur] state=state-0 =bowl:gall]
  ^-  (quip card state-0)

  =/  original-peers-list   (~(got by peers-table.state) path)
  :: edit-path-pins pokes are only valid from the ship which is
  :: the %host of the path
  =/  host-peer-row         (snag 0 (skim original-peers-list |=(p=peer-row:sur =(role.p %host))))
  ?>  =(patp.host-peer-row src.bowl)

  =/  row=path-row:sur   (~(got by paths-table.state) path)
  =.  pins.row           pins
  =.  updated-at.row     now.bowl
  =.  paths-table.state  (~(put by paths-table.state) path row)

  =/  thechange  chat-db-change+!>(~[[%upd-paths-row row]])
  =/  gives  :~
    [%give %fact [/db (weld /db/path path) ~] thechange]
  ==
  [gives state]
::
++  leave-path
::  :chat-db &db-action [%leave-path /a/path/to/a/chat]
  |=  [=path state=state-0 =bowl:gall]
  ^-  (quip card state-0)
  ?>  =(our.bowl src.bowl)  :: leave pokes are only valid from ourselves. if others want to kick us, that is a different matter
  =.  paths-table.state  (~(del by paths-table.state) path)
  =.  peers-table.state  (~(del by peers-table.state) path)
  =.  messages-table.state  (remove-messages-for-path messages-table.state path)
  :: for now we are assuming that subscribed clients are intelligent
  :: enough to realize that a %del-paths-row also means remove the
  :: related messages and peers
  =/  change-row      [%del-paths-row path now.bowl]
  =.  del-log.state   (delete-logs-for-path state path)
  =.  del-log.state   (put:delon:sur del-log.state now.bowl change-row)
  =/  thechange       chat-db-change+!>(~[change-row])
  =/  gives  :~
    [%give %fact [/db (weld /db/path path) ~] thechange]
  ==
  [gives state]
::
++  insert
:: :chat-db &db-action [%insert ~2023.2.2..23.11.10..234a /a/path/to/a/chat (limo [[[%plain '0'] ~ ~] [[%plain '1'] ~ ~] [[%plain '1'] ~ ~] [[%plain '3'] ~ ~] ~]) ~2000.1.1]
  |=  [msg-act=insert-message-action:sur state=state-0 =bowl:gall]
  ^-  (quip card state-0)

  =/  thepeers   (silt (turn (~(got by peers-table.state) path.msg-act) |=(a=peer-row:sur patp.a)))
  ?>  (~(has in thepeers) src.bowl)  :: messages can only be inserted by ships which are in the peers-list
  
  :: logic to force-set expires-at on messages when the path has a
  :: max-expires-at-duration specified
  =/  thepath   (~(got by paths-table.state) path.msg-act)
  =/  max-exp   (add max-expires-at-duration.thepath now.bowl)
  =.  expires-at.msg-act
    ?:  =(max-expires-at-duration.thepath *@dr)  expires-at.msg-act  :: allow any expires-at if the max-expires-at-duration is "null"
    ?:  =(expires-at.msg-act *@da)  max-exp               :: otherwise, if the expires-at is "unset" set it to the max expiration
    ?:  (lth expires-at.msg-act now.bowl)  max-exp        :: otherwise, if the expires-at is in the past, set to max-expiration
    ?:  (lte expires-at.msg-act max-exp)  expires-at.msg-act :: otherwise, ensure the expires-at is less than the max-expiration
    max-exp  :: else, set it to the max-expiration based on the max-expires-at-duration defined in thepath

  =/  add-result  (add-message-to-table messages-table.state msg-act src.bowl timestamp.msg-act)
  =.  messages-table.state  -.add-result
  =/  thechange  chat-db-change+!>((turn +.add-result |=(a=msg-part:sur [%add-row [%messages a]])))
  :: message-paths is all the sup.bowl paths that start with
  :: /db/messages/start since every new message will need to go out to
  :: those subscriptions
  =/  message-paths  (messages-start-paths bowl)
  =/  gives  :~
    [%give %fact (weld message-paths (limo [/db (weld /db/path path.msg-act) ~])) thechange]
  ==
  [gives state]
::
++  insert-backlog
:: :chat-db &db-action [%insert-backlog some msg-part]
  |=  [msg=msg-part:sur state=state-0 =bowl:gall]
  ^-  (quip card state-0)
  ::
  :: backlog-pokes are only allowed if all the following are true:
  ::
  :: we already have that path in our table, and the associated peers
  =/  pathrow   (~(got by paths-table.state) path.msg)
  =/  peers     (~(got by peers-table.state) path.msg)
  :: the created-at of our peer-row for the path is gth
  :: created-at.msg (because the message was from *before* we
  :: joined the chat)
  =/  us-peer   (snag 0 (skim peers |=(p=peer-row:sur =(patp.p our.bowl))))
  ?>  (gth created-at.us-peer created-at.msg)
  :: has to be from a ship that has invite-potential in the path
  ?>  (is-valid-inviter pathrow peers src.bowl)
  :: the path has to be %.y on peers-get-backlog
  ?>  peers-get-backlog.pathrow

  =.  messages-table.state  (put:msgon:sur messages-table.state [msg-id.msg msg-part-id.msg] msg)

  =/  thechange  chat-db-change+!>([%add-row %messages msg]~)
  :: message-paths is all the sup.bowl paths that start with
  :: /db/messages/start since every new message will need to go out to
  :: those subscriptions
  =/  message-paths  (messages-start-paths bowl)
  =/  gives  :~
    [%give %fact (weld message-paths (limo [/db (weld /db/path path.msg) ~])) thechange]
  ==
  [gives state]
::
++  edit
::  :chat-db &db-action [%edit [[~2023.2.2..23.11.10..234a ~zod] /a/path/to/a/chat (limo [[[%plain 'poop'] ~ ~] ~])]]
  |=  [[=msg-id:sur p=path fragments=(list minimal-fragment:sur)] state=state-0 =bowl:gall]
  ^-  (quip card state-0)

  ?>  =(sender.msg-id src.bowl)  :: edit pokes are only valid from the ship which is the original sender
  ?>  (has:msgon:sur messages-table.state [msg-id 0])  :: edit pokes are only valid if there is a fragment 0 in the table for the msg-id

  =/  original-expires-at  expires-at:(got:msgon:sur messages-table.state [msg-id 0])
  =/  remove-result  (remove-message-from-table messages-table.state msg-id)
  =.  messages-table.state  -.remove-result

  =/  add-result            (add-message-to-table messages-table.state [timestamp.msg-id p fragments original-expires-at] sender.msg-id now.bowl)
  =.  messages-table.state  -.add-result

  =/  thechange   chat-db-change+!>(~[[%upd-messages msg-id +.add-result]])
  :: message-paths is all the sup.bowl paths that start with
  :: /db/messages/start AND have a timestamp after the timestamp in the
  :: subscription path since they explicitly DONT care about the ones
  :: from earlier
  =/  all-message-paths  (messages-start-paths bowl)
  =/  message-paths  (skim all-message-paths |=(a=path (gth timestamp.msg-id `@da`(slav %da +>+>-:a))))
  =/  gives  :~
    [%give %fact (weld (limo [/db (weld /db/path p) ~]) message-paths) thechange]
  ==
  [gives state]
::
++  delete
::  :chat-db &db-action [%delete [timestamp=~2023.2.2..23.11.10..234a sender=~zod]]
  |=  [=msg-id:sur state=state-0 =bowl:gall]
  ^-  (quip card state-0)

  ?>  =(sender.msg-id src.bowl)  :: delete pokes are only valid from the ship which is the original sender
  ?>  (has:msgon:sur messages-table.state [msg-id 0])  :: delete pokes are only valid if there is a fragment 0 in the table for the msg-id

  =/  msg-part=msg-part:sur       (got:msgon:sur messages-table.state `uniq-id:sur`[msg-id 0])
  =/  remove-result  (remove-message-from-table messages-table.state msg-id)
  =.  messages-table.state  -.remove-result

  =.  del-log.state   (log-deletes-for-msg-parts state `path.msg-part +.remove-result now.bowl)

  =/  row=path-row:sur    (~(got by paths-table.state) path.msg-part)
  =/  pinned              (~(has in pins.row) msg-id)
  =.  pins.row        ?:(pinned (~(del in pins.row) msg-id) pins.row)
  =.  updated-at.row  ?:(pinned now.bowl updated-at.row)
  =.  paths-table.state
    ?:  pinned
      (~(put by paths-table.state) path.row row)
    paths-table.state

  =/  change-rows   (turn +.remove-result |=(a=uniq-id:sur [%del-messages-row path.row a now.bowl]))
  =/  thechange
    ?:  pinned
      chat-db-change+!>([[%upd-paths-row row] change-rows])
    chat-db-change+!>(change-rows)
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
++  delete-backlog
:: deletes all messages from all users before a certain time for a path
::chat-db &db-action [%delete-backlog path=/a/path/to/a/chat before=~2023.2.2..23.11.10..234a]
  |=  [[=path before=time] state=state-0 =bowl:gall]
  ^-  (quip card state-0)

  =/  peers     (~(got by peers-table.state) path)
  =/  host-peer  (snag 0 (skim peers |=(p=peer-row:sur =(%host role.p))))
  ?>  =(patp.host-peer src.bowl)  :: delete-backlog pokes are only valid from the host ship

  =/  remove-result=tbl-and-ids:sur  (remove-messages-for-path-before messages-table.state path before)
  =.  messages-table.state  tbl.remove-result

  =/  change-rows   (turn ids.remove-result |=(a=uniq-id:sur [%del-messages-row path a now.bowl]))
  =/  thechange     chat-db-change+!>(change-rows)
  =.  del-log.state   (log-deletes-for-msg-parts state `path ids.remove-result now.bowl)

  =/  gives  :~
    [%give %fact (weld (limo [/db (weld /db/path path) ~]) (messages-start-paths bowl)) thechange]
  ==
  [gives state]
::
++  add-peer
::  :chat-db &db-action [%add-peer [/a/path/to/a/chat ~bus]]
  |=  [act=[=path patp=ship] state=state-0 =bowl:gall]
  ^-  (quip card state-0)

  =/  original-peers-list   (~(got by peers-table.state) path.act)
  =/  pathrow               (~(got by paths-table.state) path.act)
  ?>  (is-valid-inviter pathrow original-peers-list src.bowl)

  =/  row=peer-row:sur   [
    path.act
    patp.act
    %member
    now.bowl
    now.bowl
  ]
  =/  peers  (snoc original-peers-list row)
  =.  peers-table.state  (~(put by peers-table.state) path.act peers)
  =/  thechange  chat-db-change+!>(~[[%add-row [%peers row]]])
  =/  gives  :~
    [%give %fact [/db (weld /db/path path.act) ~] thechange]
  ==
  [gives state]
::
++  kick-peer
::  :chat-db &db-action [%kick-peer /a/path/to/a/chat ~bus]
  |=  [act=[=path patp=ship] state=state-0 =bowl:gall]
  ^-  (quip card state-0)
  ?.  (~(has by paths-table.state) path.act)
    `state  :: do nothing if we get a kick-peer on a path we have already left

  =/  original-peers-list   (~(got by peers-table.state) path.act)
  :: kick-peer pokes are only valid from the ship which is the
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

  =/  change-row
    ?:  our-kicked
      :: for now we are assuming that subscribed clients are intelligent
      :: enough to realize that a %del-paths-row also means remove the
      :: related messages and peers
      [%del-paths-row path.act now.bowl]
    :: else just update the peers table
    [%del-peers-row path.act patp.act now.bowl]
  =.  del-log.state   ?:(our-kicked (delete-logs-for-path state path.act) del-log.state)
  =.  del-log.state   (put:delon:sur del-log.state now.bowl change-row)
  =/  thechange   chat-db-change+!>(~[change-row])

  =/  gives  :~
    [%give %fact [/db (weld /db/path path.act) ~] thechange]
  ==
  [gives state]
::
::  mini helper lib
::
++  from
  |%
  ++  start-lot
    :: this is very efficient, but does not capture the updated-at rows
    :: so we will use ++start (below) until this is necessary
    |=  [=msg-id:sur tbl=messages-table:sur]
    ^-  messages-table:sur
    =/  start=uniq-id:sur  [msg-id 0]
    (lot:msgon:sur tbl ~ `start)
  ::
  ++  start
    |=  [t=time tbl=messages-table:sur]
    ^-  messages-table:sur
    %+  gas:msgon:sur
      *messages-table:sur
    %+  skim
      (tap:msgon:sur tbl)
    |=([k=uniq-id:sur v=msg-part:sur] |((gth created-at.v t) (gth updated-at.v t)))
  ::
  ++  path-msgs
    |=  [tbl=messages-table:sur =path]
    ^-  messages-table:sur
    %+  gas:msgon:sur
      *messages-table:sur
    %+  skim
      (tap:msgon:sur tbl)
    |=([k=uniq-id:sur v=msg-part:sur] =(path.v path))
  ::
  ++  path-start
    |=  [t=time tbl=paths-table:sur]
    ^-  paths-table:sur
    %-  malt
    %+  skim
      ~(tap by tbl)
    |=([k=path v=path-row:sur] |((gth created-at.v t) (gth updated-at.v t)))
  ::
  ++  peer-start
    |=  [t=time tbl=peers-table:sur]
    ^-  peers-table:sur

    =/  individual-rows=(list peer-row)  (zing ~(val by tbl))
    =/  valid-rows
      %+  skim
        individual-rows
      |=(r=peer-row:sur |((gth created-at.r t) (gth updated-at.r t)))

    =/  index=@ud  0
    =/  len=@ud    (lent valid-rows)
    =/  result=peers-table:sur  *peers-table:sur
    |-
    ?:  =(index len)
      result
    =/  i  (snag index valid-rows)
    =/  pre  (~(get by result) path.i)
    =/  lis
    ?~  pre
      (limo ~[i])
    (snoc (need pre) i)
    $(result (~(put by result) path.i lis), index +(index))
  ++  paths-list
    |=  [tbl=paths-table:sur]
    ^-  (list path)
    (turn ~(val by tbl) |=(a=path-row:sur path.a))
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
++  encode
  =,  enjs:format
  |%
    ++  del-log
      |=  log=del-log:sur
      ^-  json
      :-  %a
      %+  turn  (tap:delon:sur log)
      |=  [k=@da v=db-change-type:sur]
      %-  pairs
      :~
        ['timestamp' (time k)]
        ['change' (individual-change v)]
      ==
    ::
    ++  all-tables
      |=  =tables:sur
      ^-  json
      %-  pairs
      %+  turn  tables
        |=  =table:sur
        ?-  -.table
          %paths      paths+(paths-table +.table)
          %messages   messages+(messages-table +.table)
          %peers      peers+(peers-table +.table)
        ==
    ::
    ++  paths-table
      |=  tbl=paths-table:sur
      ^-  json
      [%a ~(val by (~(run by tbl) path-row))]
    ::
    ++  peers-table
      |=  tbl=peers-table:sur
      ^-  json
      a+(zing (turn ~(val by tbl) |=(a=(list peer-row:sur) (turn a peer-row))))
    ::
    ++  messages-table
      |=  tbl=messages-table:sur
      ^-  json
      [%a (turn (tap:msgon:sur tbl) messages-row)]
    ::
    ++  changes
      |=  ch=db-change:sur
      ^-  json
      [%a (turn ch individual-change)]
    ::
    ++  individual-change
      |=  ch=db-change-type:sur
      %-  pairs
      ?-  -.ch
        %add-row
          :~(['type' %s -.ch] ['table' %s -.+.ch] ['row' (any-row db-row.ch)])
        %upd-messages
          :~
            ['type' %s %update]
            ['table' %s %messages]
            ['msg-id' (msg-id-to-json msg-id.ch)]
            ['message' a+(turn message.ch |=(m=msg-part:sur (messages-row [[msg-id.m msg-part-id.m] m])))]
          ==
        %upd-paths-row
          :~(['type' %s %update] ['table' %s %paths] ['row' (path-row path-row.ch)])
        %del-paths-row
          :~(['type' %s -.ch] ['table' %s %paths] ['row' s+(spat path.ch)] ['timestamp' (time timestamp.ch)])
        %del-peers-row
          :~(['type' %s -.ch] ['table' %s %peers] ['row' s+(spat path.ch)] ['ship' s+(scot %p ship.ch)] ['timestamp' (time timestamp.ch)])
        %del-messages-row
          :~
            ['type' %s -.ch]
            ['table' %s %messages]
            ['path' s+(spat path.ch)]
            ['msg-id' (msg-id-to-json msg-id.uniq-id.ch)]
            ['msg-part-id' (numb msg-part-id.uniq-id.ch)]
            ['timestamp' (time timestamp.ch)]
          ==
      ==
    ::
    ++  any-row
      |=  =db-row:sur
      ^-  json
      ?-  -.db-row
        %paths
          (path-row path-row.db-row)
        %messages
          (messages-row [msg-id.msg-part.db-row msg-part-id.msg-part.db-row] msg-part.db-row)
        %peers
          (peer-row peer-row.db-row)
      ==
    ::
    ++  path-row
      |=  =path-row:sur
      ^-  json
      %-  pairs
      :~  path+s+(spat path.path-row)
          metadata+(metadata-to-json metadata.path-row)
          type+s+type.path-row
          created-at+(time created-at.path-row)
          updated-at+(time updated-at.path-row)
          pins+a+(turn ~(tap in pins.path-row) msg-id-to-json)
          invites+s+invites.path-row
          peers-get-backlog+b+peers-get-backlog.path-row
          :: return as integer millisecond duration
          max-expires-at-duration+(numb (|=(t=@dr ^-(@ud (mul (div t ~s1) 1.000))) max-expires-at-duration.path-row))
      ==
    ::
    ++  messages-row
      |=  [k=uniq-id:sur =msg-part:sur]
      ^-  json
      %-  pairs
      :~  path+s+(spat path.msg-part)
          sender+s+(scot %p sender.msg-id.msg-part)
          msg-id+(msg-id-to-json msg-id.msg-part)
          msg-part-id+(numb msg-part-id.msg-part)
          content-type+(content-typeify content.msg-part)
          content-data+(content-dataify content.msg-part)
          reply-to+(reply-to-to-json reply-to.msg-part)
          metadata+(metadata-to-json metadata.msg-part)
          created-at+(time created-at.msg-part)
          updated-at+(time updated-at.msg-part)
          expires-at+(time expires-at.msg-part)
      ==
    ::
    ++  reply-to-to-json
      |=  =reply-to:sur
      ^-  json
      ?~  reply-to
        ~
      %-  pairs
      :~  path+[%s (spat -.+.reply-to)]
          msg-id+(msg-id-to-json +.+.reply-to)
      ==
    ::
    ++  content-typeify
      |=  =content:sur
      ^-  json
      ?+  -.content
        ::default here
        [%s `@t`-.content]
        %custom  [%s `@t`-.+.content]
      ==
    ::
    ++  content-dataify
      |=  =content:sur
      ?+  -.content
        ::default here
        [%s +.content]
        %ship     [%s `@t`(scot %p p.content)]
        %break    ~
        %custom   [%s +.+.content]
      ==
    ::
    ++  msg-id-to-json
      |=  =msg-id:sur
      ^-  json
      s+(spat ~[(scot %da timestamp.msg-id) (scot %p sender.msg-id)])
    ::
    ++  metadata-to-json
      |=  m=(map cord cord)
      ^-  json
      o+(~(rut by m) |=([k=cord v=cord] s+v))
    ::
    ++  peer-row
      |=  =peer-row:sur
      ^-  json
      %-  pairs
      :~  path+s+(spat path.peer-row)
          ship+s+(scot %p patp.peer-row)
          role+s+role.peer-row
          created-at+(time created-at.peer-row)
          updated-at+(time updated-at.peer-row)
      ==
  --
--
