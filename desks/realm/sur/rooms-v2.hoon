::
:: %rooms-v2: is a primitive for who is currently presence.
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
+$  room
  $:  =rid
      provider=ship
      creator=ship
      =access
      =title
      =present
      =whitelist
      capacity=@ud
      space=path:spaces
  ==
::
+$  rooms  (map rid room)
::
+$  session
  $:  provider=ship
      current=(unit rid)
      =rooms
  ==
:: 
+$  host-state
  $:  =rooms
      online=?
      banned=(set ship)
  ==
::
+$  peer-state
  $:  provider=ship
      current=(unit rid)
      =rooms
  ==
::
+$  peer-action
  $%  [%set-provider =ship]       
      [%reset-provider ~]
      [%create-room =rid =access =title]
      [%delete-room =rid]
      [%set-title =rid =title]
      [%set-access =rid =access]
      [%set-capacity =rid =capacity]
      [%set-space =rid =path:spaces]
      [%enter-room =rid]
      [%leave-room =rid]
      [%invite =rid =ship]
      [%kick =rid =ship]
      [%send-chat =cord]
  ==

::
+$  reaction
  $%  [%room-entered =rid =ship]
      [%room-left =rid =ship]
      [%room-created =room]
      [%room-updated =room]
      [%room-deleted =rid]
      [%provider provider=ship =rooms]
      [%invited provider=ship =rid =title =ship]
      [%kicked provider=ship =rid =title =ship]  
      [%new-chat from=ship content=cord]
  ==
::
:: +$  session-reaction
::   $%  [%entered =rid =ship]
::       [%exited =rid =ship]
::       [%room =room]
::       [%rooms provider=ship rooms=(set room)]
::       [%invited provider=ship =rid =title =ship]
::       [%kicked provider=ship =rid =title =ship]  
::       [%new-chat from=ship content=cord]
::   ==
::
+$  host-action
  $%  [%set-online online=?]
      [%ban =ship]
      [%unban =ship]
  ==
::
+$  view
  $%  [%session =session]
      [%room =room]
      [%provider =ship]
  ==
::
--
