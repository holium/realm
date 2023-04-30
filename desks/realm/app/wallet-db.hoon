::  app/wallet-db.hoon
/-  *versioned-state, sur=wallet-db
/+  dbug, db-lib=chat-db
=|  state-1
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
    =/  default-state=state-1
      [%1 *wallets-table:sur *transactions-table:sur]
    `this(state default-state)
  ++  on-save   !>(state)
  ++  on-load
    |=  old-state=vase
    ^-  (quip card _this)
    =/  old  !<(versioned-state old-state)
    :: we remove the old timer (if any) and add the new one, so that
    :: we don't get an increasing number of timers associated with
    :: this agent every time the agent gets updated
    =/  default-cards
      [[%pass /timer %arvo %b %rest next-expire-time:core] [%pass /timer %arvo %b %wait next-expire-time:core] ~]
    =^  cards  state
    ?-  -.old
      %0  
        =/  new  [%1 paths-table.old messages-table.old peers-table.old *del-log:sur]
        [default-cards new]
      %1
        [default-cards old]
    ==
    [cards this]
  ::
  ++  on-poke
    |=  [=mark =vase]
    ^-  (quip card _this)
    ?>  ?=(%chat-db-action mark)
    =/  act  !<(action:sur vase)
    =^  cards  state
    ?-  -.act  :: each handler function here should return [(list card) state]
      :: paths-table pokes
      %add-wallet
        (create-path:db-lib +.act state bowl)
      %edit-wallet
        (edit-path:db-lib +.act state bowl)
      :: transactions-table pokes
      %insert
        (insert:db-lib +.act state bowl)
      %complete-transaction
        (edit:db-lib +.act state bowl)
      %save-transaction-notes  
        `state
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
          :::~  [%give %fact ~ chat-db-dump+!>(tables+all-tables:core)]
          ::==
          ~  :: we are not "priming" these subscriptions with anything, since the client can just scry if they need. the sub is for receiving new updates
      :: /db/messages/start/~zod/~2023.1.17..19.50.46..be0e
        [%db %transactions %start @ @ ~]  :: the "recent messages" path
          ::=/  sender=@p       `@p`(slav %p i.t.t.t.path)
          ::=/  timestamp=@da   `@da`(slav %da i.t.t.t.t.path)
          ::[%give %fact ~ chat-db-dump+!>([%tables [[%messages (start:from:db-lib `msg-id:sur`[timestamp sender] messages-table.state)] ~]])]~
          ~  :: we are not "priming" these subscriptions with anything, since the client can just scry if they need. the sub is for receiving new updates
      :: /db/path/the/actual/path/here
        [%db %wallet *]  :: the "path" path, subscribe by path explicitly
          =/  thepathrow   (~(get by paths-table.state) t.t.path)
          :~  [%give %fact ~ chat-path-row+!>(thepathrow)]
          ==
    ==
    [cards this]
  ::
  ++  on-peek
    |=  =path
    ^-  (unit (unit cage))
    ?+    path  !!
    ::
      [%x %db ~]
        ``chat-db-dump+!>(tables+all-tables:core)
    ::
      [%x %db %wallets ~]
        ``chat-db-dump+!>(tables+[[%wallets paths-table.state] ~])
    ::
      [%x %db %wallet *]
        =/  thepath  t.t.t.path
        =/  thepathrow  (~(got by paths-table.state) thepath)
        ``chat-db-dump+!>([%tables [[%wallets (malt (limo ~[[thepath thepathrow]]))] ~]])
    ::
    ::
      [%x %db %messages-for-path *]
        =/  thepath  t.t.t.path
        =/  msgs=messages-table:sur  (path-msgs:from:db-lib messages-table.state thepath)
        ``chat-db-dump+!>(tables+[messages+msgs ~])
    ::
      [%x %db %messages ~]
        ``chat-db-dump+!>(tables+[messages+messages-table.state ~])
    ::
    :: /db/start-ms/<time>.json
    :: all tables, but only with created-at or updated-at after <time>
      [%x %db %start-ms @ ~]
        =/  timestamp=@da   (di:dejs:format n+i.t.t.t.path)
        =/  msgs            messages+(start:from:db-lib timestamp messages-table.state)
        =/  paths           paths+(path-start:from:db-lib timestamp paths-table.state)
        =/  peers           peers+(peer-start:from:db-lib timestamp peers-table.state)
        ``chat-db-dump+!>(tables+[msgs paths peers ~])
    ::
    :: /db/start-ms/<messages-time>/<paths-time>/<peers-time>.json
    :: all tables, but only with created-at or updated-at after <time>,
    :: allowing you to specify a different timestamp for each table
      [%x %db %start-ms @ @ @ ~]
        =/  msgs-t=@da      (di:dejs:format n+i.t.t.t.path)
        =/  paths-t=@da     (di:dejs:format n+i.t.t.t.t.path)
        =/  peers-t=@da     (di:dejs:format n+i.t.t.t.t.t.path)
        ?:  &(=(0 msgs-t) =(0 paths-t) =(0 peers-t))
          ``chat-db-dump+!>(tables+all-tables:core)  :: if all 3 timestamps are 0, just return the whole tables, don't bother actually filtering them
        =/  msgs            messages+(start:from:db-lib msgs-t messages-table.state)
        =/  paths           paths+(path-start:from:db-lib paths-t paths-table.state)
        =/  peers           peers+(peer-start:from:db-lib peers-t peers-table.state)
        ``chat-db-dump+!>(tables+[msgs paths peers ~])
    ::
    :: /db/paths/start-ms/<time>.json
      [%x %db %paths %start-ms @ ~]
        =/  timestamp=@da   (di:dejs:format n+i.t.t.t.t.path)
        =/  paths           paths+(path-start:from:db-lib timestamp paths-table.state)
        ``chat-db-dump+!>(tables+[paths ~])
    ::
    :: /db/peers/start-ms/<time>.json
      [%x %db %peers %start-ms @ ~]
        =/  timestamp=@da   (di:dejs:format n+i.t.t.t.t.path)
        =/  peers           peers+(peer-start:from:db-lib timestamp peers-table.state)
        ``chat-db-dump+!>(tables+[peers ~])
    ::
      [%x %db %messages %start-ms @ ~]
        =/  timestamp=@da   (di:dejs:format n+i.t.t.t.t.path)
        ``chat-db-dump+!>(tables+[messages+(start:from:db-lib timestamp messages-table.state) ~])
    ::
    :: /db/start/<time>.json
    :: all tables, but only with created-at or updated-at after <time>
      [%x %db %start @ ~]
        =/  timestamp=@da   `@da`(slav %da i.t.t.t.path)
        =/  msgs            messages+(start:from:db-lib timestamp messages-table.state)
        =/  paths           paths+(path-start:from:db-lib timestamp paths-table.state)
        =/  peers           peers+(peer-start:from:db-lib timestamp peers-table.state)
        ``chat-db-dump+!>(tables+[msgs paths peers ~])
    ::
    :: /db/paths/start/<time>.json
      [%x %db %paths %start @ ~]
        =/  timestamp=@da   `@da`(slav %da i.t.t.t.t.path)
        =/  paths           paths+(path-start:from:db-lib timestamp paths-table.state)
        ``chat-db-dump+!>(tables+[paths ~])
    ::
    :: /db/peers/start/<time>.json
      [%x %db %peers %start @ ~]
        =/  timestamp=@da   `@da`(slav %da i.t.t.t.t.path)
        =/  peers           peers+(peer-start:from:db-lib timestamp peers-table.state)
        ``chat-db-dump+!>(tables+[peers ~])
    ::
    ::  USE THIS ONE FOR PRECISE msg-id PINPOINTING
      [%x %db %messages %start @ @ ~]
        =/  timestamp=@da   `@da`(slav %da i.t.t.t.t.path)
        =/  sender=@p       `@p`(slav %p i.t.t.t.t.t.path)
        ``chat-db-dump+!>(tables+[messages+(start-lot:from:db-lib `msg-id:sur`[timestamp sender] messages-table.state) ~])
    ::
      [%x %delete-log %start-ms @ ~]
        =/  timestamp=@da   (di:dejs:format n+i.t.t.t.path)
        ``chat-del-log+!>((lot:delon:sur del-log.state ~ `timestamp))
    ==
  :: chat-db does not subscribe to anything.
  :: chat-db does not care
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
    `this
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
++  all-tables
  [[%paths paths-table.state] [%messages messages-table.state] [%peers peers-table.state] ~]
--
