/-  notify, *post, *resource
|%
+$  card  card:agent:gall
+$  targetable-groups  ?(%1 %2)
+$  versioned-state
  $%  state-0
      state-1
      state-2
  ==
+$  state-0
  $:  %0
      =app-id:notify         :: constant
      =uuid:notify           :: (sham @p)
      =devices:notify        :: (map device-id player-id)
      push-enabled=?
  ==
+$  state-1
  $:  %1
      groups-target=targetable-groups
      =app-id:notify         :: constant
      =uuid:notify           :: (sham @p)
      =devices:notify        :: (map device-id player-id)
      push-enabled=?
  ==
+$  state-2
  $:  %2
      cache=msg-preview-cache
      groups-target=targetable-groups
      =app-id:notify         :: constant
      =uuid:notify           :: (sham @p)
      =devices:notify        :: (map device-id player-id)
      push-enabled=?
  ==

+$  local-whom-type
  $%  [%flag p=(pair ship term)]
      [%ship p=ship]
      [%club p=@uvH]
  ==
+$  msg-preview-cache  (map local-whom-type (list content))
++  migrate-state
  |=  old=versioned-state
  ^-  state-2
  ?-  -.old
      %0  [%2 *msg-preview-cache groups-target=%1 +.old]
      %1  [%2 *msg-preview-cache +.old]
      %2  old
  ==
--
