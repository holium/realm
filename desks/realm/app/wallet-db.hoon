::  app/wallet-db.hoon
/-  sur=wallet-db
/+  default-agent, dbug, db-lib=wallet-db
=|  state-0:sur
=*  state  -
^-  agent:gall
::
=>  |%
    +$  card  card:agent:gall
    --
::
=<
  %-  agent:dbug
  |_  =bowl:gall
  +*  this  .
      def   ~(. (default-agent this %.n) bowl)
      core   ~(. +> [bowl ~])
  ::
  ++  on-init
    ^-  (quip card _this)
    =/  default-state=state-0:sur
      [%0 *wallets-table:sur *transactions-table:sur]
    `this(state default-state)
  ++  on-save
    ^-  vase
    !>(state)
  ++  on-load
    |=  old-state=vase
    ^-  (quip card _this)
    =/  old  !<(versioned-state:sur old-state)
    =^  cards  state
      ?-  -.old
        %0  `old
      ==
    [cards this]
  ::
  ++  on-poke
    |=  [=mark =vase]
    ^-  (quip card _this)
    ?>  ?=(%wallet-db-action mark)
    =/  act  !<(action:sur vase)
    =^  cards  state
      ?-  -.act  :: each handler function here should return [(list card) state]
        :: wallets-table pokes
        %set-wallet
          (set-wallet:db-lib +.act state bowl)
        :: transactions-table pokes
        %insert-transaction
          (insert-transaction:db-lib +.act state bowl)
        %complete-transaction
          (complete-transaction:db-lib +.act state bowl)
        %save-transaction-notes  
          (save-transaction-notes:db-lib +.act state bowl)
      ==
    [cards this]
  ::
  ++  on-watch
    |=  =path
    ^-  (quip card _this)
    ?>  =(our.bowl src.bowl)
    ::  each path should map to a list of cards
    ?+  path      !!
      ::
        [%db ~]  :: the "everything" path
          `this  :: we are not "priming" these subscriptions with anything, since the client can just scry if they need. the sub is for receiving new updates
    ==
  ::
  ++  on-peek
    |=  =path
    ^-  (unit (unit cage))
    ?+  path  !!
  ::
      [%x %db ~]
        ``wallet-db-dump+!>(tables+all-tables:core)
    ==
    ::
::      [%x %db %wallets ~]
::        ``wallet-db-dump+!>(tables+[[%wallets wallets-table.state] ~])
    ::
::      [%x %db %wallet *]
::        =/  thewallet  t.t.t.path
::        =/  thewalletrow  *wallet-row:sur :: (~(got by wallets-table.state) thewallet)
::        ``wallet-db-dump+!>([%tables [[%wallets (malt (limo ~[[thewallet thewalletrow]]))] ~]])
    ::
    ::
::      [%x %db %transactions-for-wallet *]
::        =/  thewallet  t.t.t.path
::        =/  txns=transactions-table:sur  *transactions-table:sur :: (path-msgs:from:db-lib transactions-table.state thewallet)
::        ``wallet-db-dump+!>(tables+[transactions+txns ~])
    ::
::      [%x %db %transactions ~]
::        ``wallet-db-dump+!>(tables+[transactions+transactions-table.state ~])
    ::
  :: wallet-db does not subscribe to anything.
  :: wallet-db does not care
  ++  on-agent  on-agent:def
  ::
  ++  on-leave  on-leave:def
  ::
  ++  on-arvo   on-arvo:def
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
  [[%wallets wallets-table.state] [%transactions transactions-table.state] ~]
--
