::  wallet-db [realm]:
::
::  Wallet message lib within Realm. Mostly handles [de]serialization
::
/-  sur=wallet-db, chat-db
|%
+$  card  card:agent:gall
::
::  random helpers
::
++  add-transaction-to-table
  |=  [tbl=transactions-table:sur =transaction-row:sur]
  ^-  transactions-table:sur
  =/  =txn-id:sur  [chain.transaction-row network.transaction-row hash.transaction-row]
  (~(put by tbl) [txn-id transaction-row])
::
::  poke actions
::
++  set-wallet
  |=  [row=wallet-row:sur state=state-0:sur =bowl:gall]
  ^-  (quip card state-0:sur)
  =.  wallets-table.state  (~(put by wallets-table.state) [chain.row wallet-index.row] row)
  =/  change  realm-wallet-db-change+!>(`(list db-change-type:sur)`[%set-row [%wallets row]]~)
  :_  state
  [%give %fact [/db]~ change]~
::
++  insert-transaction
  |=  [=transaction-row:sur state=state-0:sur =bowl:gall]
  ^-  (quip card state-0:sur)
  =.  transactions-table.state  (add-transaction-to-table transactions-table.state transaction-row)
  =/  change  realm-wallet-db-change+!>(`(list db-change-type:sur)`[%set-row [%transactions transaction-row]]~)
  :_  state
  [%give %fact [/db]~ change]~
::
++  complete-transaction
  |=  [[=txn-id:sur success=?] state=state-0:sur =bowl:gall]
  ^-  (quip card state-0:sur)
  =/  txn  (~(got by transactions-table.state) txn-id)
  =.  status.txn
    ?:  success  %succeeded
      %failed
  =.  transactions-table.state  (~(put by transactions-table.state) [txn-id txn])
  =/  change  realm-wallet-db-change+!>(`(list db-change-type:sur)`[%set-row [%transactions txn]]~)
  :_  state
  [%give %fact [/db]~ change]~
::
++  save-transaction-notes
  |=  [[=txn-id:sur notes=@t] state=state-0:sur =bowl:gall]
  ^-  (quip card state-0:sur)
  =/  txn  (~(got by transactions-table.state) txn-id)
  =.  notes.txn  notes
  =.  transactions-table.state  (~(put by transactions-table.state) [txn-id txn])
  `state
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
    ++  num-wallets
      |=  num=@ud
      ^-  json
      (numb num)
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
        %set-row
          :~  ['type' %s -.ch]
              ['table' %s -.+.ch]
              ['row' (any-row db-row.ch)]
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
          ['wallet_index' (numb wallet-index.wallet-row)]
          ?:  ?|  =(chain.wallet-row %bitcoin)
                  =(chain.wallet-row %btctestnet)
              ==
          ['address' [%s (crip q:(trim 2 (scow %uc address.wallet-row)))]]
          ['path' [%s path.wallet-row]]
          ['address' [%s (crip (z-co:co address.wallet-row))]]
          ['nickname' [%s nickname.wallet-row]]
      ==
    ::
    ++  transaction-row
      |=  [=transaction-row:sur]
      ^-  json
      %-  pairs
      :~  ['chain' [%s chain.transaction-row]]
          ['network' s+network.transaction-row]
          ['hash' [%s hash.transaction-row]]
          ['wallet-id' (wallet-id-to-json wallet-id.transaction-row)]
          ['eth-type' [%s eth-type.transaction-row]]
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
    ++  wallet-id-to-json
      |=  =wallet-id:sur
      ^-  json
      s+(wallet-id-to-cord wallet-id)
    ::
    ++  wallet-id-to-cord
      |=  =wallet-id:sur
      ^-  cord
      =/  wallet-id-list
        ~[chain.wallet-id (scot %ud wallet-index.wallet-id)]
      (spat wallet-id-list)
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
          ~[chain.txn-id hash.txn-id]
      (spat txn-id-list)
    ::
  --
--
