::  realm-chat [realm]:
::
::  Chat message lib within Realm. Mostly handles [de]serialization
::    to/from json from types stored in realm-chat sur.
::
/-  *realm-chat, db=chat-db, notify
/+  notif-lib=notify
|%
::
:: helpers
::
++  scry-messages-for-path
  |=  [=path =bowl:gall]
  ^-  (list [k=uniq-id:db v=msg-part:db])
  =/  paths  (weld /(scot %p our.bowl)/chat-db/(scot %da now.bowl)/db/messages-for-path path)
  =/  tbls
    .^
      db-dump:db
      %gx
      (weld paths /noun)
    ==
  =/  tbl  `table:db`(snag 0 tables.tbls)
  ?+  -.tbl  !!
    %messages
      (tap:msgon:db messages-table.tbl)
  ==
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
::
++  into-backlog-msg-poke
  |=  [m=msg-part:db =ship]
  [%pass /dbpoke %agent [ship %chat-db] %poke %db-action !>([%insert-backlog m])]
::
++  into-insert-message-poke
  |=  [p=peer-row:db act=[=path fragments=(list minimal-fragment:db) expires-in=@dr] ts=@da]
  =/  exp-at=@da  ?:  =(expires-in.act *@dr)
    *@da
  (add ts expires-in.act)
  [%pass /dbpoke %agent [patp.p %chat-db] %poke %db-action !>([%insert ts path.act fragments.act exp-at])]
::
++  into-edit-message-poke
  |=  [p=peer-row:db act=edit-message-action:db]
  [%pass /dbpoke %agent [patp.p %chat-db] %poke %db-action !>([%edit act])]
::
++  into-delete-backlog-poke
  |=  [p=peer-row:db =path now=time]
  [%pass /dbpoke %agent [patp.p %chat-db] %poke %db-action !>([%delete-backlog path now])]
::
++  into-delete-message-poke
  |=  [p=peer-row:db =msg-id:db]
  [%pass /dbpoke %agent [patp.p %chat-db] %poke %db-action !>([%delete msg-id])]
::
++  into-all-peers-kick-pokes
  |=  [kickee=ship peers=(list peer-row:db)]
  ^-  (list card)
  %+  turn
    peers
  |=(p=peer-row:db (into-kick-peer-poke patp.p kickee path.p))
::
++  into-kick-peer-poke
  |=  [target=ship kickee=ship =path]
  ^-  card
  [%pass /dbpoke %agent [target %chat-db] %poke %db-action !>([%kick-peer path kickee])]
::
++  create-path-db-poke
  |=  [=ship row=path-row:db peers=ship-roles:db]
  ^-  card
  [%pass /dbpoke %agent [ship %chat-db] %poke %db-action !>([%create-path row peers])]
::
++  into-add-peer-pokes
  |=  [s=ship peers=(list ship) =path]
  ^-  (list card)
  %+  turn
    %+  skip
      peers
    |=(p=ship =(p s)) :: skip the peer who matches the root-ship that we are poking
  |=(peer=ship [%pass /dbpoke %agent [s %chat-db] %poke %db-action !>([%add-peer path peer])])
::
++  push-notification-card
  |=  [=bowl:gall state=state-0 chat-path=path subtitle=@t content=@t]
  ^-  card
  =/  note=notification:notify
  ^-  notification:notify
    [
      app-id=app-id.state
      data=[path=(spat chat-path) member-meta=*mem-meta:notify]
      subtitle=(malt ~[['en' subtitle]])
      contents=(malt ~[['en' content]])
    ]
  ::  send http request
  ::
  =/  =header-list:http    ['Content-Type' 'application/json']~
  =|  =request:http
  :: TODO include the unread count in the push notif (perhaps global?)
  =:  method.request       %'POST'
      url.request          'https://onesignal.com/api/v1/notifications'
      header-list.request  header-list
      body.request
        :-  ~
        %-  as-octt:mimes:html
        %-  en-json:html
        %+  request:enjs:notif-lib
          note
        devices.state
  ==

  [%pass /push-notification/(scot %da now.bowl) %arvo %i %request request *outbound-config:iris]
::
::  poke actions
::
++  create-chat
::realm-chat &action [%create-chat ~ %chat ~[~bus ~dev] %host *@dr]
  |=  [act=create-chat-data state=state-0 =bowl:gall]
  ^-  (quip card state-0)
  =/  chat-path  /realm-chat/(scot %uv (sham [our.bowl now.bowl]))
  =/  t=@da  now.bowl
  =/  pathrow=path-row:db  [chat-path metadata.act type.act t t ~ invites.act %.n max-expires-at-duration.act]
  =/  all-ships
    ?:  (~(has in (silt peers.act)) our.bowl)  peers.act
    [our.bowl peers.act]
  =/  all-peers=ship-roles:db  (turn all-ships |=(s=ship [s ?:(=(s our.bowl) %host %member)]))

  =/  cards=(list card)
    %+  turn
      all-peers
    |=  [s=ship role=@tas]
    (create-path-db-poke s pathrow all-peers)
  [cards state]
::
++  edit-chat
::  :realm-chat &action [%edit-chat /realm-chat/path-id ~ %.n %host *@dr]
  |=  [act=[=path metadata=(map cord cord) peers-get-backlog=? invites=@tas max-expires-at-duration=@dr] state=state-0 =bowl:gall]
  ^-  (quip card state-0)

  =/  pathpeers  (scry-peers path.act bowl)

  =/  cards  
    :: we poke all peers/members' db with edit-path (including ourselves)
    %:  turn
      pathpeers
      |=(p=peer-row:db [%pass /dbpoke %agent [patp.p %chat-db] %poke %db-action !>([%edit-path act])])
    ==
  [cards state]
::
++  pin-message
::  :realm-chat &action [%pin-message /realm-chat/path-id [*@da ~zod] %.y]
  |=  [act=[=path =msg-id:db pin=?] state=state-0 =bowl:gall]
  ^-  (quip card state-0)

  =/  pathrow=path-row:db  (scry-path-row path.act bowl)
  =.  pins.pathrow
    ?:  pin.act
      (~(put in pins.pathrow) msg-id.act)
    (~(del in pins.pathrow) msg-id.act)

  =/  pathpeers  (scry-peers path.act bowl)
  =/  cards  
    :: we poke all peers/members' db with edit-path-pins (including ourselves)
    %:  turn
      pathpeers
      |=(p=peer-row:db [%pass /dbpoke %agent [patp.p %chat-db] %poke %db-action !>([%edit-path-pins path.act pins.pathrow])])
    ==
  [cards state]
::
++  clear-pinned-messages
::  :realm-chat &action [%clear-pinned-messages /realm-chat/path-id]
  |=  [=path state=state-0 =bowl:gall]
  ^-  (quip card state-0)

  =/  pathpeers  (scry-peers path bowl)
  =/  cards
    :: we poke all peers/members' db with edit-path-pins (including ourselves)
    %:  turn
      pathpeers
      |=(p=peer-row:db [%pass /dbpoke %agent [patp.p %chat-db] %poke %db-action !>([%edit-path-pins path *pins:db])])
    ==
  [cards state]
::
++  add-ship-to-chat
::  :realm-chat &action [%add-ship-to-chat /realm-chat/path-id ~bus]
  |=  [act=[=path =ship] state=state-0 =bowl:gall]
  ^-  (quip card state-0)
  =/  pathrow  (scry-path-row path.act bowl)
  =/  pathpeers  (scry-peers path.act bowl)
  =/  all-peers=ship-roles:db
    %+  snoc
      (turn pathpeers |=(p=peer-row:db [patp.p role.p]))
    [ship.act %member]

  =/  backlog-poke-cards
    ?.  peers-get-backlog.pathrow  ~
    (turn (scry-messages-for-path path.act bowl) |=([k=uniq-id:db v=msg-part:db] (into-backlog-msg-poke v ship.act)))

  =/  cards
    %+  weld
      %+  snoc
        :: we poke all original peers db with add-peer (including ourselves)
        %+  turn
          pathpeers
        |=(p=peer-row:db [%pass /dbpoke %agent [patp.p %chat-db] %poke %db-action !>([%add-peer path.act ship.act])])
      ::  we poke the newly-added ship's db with a create-path,
      ::  since that will automatically handle them joining as a member
      [%pass /dbpoke %agent [ship.act %chat-db] %poke %db-action !>([%create-path pathrow all-peers])]
    backlog-poke-cards
  [cards state]
::  allows self to remove self, or %host to kick others
++  remove-ship-from-chat
::realm-chat &action [%remove-ship-from-chat /realm-chat/path-id ~bus]
  |=  [act=[=path =ship] state=state-0 =bowl:gall]
  ^-  (quip card state-0)
  =/  pathpeers  (scry-peers path.act bowl)
  =/  members  (skim pathpeers |=(p=peer-row:db ?!(=(role.p %host)))) :: everyone who's NOT the host
  =/  host  (snag 0 (skim pathpeers |=(p=peer-row:db =(role.p %host))))
  =.  pins.state  :: if we are removing ourself, we are deleting the path, so we should unpin the chat
    ?:  =(ship.act patp.host)
      (~(del in pins.state) path.act)
    pins.state
  =/  cards
    ?:  =(ship.act patp.host)
      :: if src.bowl is %host, we have to leave-path for the host
      :: and then send kick-peer of themselves to all members
      :-  [%pass /dbpoke %agent [patp.host %chat-db] %poke %db-action !>([%leave-path path.act])]
      %+  turn
        members
      |=(p=peer-row:db (into-kick-peer-poke patp.p patp.p path.p))
    :: otherwise we just send kick-peer to all the peers (db will ensure permissions)
    (into-all-peers-kick-pokes ship.act pathpeers)
  [cards state]
::
++  send-message
::realm-chat &action [%send-message /realm-chat/path-id ~[[[%plain '0'] ~ ~] [[%plain '1'] ~ ~]] ~]
  |=  [act=[=path fragments=(list minimal-fragment:db) expires-in=@dr] state=state-0 =bowl:gall]
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
++  edit-message
::  :realm-chat &action [%edit-message [~2023.2.22..16.46.28..e019 ~zod] /realm-chat/path-id (limo [[[%plain 'edited'] ~ ~] ~])]
  |=  [act=edit-message-action:db state=state-0 =bowl:gall]
  ^-  (quip card state-0)
  :: just pass along the edit-message-action to all the peers chat-db
  :: %chat-db will disallow invalid signals
  =/  pathpeers  (scry-peers path.act bowl)
  =/  cards  
    %:  turn
      pathpeers
      |=(p=peer-row:db (into-edit-message-poke p act))
    ==
  [cards state]
::
++  delete-message
::  :realm-chat &action [%delete-message /realm-chat/path-id ~2023.2.3..16.23.37..72f6 ~zod]
  |=  [act=[=path =msg-id:db] state=state-0 =bowl:gall]
  ^-  (quip card state-0)
  :: just pass along the delete msg-id to all the peers chat-db
  :: %chat-db will disallow invalid signals
  =/  pathpeers  (scry-peers path.act bowl)
  =/  cards  
    %:  turn
      pathpeers
      |=(p=peer-row:db (into-delete-message-poke p msg-id.act))
    ==
  [cards state]
::
++  delete-backlog
::  :realm-chat &action [%delete-backlog /realm-chat/path-id]
  |=  [act=[=path] state=state-0 =bowl:gall]
  ^-  (quip card state-0)
  :: just pass along the delete-backlog to all the peers chat-db
  :: %chat-db will disallow invalid signals
  =/  pathpeers  (scry-peers path.act bowl)
  =/  cards
    %:  turn
      pathpeers
      |=(p=peer-row:db (into-delete-backlog-poke p path.act now.bowl))
    ==
  [cards state]
::
++  disable-push
  |=  [state=state-0]
  ^-  (quip card state-0)
  =.  push-enabled.state  %.n
  `state
::
++  enable-push
  |=  [state=state-0]
  ^-  (quip card state-0)
  =.  push-enabled.state  %.y
  `state
::
++  remove-device
  |=  [=device-id:notify state=state-0]
  ^-  (quip card state-0)
  =.  devices.state         (~(del by devices.state) device-id)
  `state
::
++  set-device
  |=  [[=device-id:notify =player-id:notify] state=state-0]
  ^-  (quip card state-0)
  =.  devices.state         (~(put by devices.state) device-id player-id)
  `state
::
++  mute-chat
  |=  [[chat-path=path mute=?] state=state-0]
  ^-  (quip card state-0)
  =/  new-mutes
    ?:  mute
      (~(put in mutes.state) chat-path)
    (~(del in mutes.state) chat-path)
  =.  mutes.state   new-mutes
  `state
::
++  pin-chat
  |=  [[chat-path=path pin=?] state=state-0]
  ^-  (quip card state-0)
  =/  new-pins
    ?:  pin
      (~(put in pins.state) chat-path)
    (~(del in pins.state) chat-path)
  =.  pins.state   new-pins
  `state
::
::  JSON
::
++  encode
  =,  enjs:format
  |%
    ++  paths
      |=  path-set=pins
      ^-  json
      a+(turn `(list ^path)`~(tap in path-set) enpath)
    ++  enpath
      |=  p=^path
      ^-  json
      s+(spat p)
  --
++  dejs
  =,  dejs:format
  |%
  ++  action
    |=  jon=json
    ^-  ^action
    =<  (decode jon)
    |%
    ++  decode
      %-  of
      :~  [%create-chat create-chat]
          [%edit-chat edit-chat]
          [%pin-message pin-message]
          [%clear-pinned-messages (ot ~[[%path pa]])]
          [%add-ship-to-chat path-and-ship]
          [%remove-ship-from-chat path-and-ship]
          [%send-message path-and-fragments]
          [%edit-message de-edit-info]
          [%delete-message path-and-msg-id]
          [%delete-backlog (ot ~[[%path pa]])]

          [%enable-push ul]
          [%disable-push ul]
          [%set-device set-device]
          [%remove-device remove-device]
          [%mute-chat mute-chat]
          [%pin-chat pin-chat]
      ==
    ::
    ++  create-chat
      %-  ot
      :~  [%metadata (om so)]
          [%type (se %tas)]
          [%peers (ar de-ship)]
          [%invites (se %tas)]
          [%max-expires-at-duration null-or-dri]  :: specify in integer milliseconds, or null for "not set"
      ==
    ::
    ++  edit-chat
      %-  ot
      :~  [%path pa]
          [%metadata (om so)]
          [%peers-get-backlog bo]
          [%invites (se %tas)]
          [%max-expires-at-duration null-or-dri]  :: specify in integer milliseconds, or null for "not set"
      ==
    ::
    ++  de-ship  (su ;~(pfix sig fed:ag))
    ::
    ++  set-device
      %-  ot
      :~  [%device-id so]
          [%player-id so]
      ==
    ::
    ++  remove-device
      %-  ot
      :~  [%device-id so]
      ==
    ::
    ++  mute-chat
      %-  ot
      :~  [%path pa]
          [%mute bo]
      ==
    ::
    ++  pin-chat
      %-  ot
      :~  [%path pa]
          [%pin bo]
      ==
    ::
    ++  path-and-ship
      %-  ot
      :~  
          [%path pa]
          [%ship de-ship]
      ==
    ::
    ++  de-edit-info
      %-  ot
      :~  
          [%msg-id de-msg-id]
          [%path pa]
          de-frag
      ==
    ::
    ++  de-msg-id
      %+  cu
        path-to-msg-id
      pa
    ::
    ++  path-to-msg-id
      |=  p=path
      ^-  msg-id:db
      [`@da`(slav %da +2:p) `@p`(slav %p +6:p)]
    ::
    ++  de-frag
      [%fragments (ar (ot ~[content+de-content reply-to+(mu path-and-msg-id) metadata+(om so)]))]
    ::
    ++  path-and-fragments
      %-  ot
      :~  
          [%path pa]
          de-frag
          [%expires-in null-or-dri]
      ==
    ::
    ++  de-content
      %-  of
      :~  
          [%plain so]
          [%bold so]
          [%italics so]
          [%strike so]
          [%bold-italics so]
          [%bold-strike so]
          [%italics-strike so]
          [%bold-italics-strike so]
          [%blockquote so]
          [%inline-code so]
          [%code so]
          [%image so]
          [%ur-link so]
          [%react so]
          [%break ul]
          [%ship de-ship]
          [%link so]
          [%custom (at ~[so so])]
      ==
    ::
    ++  path-and-msg-id
      %-  ot
      :~  
          [%path pa]
          [%msg-id de-msg-id]
      ==
    ::
    ++  pin-message
      %-  ot
      :~  
          [%path pa]
          [%msg-id de-msg-id]
          [%pin bo]
      ==
    ::
    ++  dri   :: specify in integer milliseconds, returns a @dr
      (cu |=(t=@ud ^-(@dr (div (mul ~s1 t) 1.000))) ni)
    ::
    ++  null-or-dri   :: specify in integer milliseconds, returns a @dr
      (cu |=(t=@ud ^-(@dr (div (mul ~s1 t) 1.000))) null-or-ni)
    ::
    ++  null-or-ni  :: accepts either a null or a n+'123', and converts nulls to 0, non-null to the appropriate number
      |=  jon=json
      ^-  @ud
      ?+  jon  !!
        [%n *]  (rash p.jon dem)
        ~       0
      ==
    --
  --
--