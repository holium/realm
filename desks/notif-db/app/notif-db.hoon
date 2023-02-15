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
    |=  [=mark =vase]
    ^-  (quip card _this)
    ?>  ?=(%ndb-poke mark)
    =/  act  !<(action:sur vase)
    =^  cards  state
    ?-  -.act  :: each handler function here should return [(list card) state]
      %create
        (create:db-lib +.act state bowl)
      %read-id
        (read-id:db-lib +.act state bowl)
      %read-app
        (read-app:db-lib +.act state bowl)
      %read-path
        (read-path:db-lib +.act state bowl)
      %read-all
        (read-all:db-lib +.act state bowl)
      %update
        (update:db-lib +.act state bowl)
      %delete
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
          =/  changes  (turn (tap:notifon:sur notifs-table.state) keyval-to-change:core)
          :~  [%give %fact ~ db-change+!>(changes)]
          ==
      ::
        [%new ~]  :: the "new notificaitons only" path
          ~  :: we don't "prime" this path with anything, only give-facts on %create action
      :: /path/<app name>/<the/actual/path>
        [%path @ *]  :: the "everything" path
          =/  path-notifs   (notifs-by-path:core i.t.path t.t.path) :: list of [key val] of matching notif-rows
          =/  changes  (turn path-notifs keyval-to-change:core)
          :~  [%give %fact ~ db-change+!>(changes)]
          ==
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
++  all-rows
  (turn (tap:notifon:sur notifs-table.state) |=([k=@ud v=notif-row:sur] v))
++  all-unread-rows
  %+  turn
    (skip (tap:notifon:sur notifs-table.state) |=([k=@ud v=notif-row:sur] read.v))
  |=([k=@ud v=notif-row:sur] v)
++  all-read-rows
  %+  turn
    (skim (tap:notifon:sur notifs-table.state) |=([k=@ud v=notif-row:sur] read.v))
  |=([k=@ud v=notif-row:sur] v)
++  rows-by-path
  |=  [app=@tas =path]
  %+  turn
    (notifs-by-path app path)
  |=([k=@ud v=notif-row:sur] v)
++  rows-by-type
  |=  [app=@tas =path type=@tas]
  %+  turn
    (skim (tap:notifon:sur notifs-table.state) |=([k=@ud v=notif-row:sur] &(=(app app.v) =(path path.v) =(type type.v))))
  |=([k=@ud v=notif-row:sur] v)
++  notifs-by-path
  |=  [app=@tas =path]
  (skim (tap:notifon:sur notifs-table.state) |=([k=@ud v=notif-row:sur] &(=(app app.v) =(path path.v))))
--
