::  wallet-db [realm]
::
|%
::  3 bits of info in a txn-id: timestamp, sender, txn-id
::  order by timestamp first
::  then sender
::  then txn-id
++  idx-sort
  |=  [a=txn-id b=txn-id]
  ?.  =(timestamp.txn-id.a timestamp.txn-id.b)
    (gth timestamp.txn-id.a timestamp.txn-id.b)
  :: same timestamp, so either ships sent msg at same time, or order by
  :: txn-id
  ?:  =(sender.msg-id.a sender.msg-id.b)
    :: they are the same ship, so order by txn-id
    (gth txn-id.a txn-id.b)
  :: they are different ships, so just order by ship id
  (gth sender.msg-id.a sender.msg-id.b)
::
::  database types
::
+$  wallet-row
  $:  =network
      =wallet-index
      =address
      path=@t
      nickname=@t
  ==
::
+$  wallet-index  @ud
+$  wallets-table  (map wallet-index wallet-row)
::
+$  chain  ?(%bitcoin %btctestnet %ethereum)
+$  network  ?(%eth-main %eth-gorli)
+$  uniq-network  [=chain (unit =network)]
+$  txn-id  [uniq-network hash=@t]
+$  status  ?(%pending %failed %succeeded)
+$  transaction
  $:  =uniq-network
      hash=@t
      eth-type=(unit ?(%eth %erc20 %erc721))
      contract-type
      type=?(%sent %received)
      initiated-at=@da
      completed-at=(unit @da)
      our-address=@t
      their-patp=(unit @p)
      their-address=@t
      =status
      failure-reason=(unit @t)
      notes=@t
  ==
::
+$  transactions-table  ((mop txn-id transaction) idx-sort)
++  txnon           ((on txn-id transaction) idx-sort)
+$  tbl-and-ids     [tbl=transactions-table ids=(list txn-id)]
+$  msg-kvs         (list [k=txn-id v=transaction])
::
+$  table-name   ?(%wallets %transactions)
+$  table
  $%  [%wallets =wallets-table]
      [%transactions =transactions-table]
  ==
+$  tables  (list table)
::
::  agent details
::
+$  action
  $%  
      [%add-wallet =wallet-row]
      [%edit-wallet =wallet-index metadata=(map cord cord) peers-get-backlog=? invites=@tas max-expires-at-duration=@dr]
      [%insert =insert-transaction-action]
      [%complete-transaction =network ]
      [%save-transaction-notes ~]
  ==
+$  insert-transaction-action   [timestamp=@da =path fragments=(list minimal-fragment) expires-at=@da]
+$  edit-transaction-action     [=msg-id =path fragments=(list minimal-fragment)]
::
+$  db-dump
  $%  
      [%tables =tables]
  ==
+$  db-change-type
  $%
    [%add-row =db-row]
    [%upd-transactions-row =msg-id =message]
    [%upd-wallets-row =wallet-row old=wallet-row]
  ==
+$  db-row
  $%  [%wallets =wallet-row]
      [%transactions =transaction]
  ==
+$  db-change  (list db-change-type)
+$  del-log  ((mop time db-change-type) gth)
++  delon  ((on time db-change-type) gth)
:: old versions
+$  del-log-0  ((mop time db-change-type-0) gth)
+$  db-change-type-0
  $%
    [%add-row =db-row]
    [%upd-transactions =txn-id =transaction]
    [%upd-wallets-row =wallet-row]
    [%del-wallets-row =path timestamp=@da]
    [%del-transactions-row =wallet-index =txn-id timestamp=@da]
  ==
--
