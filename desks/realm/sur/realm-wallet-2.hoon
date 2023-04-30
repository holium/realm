|%
::  basic types
::
+$  address  @u
+$  network  ?(%bitcoin %btctestnet %ethereum)
+$  wallet  
  $:  =address
      path=@t
      nickname=@t
      transactions=(map net=@t (map hash=@t transaction))
      token-txns=(map net=@t (map @t (map hash=@t transaction)))
  ==
+$  mode  ?(%on-demand %default)
+$  pending-tx  [txh=(unit @ux) from=@ux to=@ux amount=@ud]
+$  txn  [block=@ud txh=@ux log-index=@ud from=@ux to=@ux amount=@ud]
+$  txn-log  (list txn)
+$  contract-type  ?(%erc20 %erc721)
+$  sharing
  $:  who=?(%nobody %friends %anybody)
      wallet-creation=mode
  ==
::  poke actions
::
+$  action
  $%  [%initialize ~]
      [%set-xpub =network xpub=@t]
      [%set-network-settings =network =mode who=?(%nobody %friends %anybody) blocked=(set who=@p) share-index=@ud =sharing]
      [%set-passcode-hash hash=@t]
      [%set-wallet-creation-mode =network =mode]
      [%set-sharing-mode =network who=?(%nobody %friends %anybody)]
      [%set-sharing-permissions type=%block who=@p]
      [%set-default-index =network index=@ud]
      [%create-wallet sndr=ship =network nickname=@t]
      [%request-address =network from=@p]
      [%receive-address =network address=(unit address)]
  ==
::  subscription updates
::
+$  update
  $%  [%eth-xpub xpub=(unit @t)]
      [%address =ship =network address=(unit address)]
      [%transaction =network net=@t wallet=@ud contract=(unit @t) hash=@t transaction]
::      [%history transactions]
      [%wallet =network @t =wallet]
      [%wallets wallets]
      [%settings settings]
      [%passcode passcode-hash=@t]
  ==
::  stores
::
+$  wallets  (map =network (map @ud wallet))
+$  settings
  $:  passcode-hash=@t
      networks=(map network [xpub=(unit @t) default-index=@ud =sharing])
      blocked=(set @p)
  ==
--
