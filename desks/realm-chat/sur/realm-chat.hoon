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
      mutes=(list path)      :: the list of muted chat `path`s
  ==
::
+$  action
  $%
      :: interface to %chat-db
      [%create-chat =create-chat-data]
      [%edit-chat =path metadata=(map cord cord)]
      [%add-ship-to-chat =path =ship]
      [%remove-ship-from-chat =path =ship]
      [%send-message =path fragments=(list minimal-fragment:db)]
      [%edit-message =edit-message-action:db]
      [%delete-message =path =msg-id:db]

      :: internal %realm-chat state updaters
      [%enable-push ~]
      [%disable-push ~]
      [%set-device =device-id:notify =player-id:notify]
      [%remove-device =device-id:notify]
      [%mute-chat =path mute=?]
  ==
+$  create-chat-data  [metadata=(map cord cord) type=@tas peers=(list ship)]
--
