/-  *chat-db
|%

+$  card  card:agent:gall
+$  versioned-state
  $%  state-0
      state-1
  ==
+$  state-0
  $:  %0
      =paths-table
      =messages-table
      =peers-table
      del-log=del-log-0
  ==
+$  state-1
  $:  %1
      =paths-table
      =messages-table
      =peers-table
      =del-log
  ==
+$  state-and-changes   [s=state-1 ch=db-change]
--
