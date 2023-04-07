/-  membership, spaces-path
|%
::
+$  space-path    path:spaces-path

:: handle-leave, handle-kick, handle-join, handle-accept
+$  chat-access
  $%  [%role =role:membership]        :: ships in the members map with status %joined or %host, and a specified role
      [%all ~]                        :: any ship in the members map, regardless of status
      [%whitelist ships=(set ship)]   :: specific ships, must also be in members map
      [%blacklist ships=(set ship)]   :: all ships in members map, except specific ships
  ==
::
+$  chat
  $:  =path
      access=chat-access
  ==
::
+$  chats         (map path chat)
+$  space-chats   (map space-path chats)
::
:: +$  state-0  
::   $:  %0
::       chats=space-chats
::   ==
::
:: +$  action
::   $%  [%create-channel ~]
::       [%delete-channel ~]
::   ==
::
--