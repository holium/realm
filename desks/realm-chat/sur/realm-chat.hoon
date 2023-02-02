/-  db=chat-db
::  realm-chat [realm]
::
|%
+$  card  card:agent:gall
+$  versioned-state
  $%  state-0
  ==
+$  state-0
  $:  %0
      misc=@t
  ==
::
+$  action
  $%
      [%create-chat =create-chat-data]
      [%add-ship-to-chat =path =ship]
      [%send-message =insert-message-action:db]
  ==
+$  create-chat-data  [metadata=(map cord cord) type=@tas]
--
