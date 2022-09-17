|%
::  basic types
::
+$  address  @u
+$  network  ?(%bitcoin %ethereum)
+$  help-tx
  $:  hash=@t
      amount=@t
      =network
      type=?(%sent %received)
      initiated-at=@t
      completed-at=(unit @t)
      our-address=@t
      their-patp=(unit @t)
      their-address=@t
      =status
      failure-reason=(unit @t)
      notes=@t
  ==
+$  transaction  ::  json
  $:  hash=@t
      amount=@t
      =network
      type=?(%sent %received)
      initiated-at=@t
      completed-at=(unit @t)
      our-address=@t
      their-patp=(unit @p)
      their-address=@t
      =status
      failure-reason=(unit @t)
      notes=@t
  ==
+$  status  ?(%pending %failed %succeeded)
+$  contracts-map  (map contract-id contract-data)
+$  wallet  [=address path=@t nickname=@t balance=@ =contracts-map]
+$  mode  ?(%on-demand %default)
+$  pending-tx  [txh=(unit @ux) from=@ux to=@ux amount=@ud]
+$  txn  [block=@ud txh=@ux log-index=@ud from=@ux to=@ux amount=@ud]
+$  txn-log  (list txn)
+$  contract-id  @t
+$  contract-data
  $%  [%erc20 name=@t =address balance=@ud =txn-log pending-txs=(map tid=@ta pending-tx)]
      [%erc721 name=@t =address tokens=(set @ud) =txn-log pending-txs=(map tid=@ta pending-tx)]
  ==
+$  tx-rez  [txh=@ux status=? block=@ud]
+$  contract-type  ?(%erc20 %erc721)
::  poke actions
::
+$  action
  $%  [%initialize ~]
      [%set-xpub =network xpub=@t]
      [%set-wallet-creation-mode =mode]
      [%set-default-index =network index=@t]
      [%set-wallet-nickname =network index=@t nickname=@t]
      [%set-network-provider =network provider=@t]
      [%create-wallet sndr=ship =network nickname=@t]
      [%request-address =network from=@p]
      [%receive-address =network address=(unit address)]
      [%enqueue-transaction =network hash=@ =transaction]
      [%add-smart-contract contract-id=@t =contract-type name=@t address=@ux wallet-index=@t]
  ==
::  subscription updates
::
+$  update
  $%  [%address =ship =network address=(unit address)]
      [%transaction =network @t transaction success=?]
      [%history transaction-history]
      [%wallet =network @t =wallet]
      [%wallets wallets]
  ==
::  stores
::
+$  transaction-queue        (map network (map @t [hash=@ transaction]))
+$  transaction-history  (map network (map @t transaction))
+$  transactions  (map network (map @t transaction))
+$  wallets  (map =network (map @t wallet))
+$  settings
  $:  wallet-creation=mode
      networks=(map network [xpub=(unit @t) index=@t provider=(unit @t)])
  ==
--
