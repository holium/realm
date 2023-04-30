::  wallet-db [realm]:
::
::  Wallet message lib within Realm. Mostly handles [de]serialization
::
/-  sur=wallet-db
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
++  add-transaction-to-table
  |=  [tbl=transactions-table:sur txn=transaction-row:sur]
  ^-  transactions-table:sur
  =/  =txn-id:sur  [[chain.transaction-row network.transaction-row] hash.transaction-row]
  (~(put by transactions-table) [txn-id transaction-row])
::
++  keys-from-kvs  |=(kvs=msg-kvs:sur (turn kvs |=(kv=[k=uniq-id:sur v=msg-part:sur] k.kv)))
::
++  rm-msg-parts
  |=  [ids=(list uniq-id:sur) tbl=messages-table:sur]
  ^-  messages-table:sur
  |-
  ?:  =(0 (lent ids))
    tbl
  $(tbl +:(del:msgon:sur tbl (snag 0 ids)), ids +:ids)
::
++  remove-ids-from-pins
  |=  [ids=(list msg-id:sur) state=state-1 now=@da]
  ^-  state-and-changes
  =/  tbl  paths-table.state
  =/  changes=db-change:sur  *db-change:sur
  =/  result
    |-
    ?:  =(0 (lent ids))
      [tbl changes]
    =/  current  (snag 0 ids)
    =/  msg=msg-part:sur  (got:msgon:sur messages-table.state [current 0])
    =/  pathrow=path-row:sur  (~(got by tbl) path.msg)
    =/  oldrow=path-row:sur   (~(got by tbl) path.msg)
    =/  pinned                (~(has in pins.pathrow) current)
    =.  pins.pathrow          ?:(pinned (~(del in pins.pathrow) current) pins.pathrow)
    =.  updated-at.pathrow    ?:(pinned now updated-at.pathrow)
    $(tbl (~(put by tbl) path.msg pathrow), ids +:ids, changes ?:(pinned [[%upd-paths-row pathrow oldrow] changes] changes))
  =.  paths-table.state  -:result
  [state +:result]
::
++  messages-start-paths
  |=  [=bowl:gall]
  ^-  (list path)
  =/  len-three  (skim ~(val by sup.bowl) |=(a=[p=ship q=path] (gte (lent q.a) 3)))
  =/  matching  (skim len-three |=(a=[p=ship q=path] =([-:q.a +<:q.a +>-:q.a ~] /db/messages/start)))
  (turn matching |=(a=[p=ship q=path] q.a))
::
::
::  poke actions
::
++  add-wallet
  |=  [[row=path-row:sur peers=ship-roles:sur] state=state-0:sur =bowl:gall]
  ^-  (quip card state-0:sur)
  ?>  ?!((~(has by wallets-table.state) [network.row wallet-index.row]))  :: ensure the path doesn't already exist!!!
  =.  wallets-table.state  (~(put by wallets-table.state) [network.row wallet-index.row] row)
  =/  thechange  chat-db-change+!>((limo [[%add-row %paths row] (turn thepeers |=(p=peer-row:sur [%add-row %peers p]))]))
  =/  gives  :~
    [%give %fact [/db (weld /db/path path.row) ~] thechange]
  ==
  [gives state]
::
++  insert-transaction
  |=  [=transaction-row:sur state=state-0:sur =bowl:gall]
  ^-  (quip card state-0:sur)
  =/  thewallet   (~(got by wallets-table.state) wallet-id.transaction-row)
  =/  add-result  (add-transaction-to-table transactions-table.state transaction-row)
  =.  transactions-table.state  add-result
  =/  thechange  wallet-db-change+!>([%add-row [%transactions transaction-row]]~)
  =/  message-paths  (messages-start-paths bowl)
  :_  state
  [%give %fact (weld message-paths (limo [/db (weld /db/path path.msg-act) ~])) thechange]~
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

    =/  individual-rows=(list peer-row:sur)  (zing ~(val by tbl))
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
