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
  [%pass /dbpoke %agent [patp.p %chat-db] %poke %db-action !>([%insert ts act])]
++  into-edit-message-poke
  |=  [p=peer-row:db act=edit-message-action:db]
  [%pass /dbpoke %agent [patp.p %chat-db] %poke %db-action !>([%edit act])]
++  into-delete-message-poke
  |=  [p=peer-row:db =msg-id:db]
  [%pass /dbpoke %agent [patp.p %chat-db] %poke %db-action !>([%delete msg-id])]
++  into-all-peers-kick-pokes
  |=  [kickee=ship peers=(list peer-row:db)]
  ^-  (list card)
  %:  turn
    peers
    |=(p=peer-row:db [%pass /dbpoke %agent [patp.p %chat-db] %poke %db-action !>([%kick-peer path.p kickee])])
  ==
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
::  :realm-chat &action [%create-chat ~ %chat ~]
  |=  [act=create-chat-data state=state-0 =bowl:gall]
  ^-  (quip card state-0)
  :: ?>  =(type.act %chat)  :: for now only support %chat type paths
  :: TODO COMMENT/UNCOMMENT THIS TO USE REAL paths or TESTING paths
  =/  chat-path  /realm-chat/(scot %uv (sham [our.bowl now.bowl]))
  ::=/  chat-path  /realm-chat/path-id

  =/  pathrow=path-row:db  [chat-path metadata.act type.act now.bowl now.bowl]
  =/  cards  
    :-
      [%pass /dbpoke %agent [our.bowl %chat-db] %poke %db-action !>([%create-path pathrow])]
      :: for each "initial" peer they passed in, we poke ourselves with %add-ship-to-chat
      %:  turn
        peers.act
        |=(s=ship [%pass /selfpoke %agent [our.bowl %realm-chat] %poke %action !>([%add-ship-to-chat chat-path s])])
      ==
  [cards state]
::
++  edit-chat
::  :realm-chat &action [%edit-chat /realm-chat/path-id ~]
  |=  [act=[=path metadata=(map cord cord)] state=state-0 =bowl:gall]
  ^-  (quip card state-0)

  =/  pathpeers  (scry-peers path.act bowl)

  =/  cards  
    :: we poke all peers/members' db with edit-path-metadata (including ourselves)
    %:  turn
      pathpeers
      |=(p=peer-row:db [%pass /dbpoke %agent [patp.p %chat-db] %poke %db-action !>([%edit-path-metadata path.act metadata.act])])
    ==
  [cards state]
::
++  add-ship-to-chat
::  :realm-chat &action [%add-ship-to-chat /realm-chat/path-id ~bus]
  |=  [act=[=path =ship] state=state-0 =bowl:gall]
  ^-  (quip card state-0)
  =/  pathrow  (scry-path-row path.act bowl)
  =/  pathpeers  (scry-peers path.act bowl)
  =/  t=@da  now.bowl
  =/  cards
    :-  
      ::  we poke the newly-added ship's db with a create-path,
      ::  since that will automatically handle them joining as a member
      [%pass /dbpoke %agent [ship.act %chat-db] %poke %db-action !>([%create-path pathrow])]

      :: we poke all peers/members' db with add-peer (including ourselves)
      %:  turn
        pathpeers
        |=(p=peer-row:db [%pass /dbpoke %agent [patp.p %chat-db] %poke %db-action !>([%add-peer path.act ship.act t])])
      ==
  [cards state]
::  allows self to remove self, or %host to kick others
++  remove-ship-from-chat
::  :realm-chat &action [%remove-ship-from-chat /realm-chat/path-id ~bus]
  |=  [act=[=path =ship] state=state-0 =bowl:gall]
  ^-  (quip card state-0)
  =/  pathpeers  (scry-peers path.act bowl)
  =/  members  (skim pathpeers |=(p=peer-row:db =(role.p %member)))
  =/  host  (snag 0 (skim pathpeers |=(p=peer-row:db =(role.p %host))))
  =/  cards
    ?:  =(ship.act patp.host)
      :: if src.bowl is %host, we have to leave-path for the host
      :: and then send kick-peer for all the member-peers
      :-  [%pass /dbpoke %agent [patp.host %chat-db] %poke %db-action !>([%leave-path path.act])]
      %-  zing
      %:  turn
        members
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
++  edit-message
::  :realm-chat &action [%edit-message [~2023.2.3..16.23.37..72f6 ~zod] /realm-chat/path-id (limo [[[%plain 'edited'] ~ ~] ~])]
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
::  JSON
::
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
          [%add-ship-to-chat path-and-ship]
          [%remove-ship-from-chat path-and-ship]
          [%send-message path-and-fragments]
          [%edit-message de-edit-info]
          [%delete-message path-and-msg-id]

          [%enable-push ul]
          [%disable-push ul]
          [%set-device set-device]
          [%remove-device remove-device]
      ==
    ::
    ++  create-chat
      %-  ot
      :~  [%metadata (om so)]
          [%type (se %tas)]
          [%peers (ar de-ship)]
      ==
    ::
    ++  edit-chat
      %-  ot
      :~  [%path pa]
          [%metadata (om so)]
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
          [%msg-id (at ~[(se %da) de-ship])]
          [%path pa]
          de-frag
      ==
    ::
    ++  de-frag
      [%fragments (ar (ot ~[content+de-content reply-to+(mu path-and-msg-id) metadata+(om so)]))]
    ::
    ++  path-and-fragments
      %-  ot
      :~  
          [%path pa]
          de-frag
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
          :: TODO decide if di for millisecond time is easier than (se %da)
          [%msg-id (at ~[(se %da) de-ship])]
      ==
    --
  --
--
