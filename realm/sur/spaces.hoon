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
+$  spaces              (map space-path space)
::
+$  invitations
  $:  outgoing=(map space-path space-invitations)
      incoming=(map space-path invite)
  ==
::         
+$  our-invites         (map space-path invite)
+$  space-invitations   (map ship invite)
+$  invite
  $:  inviter=ship
      path=space-path
      role=role:membership
      message=cord
      name=space-name
      type=space-type
      invited-at=@da
  ==
::
::  Poke actions
::
+$  action
  $%  [%add slug=@t payload=add-payload members=members:membership]
      [%update path=space-path payload=edit-payload]
      [%remove path=space-path]
      :: Managing members
      :: [%invite path=space-path =ship =roles:membership]
      :: [%kick path=space-path =ship]
      :: [%ban path=space-path =ship]
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
  $%  [%spaces-reaction spaces-reaction]
      [%invite-reaction invite-reaction]
  ==
::
+$  spaces-reaction
  $%  [%initial =spaces =membership:membership]
      [%add =space =members:membership]
      [%replace =space]
      [%remove path=space-path]
      [%space path=space-path =space =members:membership]
  ==
::
::  Scry views
::
+$  view :: rename to effects
  $%  [%space =space]
      [%spaces =spaces]
      [%members =members:membership]
      [%friends =members:membership]
  ==
::
:::::::::::::
+$  invite-action
  $%  [%send-invite path=space-path =ship =role:membership message=@t]
      [%accept-invite path=space-path]
      [%invited path=space-path =invite]
      [%stamped path=space-path]
      [%kick-member path=space-path =ship]
  ==

+$  invite-reaction
  $%  [%invite-sent path=space-path =invite]
      [%invite-accepted path=space-path =ship =member:membership]
      [%kicked path=space-path =ship]
  ==
::
+$  invite-view
  $%  [%invitations invites=our-invites]
  ==
::
--