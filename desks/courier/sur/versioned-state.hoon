/-  notify
|%
+$  card  card:agent:gall
+$  targetable-groups  ?(%1 %2)
+$  versioned-state
  $%  state-0
      state-1
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
++  migrate-state
  |=  old=versioned-state
  ^-  state-1
  ?-  -.old
      %0  [%1 groups-target=%1 +.old]
      %1  old
  ==
--

