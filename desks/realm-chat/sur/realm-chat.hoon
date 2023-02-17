/-  db=chat-db, notify
::  realm-chat [realm]
::
|%
+$  card  card:agent:gall
+$  versioned-state
  $%  state-0
  ==
+$  state-0
  $:  %0
      =app-id:notify         :: constant
      =uuid:notify           :: (sham @p)
      =devices:notify        :: (map device-id player-id)
      push-enabled=?
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

      [%enable-push ~]
      [%disable-push ~]
      [%set-device =device-id:notify =player-id:notify]
      [%remove-device =device-id:notify]
  ==
+$  create-chat-data  [metadata=(map cord cord) type=@tas peers=(list ship)]
--
