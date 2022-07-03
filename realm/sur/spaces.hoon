::  sur/spaces.hoon
::  Defines the types for the spaces concept.

::  A space is a higher level concept above a %landscape group.
/-  *apps
|%

:: +$  choice  [label=@t description=@t action=@t]
:: +$  status  ?(%pending %recorded %counted)

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
      dock-color=@ux
      icon-color=@ux
      text-color=@ux
      window-color=@ux
      text-theme=@t
      wallpaper=@t
  ==

+$  arsenal
  $:  pinned=@t
      apps=(list apps)
  ==

+$  base-space
  $:  path=@t
      name=@t
      type=?(%group %our %dao)
      picture=@t
      =theme
      =token

  ==

--