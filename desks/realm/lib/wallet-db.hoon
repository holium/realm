::  wallet-db [realm]:
::
::  Wallet message lib within Realm. Mostly handles [de]serialization
::
/-  sur=wallet-db
|%
+$  card  card:agent:gall
::
::  random helpers
::
++  add-transaction-to-table
  |=  [tbl=transactions-table:sur =transaction-row:sur]
  ^-  transactions-table:sur
  =/  =txn-id:sur  [[chain.transaction-row network.transaction-row] hash.transaction-row]
  (~(put by tbl) [txn-id transaction-row])
::
::  poke actions
::
++  set-wallet
  |=  [row=wallet-row:sur state=state-0:sur =bowl:gall]
  ^-  (quip card state-0:sur)
  ?>  ?!((~(has by wallets-table.state) [chain.row wallet-index.row]))  :: ensure the path doesn't already exist!!!
  =.  wallets-table.state  (~(put by wallets-table.state) [chain.row wallet-index.row] row)
  `state
::
++  insert-transaction
  |=  [=transaction-row:sur state=state-0:sur =bowl:gall]
  ^-  (quip card state-0:sur)
  =.  transactions-table.state  (add-transaction-to-table transactions-table.state transaction-row)
  =/  thechange  wallet-db-change+!>([%add-row [%transactions transaction-row]]~)
  `state
::
++  complete-transaction
  |=  [=txn-id:sur state=state-0:sur =bowl:gall]
  ^-  (quip card state-0:sur)
  `state
::
++  save-transaction-notes
  |=  [[=txn-id:sur notes=@t] state=state-0:sur =bowl:gall]
  ^-  (quip card state-0:sur)
  `state
::
::  mini helper lib
::
++  from
  |%
  ::
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
    ++  transactions-table :: encodes for on-watch
      |=  tbl=transactions-table:sur
      ^-  json
      (transactions-table:encode tbl)
    ::
    ++  wallet-row :: encodes for on-watch
      |=  =wallet-row:sur
      ^-  json
      (wallet-row:encode wallet-row)
  --
++  encode
  =,  enjs:format
  |%
    ++  all-tables
      |=  =tables:sur
      ^-  json
      %-  pairs
      %+  turn  tables
        |=  =table:sur
        ?-  -.table
          %wallets      wallets+(wallets-table +.table)
          %transactions   transactions+(transactions-table +.table)
        ==
    ::
    ++  wallets-table
      |=  tbl=wallets-table:sur
      ^-  json
      [%a ~(val by (~(run by tbl) wallet-row))]
    ::
    ++  transactions-table
      |=  tbl=transactions-table:sur
      ^-  json
      [%a (turn ~(val by tbl) transaction-row)]
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
        %upd-transactions-row
          :~
            ['type' %s %update]
            ['table' %s %transactions]
            ['txn-id' (txn-id-to-json txn-id.ch)]
            ['transaction' (transaction-row transaction-row.ch)]
          ==
        %upd-wallets-row
          :~
            ['type' %s %update]
            ['table' %s %wallets]
            ['row' (wallet-row wallet-row.ch)]
            ['old-row' (wallet-row old.ch)]
          ==
      ==
    ::
    ++  any-row
      |=  =db-row:sur
      ^-  json
      ?-  -.db-row
        %wallets
          (wallet-row wallet-row.db-row)
        %transactions
          (transaction-row transaction-row.db-row)
      ==
    ::
    ++  wallet-row
      |=  =wallet-row:sur
      ^-  json
      %-  pairs
      :~  ['chain' [%s chain.wallet-row]]
          ['index' (numb wallet-index.wallet-row)]
          ?:  ?|  =(chain.wallet-row %bitcoin)
                  =(chain.wallet-row %btctestnet)
              ==
            ['address' [%s (crip q:(trim 2 (scow %uc address.wallet-row)))]]
          ['address' [%s (crip (z-co:co address.wallet-row))]]
          ['path' [%s path.wallet-row]]
          ['nickname' [%s nickname.wallet-row]]
      ==
    ::
    ++  transaction-row
      |=  [=transaction-row:sur]
      ^-  json
      %-  pairs
      :~  ['chain' [%s chain.transaction-row]]
          :-  'network'
            ?~  network.transaction-row  ~
            [%s u.network.transaction-row]
          ['hash' [%s hash.transaction-row]]
          :-  'eth-type'
            ?~  eth-type.transaction-row  ~
            [%s u.eth-type.transaction-row]
          ['type' [%s type.transaction-row]]
          ['initiatedAt' (time initiated-at.transaction-row)]
          :-  'completedAt'
            ?~  completed-at.transaction-row  ~
            (time u.completed-at.transaction-row)
          ['ourAddress' [%s our-address.transaction-row]]
          :-  'theirPatp'
            ?~  their-patp.transaction-row  ~
            [%s (crip (scow %p u.their-patp.transaction-row))]
          ['theirAddress' [%s their-address.transaction-row]]
          ['status' [%s status.transaction-row]]
          :-  'failureReason'
            ?~  failure-reason.transaction-row  ~
            [%s u.failure-reason.transaction-row]
          ['notes' [%s notes.transaction-row]]
      ==
    ::
    ++  time-bunt-null
      |=  t=@da
      ?:  =(t *@da)
        ~
      (time t)
    ::
    ++  txn-id-to-json
      |=  =txn-id:sur
      ^-  json
      s+(txn-id-to-cord txn-id)
    ::
    ++  txn-id-to-cord
      |=  =txn-id:sur
      ^-  cord
      =/  txn-id-list
      ?~  network.txn-id
        ~[chain.txn-id hash.txn-id]
      :~  chain.txn-id
          u.network.txn-id
          hash.txn-id
      ==
      %-  spat  txn-id-list
    ::
  --
--
