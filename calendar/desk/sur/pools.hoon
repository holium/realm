/+  vio=ventio
|%
+$  id       [host=ship name=term]
:: graylist - blacklist and whitelist
:: automatic request handling
:: | auto reject or & auto accept
::
+$  graylist
  $:  ship=(map ship ?)       :: black/whitelisted ships
      rank=(map rank:title ?) :: black/whitelisted ranks (i.e. banning comets)
      rest=(unit ?)           :: auto reject/accept remaining
  ==
:: option to outsource graylisting
::
+$  graylist-scry  $~([%pools /graylist-gate] [=dude:gall =path])
+$  graylist-gate  $-([id ship] (unit ?))
::
+$  pool
  $:  members=(set ship)                        :: already joined (includes host)
      invited=(map ship (pair time (unit ?)))   :: outgoing
      requested=(map ship (pair time (unit ?))) :: incoming
      =graylist                                 :: automatic accept/reject
      scry=graylist-scry                        :: optionally outsource graylist
  ==
:: each field update is a total field replacement
::
+$  field
  $%  [%ship p=(each [ship ?] ship)]
      [%rank p=(each [rank:title ?] rank:title)]
      [%rest p=(unit ?)]
      [%graylist =graylist]
  ==
::
+$  crud-command
  %+  pair  id
  $%  [%create fields=(list field) scry=(unit graylist-scry)]
      [%update fields=(list field)]
      [%delete ~]
  ==
:: create an id based on a name
::
+$  create-command
  [name=@t fields=(list field) scry=(unit graylist-scry)]
::
+$  invite-command
  %+  pair  id
  $%  [%invite =ship]
      [%cancel =ship]
      [%kick =ship]   :: kick a member
      [%kick-blacklisted ~] :: kick all blacklisted members
      [%accept ~]
      [%reject ~]
  ==
::
+$  request-command
  %+  pair  id
  $%  [%request ~]
      [%cancel ~]            
      [%leave ~]      :: leave a pool
      [%accept =ship]
      [%reject =ship]
  ==
::
+$  invite-gesture
  %+  pair  id
  $?  %invite         :: host to invitee
      %cancel         :: host to invitee
      %accept         :: invitee to host
      %reject         :: invitee to host
  ==
::
+$  request-gesture
  %+  pair  id
  $?  %request        :: requester to host
      %cancel         :: requester to host
      %accept         :: host to requester
      %reject         :: host to requester
  ==
::
+$  process-reply
  %+  pair  id
  $%  [%invite-sent =ship]
      [%invite-accepted ~]
      [%invite-rejected ~]
      [%request-sent ~]
  ==
::
+$  pool-update
  $%  field
      [%pool =pool]
      [%member p=(each ship ship)]
      [%invited p=(each [ship (pair time (unit ?))] ship)]
      [%requested p=(each [ship (pair time (unit ?))] ship)]
  ==
::
+$  home-update
  $%  [%pool p=(each id id)] :: new pool watched or created
      [%invite p=(each [id (pair time (unit ?))] id)]
      [%request p=(each [id (pair time (unit ?))] id)]
  ==
::
+$  peek
  $%  [%pools pools=(map id pool)]
      [%pool =pool]
      [%invites invites=(map id (pair time (unit ?)))]
      [%requests requests=(map id (pair time (unit ?)))]
  ==
::
+$  pools-vent
  $@  ~
  $%  [%id =id]
  ==
--
