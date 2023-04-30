/-  *wallet-db
|%
::  basic types
::
+$  address  @u
+$  mode  ?(%on-demand %default)
+$  sharing
  $:  who=?(%nobody %friends %anybody)
      wallet-creation=mode
  ==
::  poke actions
::
+$  action
  $%  [%initialize ~]
      [%set-xpub =chain xpub=@t]
      [%set-network-settings =chain =mode who=?(%nobody %friends %anybody) blocked=(set who=@p) share-index=@ud =sharing]
      [%set-passcode-hash hash=@t]
      [%set-wallet-creation-mode =chain =mode]
      [%set-sharing-mode =chain who=?(%nobody %friends %anybody)]
      [%set-sharing-permissions type=%block who=@p]
      [%set-default-index =chain index=@ud]
      [%create-wallet sndr=ship =chain nickname=@t]
      [%request-address =chain from=@p]
      [%receive-address =chain address=(unit address)]
  ==
::  subscription updates
::
+$  update
  $%  [%address =ship =chain address=(unit address)]
      [%settings settings]
  ==
+$  view
  $%  [%eth-xpub xpub=(unit @t)]
      [%settings settings]
      [%passcode-hash passcode-hash=@t]
  ==
::  stores
::
+$  settings
  $:  passcode-hash=@t
      chains=(map chain [xpub=(unit @t) default-index=@ud =sharing])
      blocked=(set @p)
  ==
--
