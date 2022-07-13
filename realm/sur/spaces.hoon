::  sur/spaces.hoon
::  Defines the types for the spaces concept.

::  A space is a higher level concept above a %landscape group.
/-  *apps
|%
+$  token
  $:  chain=?(%ethereum %uqbar)
      contract=@t
      symbol=@t
      name=@t
      icon=@t
  ==
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

+$  space-name  cord  :: should be a unique name to the ship
+$  space-path  [ship=ship space=space-name]
+$  space-type  ?(%group %our)
+$  space
  $:  path=space-path
      name=space-name
      type=space-type
      picture=@t
      color=@t  :: '#000000'
      theme=theme
      updated-at=@da
  ==
::
+$  spaces  (map space-path space)
::
:: /~lomder-librun/my-new-group
+$  edit-action
  $%  [%name name=@t]
      [%picture picture=@t]
      [%color color=@t]
      [%theme =theme]
  ==
::
::  Poke actions
::
+$  action
  $%  [%add name=@t slug=@t type=space-type]
      [%update path=space-path payload=edit-action]
      [%remove path=space-path]
  ==
::
::  Reaction via watch paths
::
+$  reaction
  $%  [%initial =spaces]
      [%add =space]
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