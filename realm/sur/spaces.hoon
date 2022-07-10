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

+$  theme
  $:  label=@t
      background-color=@ux
      accent-color=@ux
      input-color=@ux
      dock-color=@ux
      icon-color=@ux
      text-color=@ux
      window-color=@ux
      text-theme=@t
      mode=?(%dark %light)
      wallpaper=@t
  ==

+$  arsenal
  $:  pinned=@t
      apps=(list apps)
  ==

+$  space
  $:  path=@t
      name=@t
      type=?(%group %our %dao)
      picture=@t
      color=@ux
      =theme
      =token
  ==

--