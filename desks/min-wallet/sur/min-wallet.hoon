|%
::  basic types
::
+$  address  @u
+$  network  ?(%bitcoin %ethereum)
+$  transaction
  $:  type=?(%btc %eth %erc20 %erc721)
      hash=@u
  ==
+$  status  ?(%pending %failed %succeeded)
+$  eth-type  ?(%erc20 %erc721 %eth)
+$  wallet  [=address path=@t nickname=@t balance=@]
+$  mode  ?(%on-demand %default)
+$  pending-tx  [txh=(unit @ux) from=@ux to=@ux amount=@ud]
+$  txn  [block=@ud txh=@ux log-index=@ud from=@ux to=@ux amount=@ud]
+$  txn-log  (list txn)
+$  contract-type  ?(%erc20 %erc721)
+$  sharing
  $:  who=?(%nobody %friends %anybody)
      wallet-creation=mode
      whitelist=(set @p)
      blocked=(set @p)
  ==
::  poke actions
::
+$  action
  $%  [%initialize ~]
      [%set-xpub =network xpub=@t]
      [%set-wallet-creation-mode =mode]
      [%set-sharing-mode who=?(%nobody %friends %anybody)]
      [%sharing-permissions type=?(%allow %block) who=@p]
      [%set-default-index =network index=@t]
      [%set-wallet-nickname =network index=@t nickname=@t]
      [%create-wallet sndr=ship =network nickname=@t]
      [%request-address =network from=@p]
      [%receive-address =network address=(unit address)]
      [%enqueue-transaction =network hash=@ =transaction]
      ::[%enqueue-transaction =network hash=@ =transaction]
      [%save-transaction-notes =network hash=@t notes=@t]
  ==
::  subscription updates
::
+$  update
  $%  [%address =ship =network address=(unit address)]
      [%history transactions]
      [%wallet =network @t =wallet]
      [%wallets wallets]
  ==
::  stores
::
+$  wallets  (map =network (map @ud wallet))
+$  transactions  (map network (map @t transaction))
+$  settings
  $:  =sharing
      networks=(map network [xpub=(unit @t) default-index=@ud])
  ==
--
