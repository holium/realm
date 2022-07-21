::  sur/spaces.hoon
::  Defines the types for the spaces concept.

::  A space is a higher level concept above a %landscape group.
/-  membership
|%
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
::
+$  space-name     cord  :: should be a unique name to the ship
+$  space-path     [ship=ship space=space-name]
+$  space-type     ?(%group %space %our)
+$  archetype      ?(%home %lodge %creator-dao %service-dao %investment-dao)
+$  space-access   ?(%public %antechamber %private)
+$  space
  $:  path=space-path
      name=space-name
      type=space-type
      access=space-access
      picture=@t
      color=@t  :: '#000000'
      =archetype
      theme=theme
      updated-at=@da
  ==
::
+$  spaces  (map space-path space)
::
::  Poke actions
::
+$  action
  $%  [%add slug=@t payload=add-payload members=members:membership]
      [%update path=space-path payload=edit-payload]
      [%remove path=space-path]
  ==
::
+$  add-payload
  $:  name=space-name
      type=space-type
      access=space-access
      picture=@t
      color=@t  :: '#000000'
      =archetype
  ==
::
+$  edit-payload
  $%  [%name name=@t]
      [%picture picture=@t]
      [%color color=@t]
      [%theme =theme]
  ==
::
::  Reaction via watch paths
::
+$  reaction
  $%  [%initial =spaces =membership:membership]
      [%add =space =members:membership]
      [%replace =space]
      [%remove path=space-path]
  ==
::
::  Scry views
::
+$  view
  $%  [%space =space]
      [%spaces =spaces]
  ==
--