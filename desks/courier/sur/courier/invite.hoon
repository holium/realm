/-  chat=courier-chat
/-  cor=courier-core
|%
+$  action
  $%  
    [%accept-invite path=courier-path:cor]
    [%decline-invite path=courier-path:cor]
    [%invite-ship path=courier-path:cor =ship]
    [%kick-ship path=courier-path:cor =ship]
  ==
::
+$  reaction
  $% 
    [%invite-accepted path=courier-path:cor =preview:chat]
    [%invite-declined path=courier-path:cor]
    [%ship-invited path=courier-path:cor =ship]
    [%ship-kicked path=courier-path:cor =ship]
  ==
::
--