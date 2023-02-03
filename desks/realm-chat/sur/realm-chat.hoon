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
      [%remove-ship-from-chat =path =ship]
      [%send-message =path fragments=(list minimal-fragment:db)]
      [%edit-message =edit-message-action:db]
      [%delete-message =path =msg-id:db]
  ==
+$  create-chat-data  [metadata=(map cord cord) type=@tas]
--
