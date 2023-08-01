/-  *calendar, p=pools
|%
+$  invite  [inviter=ship msg=@t]
::
+$  boxes
  $:  incoming-invites=(map cid invite)
      outgoing-invites=(map [cid ship] invite)
  ==
::
+$  async-invite  [=cid =ship msg=@t]
:: having checked permissions, forward these to %pools
::
+$  invite-action
  %+  pair  cid
  $%  [%invite =ship]
      [%cancel =ship]
      [%kick =ship]
      [%accept ~]
      [%reject ~]
  ==
::
+$  join-action
  %+  pair  cid
  $%  [%join ~]       :: forward %request to %pools
      [%leave ~]      :: forward %leave to %pools
  ==
::
+$  invite-gesture  (pair cid invite)
::
+$  process
  %+  pair  cid
  $%  [%invite =ship =invite] :: sent an invite
      [%watch ~]              :: watch this calendar
      [%leave ~]              :: leave this calendar
      [%kick =ship]           :: send a kick to a ship
  ==
::
+$  boxes-peek
  $%  [%boxes =boxes]
  ==
::
+$  pools-peek  peek:p
--
