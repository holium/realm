::
:: %rooms-v2: is a primitive for who is currently present.
::
::
/-  spaces=spaces-path
|%
+$  rid         @t
+$  title       cord
+$  capacity    @ud
+$  access      ?(%public %private)
+$  present     (set ship)
+$  whitelist   (set ship)
+$  space-path  path:spaces

+$  room
  $:  =rid
      provider=ship
      creator=ship
      =access
      =title
      =present
      =whitelist
      capacity=@ud
      path=(unit cord)
      type=room-type
  ==
::
+$  rooms  (map rid room)
::
+$  campfire
  [provider=ship =rid =room]
::
+$  chat  (map rid room)
::
+$  session-state
  $:  provider=ship
      =rooms
  ==
:: 
+$  provider-state
  $:  =rooms
      banned=(set ship)
  ==
::
+$  edit-payload
  $%  [%title =title]
      [%access =access]
  ==
::
+$  room-type  ?(%rooms %campfire %data)
::
+$  session-action
  $%  [%set-provider =ship]       
      [%reset-provider ~]
      [%create-room =rid =access =title path=(unit cord) type=room-type]
      [%edit-room =rid =title =access]
      [%delete-room =rid]
      [%enter-room =rid]
      [%leave-room =rid]
      [%invite =rid =ship]
      [%kick =rid =ship]
  ==
::
+$  reaction
  $%  [%room-entered =rid =ship]
      [%room-left =rid =ship]
      [%room-created =room]
      [%room-updated =room]
      [%room-deleted =rid]
      [%provider-changed provider=ship =rooms]
      [%invited provider=ship =rid =title =ship]
      [%kicked =rid =ship] 
  ==
::
+$  provider-action
  $%  [%ban =ship]
      [%unban =ship]
  ==
::
+$  signal-action
  $%  
      [%signal from=ship to=ship rid=cord data=cord]
  ==
::
+$  view
  $%  [%session =session-state]
      [%room =room]
      [%provider =ship]
  ==
::
--
