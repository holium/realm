::  sur/rooms.hoon
::  Defines the types for the webrtc rooms in Realm.

/-  membership, spaces
|%
:: 
::  we may handle the participant status via webrtc only
::
::
+$  participants   (set ship)
+$  room-access    ?(%public %private)
+$  room
  $:  id=@t                 ::  hashed value used for unique room
      title=cord            ::  the title of the room
      host=space-type       ::  who the host is
      access=room-access    ::  is this room publicly shared or private invites
      =participants         ::  
  ==

+$  space-rooms     (map space-path:spaces room)
::
::  Poke actions
::  
::  %create: a host creates a room
::  %join: a ship joins a room (should check if invited depending on access)
::  %leave: a ship leave a room (should end the room if the host leaves)
::  %kick: only the host can kick a ship from the room
::
+$  action
  $%  [%create path=space-path:spaces payload=room-add]
      [%join path=space-path:spaces id=@t]
      [%leave path=space-path:spaces id=@t] 
      [%kick path=space-path:spaces id=@t participant=ship]
  ==
::
+$  room-add
  $:  title=space-name
      host=space-type
      access=room-access
      =participants
  ==
::
::  Reaction via watch paths
::
+$  reaction
  $%  [%initial path=space-path:spaces =space-rooms]
      [%room-add path=space-path:spaces =room]
      [%room-ended path=space-path:spaces id=@t]
      [%participant-joined path=space-path id=@t participant=ship]
      [%participant-left path=space-path id=@t participant=ship]
      [%participant-kicked path=space-path id=@t participant=ship]
  ==
--