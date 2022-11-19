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
+$  host-state
  $:  =rooms
      online=?
      banned=(set ship)
  ==
::
+$  peer-state
  $:  provider=(unit ship)
      current=(unit rid)
      =rooms
  ==
::
+$  peer-action
  $%  [%set-provider =ship]       
      [%reset-provider ~]

      [%add-room =room]
      [%remove-room =rid]
      [%add-member =rid =ship]
      [%remove-member =rid =ship]
      [%set-whitelist =rid =whitelist]
      [%set-title =rid =title]
      [%set-access =rid =access]
      [%set-capacity =rid =capacity]
      [%set-space =rid =path:spaces]
      [%kick =rid =ship]

      [%join-room =rid]
      [%leave-room ~]
      [%invite =rid =ship]
      [%chat =cord]
  ==

::
+$  reactions
  $%  [%new-chat from=ship content=cord]
      [%entered =rid =ship]
      [%exited =rid =ship]
      [%room =room]
      [%rooms rooms=(set room)]
      [%invited provider=ship =rid =title =ship]
      [%kicked provider=ship =rid =title =ship]  
  ==
::
+$  host-action
  $%  [%set-online online=?]
      [%ban =ship]
      [%unban =ship]
      [%ban-set ships=(set ship)]
      [%unban-set ships=(set ship)]
      [%unban-all ~]
  ==
::
--
