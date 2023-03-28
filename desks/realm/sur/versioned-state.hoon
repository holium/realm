/-  *chat-db
|%

+$  card  card:agent:gall
+$  versioned-state
  $%  state-0
  ==
+$  state-0
  $:  %0
      =paths-table
      =messages-table
      =peers-table
      =del-log
  ==
+$  state-and-changes   [s=state-0 ch=db-change]
--
