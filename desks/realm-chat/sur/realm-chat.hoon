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
      [%send-message =insert-message-action:db]
  ==
--
