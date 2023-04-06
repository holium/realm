::  sur/spaces/store.hoon
::  Defines the types for the spaces concept.
:: 
::  A space is a higher level concept above a %landscape group.
/-  membership, spaces-path, visas
|%
::
+$  space-path    path:spaces-path
+$  space-name    name:spaces-path
+$  space-description  cord
+$  group-space   [creator=ship name=@tas title=@t picture=@t color=@ux]
+$  token
  $:  chain=?(%ethereum %uqbar)
      contract=@t
      symbol=@t
      name=@t
      icon=@t
  ==
::
+$  theme-mode  ?(%dark %light)
+$  theme
  $:  mode=theme-mode
      background-color=@t
      accent-color=@t
      input-color=@t
      dock-color=@t
      icon-color=@t
      text-color=@t
      window-color=@t
      wallpaper=@t
  ==
:: handle-leave, handle-kick, handle-join, handle-accept
+$  chat-access
  $%  [%role =role:membership]        :: ships in the members map with status %joined or %host, and a specified role
      [%all ~]                        :: any ship in the members map, regardless of status
      [%whitelist ships=(set ship)]   :: specific ships, must also be in members map
      [%blacklist ships=(set ship)]   :: all ships in members map, except specific ships
  ==
+$  chat
  $:  =path
      access=chat-access
  ==
+$  chats  (map path chat)
::
+$  spaces              (map space-path space)
+$  space
  $:  path=space-path
      name=space-name
      description=space-description
      type=space-type
      access=space-access
      picture=@t
      color=@t  :: '#000000'
      =archetype
      =theme
      updated-at=@da
      =chats
  ==
::  %0 and %1 compatible types
+$  spaces-v1          (map space-path space-v1)
+$  space-v1
  $:  path=space-path
      name=space-name
      description=space-description
      type=space-type
      access=space-access
      picture=@t
      color=@t  :: '#000000'
      =archetype
      theme=theme
      updated-at=@da
  ==
+$  space-type     ?(%group %space %our)
+$  archetype      ?(%home %community %creator-dao %service-dao %investment-dao)
+$  space-access   ?(%public %antechamber %private)
::
::
::  Poke actions
::
+$  action
  $%  [%add slug=@t payload=add-payload members=members:membership]
      [%update path=space-path payload=edit-payload]
      [%remove path=space-path]
      [%join path=space-path]
      [%leave path=space-path]
      [%current path=space-path]  :: set the currently opened space
      :: [%kicked path=space-path ship=ship]
  ==
::
+$  add-payload
  $:  name=space-name
      description=space-description
      type=space-type
      access=space-access
      picture=@t
      color=@t  :: '#000000'
      =archetype
  ==
::
+$  edit-payload
  $:  name=@t
      description=@t
      access=space-access
      picture=@t
      color=@t
      =theme
  ==
::
::  Reaction via watch paths
::
+$  reaction
  $%  [%initial =spaces =membership:membership =invitations:visas current=space-path]
      [%add =space members=members:membership]
      [%replace =space]
      [%remove path=space-path]
      [%remote-space path=space-path =space =members:membership]
      [%current path=space-path]
  ==
::
::  Scry views
::
+$  view :: rename to effects
  $%  [%spaces =spaces]
      [%space =space]
  ==
::
--
