::  wallet-db [realm]
::
|%
++  address  @u
::
::  database types
::
+$  wallet-row
  $:  =chain
      =wallet-index
      =address
      path=@t
      nickname=@t
  ==
::
+$  wallet-index  @ud
+$  wallet-id  [=chain =wallet-index]
+$  wallets-table  (map =wallet-id wallet-row)
::
+$  chain  ?(%bitcoin %btctestnet %ethereum)
+$  network  ?(%eth-main %eth-gorli)
+$  uniq-network  [=chain network=(unit network)]
+$  txn-id  [uniq-network hash=@t]
+$  status  ?(%pending %failed %succeeded)
+$  transaction-row
  $:  uniq-network
      hash=@t
      =wallet-id
      eth-type=(unit ?(%eth %erc20 %erc721))
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
+$  transactions-table  (map txn-id transaction-row)
+$  tbl-and-ids     [tbl=transactions-table ids=(list txn-id)]
+$  txn-kvs         (list [k=txn-id v=transaction-row])
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
      [%set-wallet =wallet-row]
      [%insert-transaction =transaction-row]
      [%complete-transaction =txn-id]
      [%save-transaction-notes =txn-id notes=@t]
  ==
::
+$  db-dump
  $%  
      [%tables =tables]
  ==
+$  db-change-type
  $%
    [%add-row =db-row]
    [%upd-transactions-row =txn-id =transaction-row]
    [%upd-wallets-row =wallet-row old=wallet-row]
  ==
+$  db-row
  $%  [%wallets =wallet-row]
      [%transactions =transaction-row]
  ==
+$  db-change  (list db-change-type)
++  delon  ((on time db-change-type) gth)
::
::
+$  state-0  [%0 =wallets-table =transactions-table]
+$  versioned-state
  $%  state-0
  ==
--
