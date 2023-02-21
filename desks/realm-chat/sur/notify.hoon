|%

+$  player-id         cord
+$  device-id         cord
+$  app-id            cord
+$  rest-api-key      cord 
+$  uuid              @uvH
+$  devices           (map device-id player-id)
+$  contact-mtd
  $:
    color=@ux
    avatar=(unit @t)
    nickname=@t
  ==
+$  mem-meta          (map @t [@ux (unit @t) @t])
::
::
+$  notification
  $:  =app-id                       ::  the onesignal app-id for realm
      data=mtd                      ::  { path: "/dm-inbox/~lomder-librun" }
      subtitle=(map cord cord)      ::  {"en": "New message"}
      contents=(map cord cord)      ::  {"en": "from ~dev"}
  ==
::
+$  mtd
  $:  path=cord 
      member-meta=mem-meta
  ==
::
+$  view
  $%  
      [%devices =devices]
  ==
--

