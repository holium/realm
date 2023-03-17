::  app/notif-db.hoon
/-  *versioned-state, sur=notif-db
/+  dbug, db-lib=notif-db
=|  state-0
=*  state  -
:: ^-  agent:gall
=<
  %-  agent:dbug
  |_  =bowl:gall
  +*  this  .
      core   ~(. +> [bowl ~])
  ::
  ++  on-init
    ^-  (quip card _this)
    =/  default-state=state-0
      [%0 0 *notifs-table:sur]
    `this(state default-state)
  ++  on-save   !>(state)
  ++  on-load
    |=  old-state=vase
    ^-  (quip card _this)
    =/  old  !<(versioned-state old-state)
    ?-  -.old
      %0  `this(state old)
    ==
  ::
  ++  on-poke
    :: for access-control, we allow pokes to create notifications from
    :: anywhere, but updating/deleting them can only come from ourselves
    |=  [=mark =vase]
    ^-  (quip card _this)
    ?>  ?=(%ndb-poke mark)
    =/  act  !<(action:sur vase)
    ~&  >  (crip "%notif-db {<-.act>}")
    =^  cards  state
    ?-  -.act  :: each handler function here should return [(list card) state]
      :: permission-wise, basically others can %create notifs for us,
      :: but only we can manipulate them once created
      :: maybe we will need to allow them to update them...
      %create
        (create:db-lib +.act state bowl)
      %read-id
        ?>  =(src.bowl our.bowl)
        (read-id:db-lib +.act state bowl)
      %read-app
        ?>  =(src.bowl our.bowl)
        (read-app:db-lib +.act state bowl)
      %read-path
        ?>  =(src.bowl our.bowl)
        (read-path:db-lib +.act state bowl)
      %read-all
        ?>  =(src.bowl our.bowl)
        (read-all:db-lib +.act state bowl)
      %dismiss-id
        ?>  =(src.bowl our.bowl)
        (dismiss-id:db-lib +.act state bowl)
      %dismiss-app
        ?>  =(src.bowl our.bowl)
        (dismiss-app:db-lib +.act state bowl)
      %dismiss-path
        ?>  =(src.bowl our.bowl)
        (dismiss-path:db-lib +.act state bowl)
      %update
        ?>  =(src.bowl our.bowl)
        (update:db-lib +.act state bowl)
      %delete
        ?>  =(src.bowl our.bowl)
        (delete:db-lib +.act state bowl)
    ==
    [cards this]
  ::
  ++  on-watch
    |=  =path
    ^-  (quip card _this)
    ?>  =(our.bowl src.bowl)
    =/  cards=(list card)
    ::  each path should map to a list of cards
    ?+  path      !!
      ::
        [%db ~]  :: the "everything" path
          ~  :: don't "prime" this path with anything, only give-facts on db changes (pokes)
      ::
        [%new ~]  :: the "new notificaitons only" path
          ~  :: we don't "prime" this path with anything, only give-facts on %create action
      :: /path/<app name>/<the/actual/path>
      ::[%path @ *]
      ::  =/  path-notifs   (notifs-by-path:core i.t.path t.t.path) :: list of [key val] of matching notif-rows
      ::  =/  changes  (turn path-notifs keyval-to-change:core)
      ::  :~  [%give %fact ~ db-change+!>(changes)]
      ::  ==
    ==
    [cards this]
  ::
  ++  on-peek
    |=  =path
    ^-  (unit (unit cage))
    ?+    path  !!
    :: TODO notifs since timestamp
    ::
      [%x %db ~]
        ``rows+!>(all-rows:core)
    ::
      [%x %db %unreads ~]
        ``rows+!>(all-unread-rows:core)
    ::
      [%x %db %reads ~]
        ``rows+!>(all-read-rows:core)
    ::
      [%x %db %dismissed ~]
        ``rows+!>(all-dismissed-rows:core)
    ::
      [%x %db %not-dismissed ~]
        ``rows+!>(all-not-dismissed-rows:core)
    ::
      [%x %db %notif @ ~]
        =/  theid    (slav %ud i.t.t.t.path)
        ``rows+!>([(got:notifon notifs-table.state theid) ~])
    ::
      [%x %db %path @ *]
        =/  theapp    `@tas`i.t.t.t.path
        =/  thepath   t.t.t.t.path
        ``rows+!>((rows-by-path:core theapp thepath))
    :: /db/type/message/talk/dms/~zod.json
    :: .^(* %gx /(scot %p our)/notif-db/(scot %da now)/db/type/message/talk/dms/~zod/noun)
      [%x %db %type @ @ *]
        =/  thetype   `@tas`i.t.t.t.path
        =/  theapp    `@tas`i.t.t.t.t.path
        =/  thepath   t.t.t.t.t.path
        ``rows+!>((rows-by-type:core theapp thepath thetype))
    ::
    :: notifs since index
      [%x %db %since-index @ ~]
        =/  index=@ud  (ni:dejs:format n+i.t.t.t.path)
        =/  new-rows  
            (turn (tap:notifon:sur (lot:notifon:sur notifs-table.state ~ `index)) val-r:core)
        ``rows+!>(new-rows)
    ::
    :: notifs since index
      [%x %db %since-ms @ ~]
        =/  ms=@da  (di:dejs:format n+i.t.t.t.path)
        =/  new-rows  
          %+  turn
            (skim (tap:notifon:sur notifs-table.state) |=([k=@ud v=notif-row:sur] |((gth created-at.v ms) (gth updated-at.v ms))))
          val-r:core
        ``rows+!>(new-rows)
    ==
  :: notif-db does not subscribe to anything.
  :: notif-db does not care
  ++  on-agent
    |=  [=wire =sign:agent:gall]
    ^-  (quip card _this)
    !!
  ::
  ++  on-leave
    |=  path
      `this
  ::
  ++  on-arvo
    |=  [=wire =sign-arvo]
    ^-  (quip card _this)
    !!
  ::
  ++  on-fail
    |=  [=term =tang]
    %-  (slog leaf+"error in {<dap.bowl>}" >term< tang)
    `this
  --
|_  [=bowl:gall cards=(list card)]
::
++  this  .
++  core  .
++  keyval-to-change
  |=  [key=id:sur val=notif-row:sur]
  [%add-row val]
++  val-r
  |=([k=@ud v=notif-row:sur] v)
++  all-rows
  (turn (tap:notifon:sur notifs-table.state) val-r)
++  all-dismissed-rows
  %+  turn
    (skim (tap:notifon:sur notifs-table.state) |=([k=@ud v=notif-row:sur] dismissed.v))
  val-r
++  all-not-dismissed-rows
  %+  turn
    (skip (tap:notifon:sur notifs-table.state) |=([k=@ud v=notif-row:sur] dismissed.v))
  val-r
++  all-unread-rows
  %+  turn
    (skip (tap:notifon:sur notifs-table.state) |=([k=@ud v=notif-row:sur] read.v))
  val-r
++  all-read-rows
  %+  turn
    (skim (tap:notifon:sur notifs-table.state) |=([k=@ud v=notif-row:sur] read.v))
  val-r
++  rows-by-path
  |=  [app=@tas =path]
  %+  turn
    (notifs-by-path app path)
  val-r
++  rows-by-type
  |=  [app=@tas =path type=@tas]
  %+  turn
    (skim (tap:notifon:sur notifs-table.state) |=([k=@ud v=notif-row:sur] &(=(app app.v) =(path path.v) =(type type.v))))
  val-r
++  notifs-by-path
  |=  [app=@tas =path]
  (skim (tap:notifon:sur notifs-table.state) |=([k=@ud v=notif-row:sur] &(=(app app.v) =(path path.v))))
--
