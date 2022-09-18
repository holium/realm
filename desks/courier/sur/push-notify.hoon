|%
+$  app-id            cord
+$  user-auth-key     (unit cord) 
+$  rest-api-key      cord 
::
+$  language          ?(%en)        ::  only english for now
::
+$  notification
  $:  =app-id                       ::  the onesignal app-id for realm
      included-segments=(list cord) ::  ["Subscribed Users"]
      data=mtd                      ::  { path: "/dm-inbox/~lomder-librun" }
      contents=(map language cord)  ::  {"en": "New message from ~lomder-librun"}
  ==
::
+$  mtd
  $:  path=cord 
  ==
::
+$  action
  $%  [%enable-push user-auth-key=cord]            
      [%disable-push user-auth-key=cord]  
  ==
::
--

