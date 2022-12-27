/-  chat=courier-chat
/-  cor=courier-path
|%
+$  action
  $%  
    [%accept-invite =path:cor]
    [%decline-invite =path:cor]
    [%invite-ship =path:cor =ship]
    [%kick-ship =path:cor =ship]
  ==
::
+$  reaction
  $% 
    [%invite-accepted =path:cor =preview:chat]
    [%invite-declined =path:cor]
    [%ship-invited =path:cor =ship]
    [%ship-kicked =path:cor =ship]
  ==
::
--