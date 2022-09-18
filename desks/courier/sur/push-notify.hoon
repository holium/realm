|%
+$  app-id            cord
+$  rest-api-key      cord 
+$  uuid              @uvH
::
::
+$  notification
  $:  =app-id                       ::  the onesignal app-id for realm
      included-segments=(list cord) ::  ["Subscribed Users"]
      data=mtd                      ::  { path: "/dm-inbox/~lomder-librun" }
      contents=(map cord cord)      ::  {"en": "New message from ~lomder-librun"}
  ==
::
+$  mtd
  $:  path=cord 
  ==
::
+$  action
  $%  [%enable-push ~]            
      [%disable-push ~]  
  ==
::
+$  view
  $%  
      [%uuid =uuid]
  ==
--

