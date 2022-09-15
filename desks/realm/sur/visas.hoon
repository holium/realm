/-  membership, spc=spaces, pprt=passports
|%
::
+$  invitations
  $:  outgoing=outgoing-invitations
      incoming=incoming-invitations
  ==
::
+$  outgoing-invitations  (map space-path:spc space-invitations)
::         
+$  incoming-invitations  (map space-path:spc invite)
+$  space-invitations     (map ship invite)
+$  invite
  $:  inviter=ship
      path=space-path:spc
      role=role:membership
      message=cord
      name=space-name:spc
      type=space-type:spc
      picture=@t
      color=@t 
      invited-at=@da
  ==
::

+$  action
  $%  [%send-invite path=space-path:spc =ship =role:membership message=@t]
      [%accept-invite path=space-path:spc]
      [%decline-invite path=space-path:spc]
      [%invited path=space-path:spc =invite]
      [%stamped path=space-path:spc]
      [%kick-member path=space-path:spc =ship]
  ==

+$  reaction
  $%  [%invite-sent path=space-path:spc =ship =invite =passport:pprt]
      [%invite-accepted path=space-path:spc =ship =passport:pprt]
      [%kicked path=space-path:spc =ship]
  ==
::
+$  view
  $%  [%invitations invites=invitations]
      [%incoming invites=incoming-invitations]
  ==
::
--