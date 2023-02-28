/-  db=chat-db, notify
::  realm-chat [realm]
::
|%
+$  card   card:agent:gall
+$  pins   (set path)
+$  mutes  (set path)
+$  versioned-state
  $%  state-0
  ==
+$  state-0
  $:  %0
      =app-id:notify         :: constant
      =uuid:notify           :: (sham @p)
      =devices:notify        :: (map device-id player-id)
      push-enabled=?
      =mutes                 :: the list of muted chat `path`s
      =pins                  :: the set of pinned chat `path`s
  ==
::
+$  action
  $%
      :: interface to %chat-db
      [%create-chat =create-chat-data]
      [%edit-chat =path metadata=(map cord cord) peers-get-backlog=?]
      [%pin-message =path =msg-id:db pin=?]
      [%add-ship-to-chat =path =ship]
      [%remove-ship-from-chat =path =ship]
      [%send-message =path fragments=(list minimal-fragment:db) expires-at=@da]
      [%edit-message =edit-message-action:db]
      [%delete-message =path =msg-id:db]
      [%delete-backlog =path]

      :: internal %realm-chat state updaters
      [%enable-push ~]
      [%disable-push ~]
      [%set-device =device-id:notify =player-id:notify]
      [%remove-device =device-id:notify]
      [%mute-chat =path mute=?]  :: toggles the muted-state of the path
      [%pin-chat =path pin=?]    :: toggles the pinned-state of the path
  ==
+$  create-chat-data  [metadata=(map cord cord) type=@tas peers=(list ship) invites=@tas max-expires-at-duration=@dr]
--
