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
      title=(map cord cord)         ::  {"en": "Sender Name"}
      subtitle=(map cord cord)      ::  (optional) {"en": "Group title"}
      contents=(map cord cord)      ::  {"en": "New Message"} or the actual message
  ==
::
+$  mtd
  $:  path=cord 
      member-meta=mem-meta
      unread=@ud
      avatar=(unit @t)
  ==
::
+$  view
  $%  
      [%devices =devices]
  ==
--

