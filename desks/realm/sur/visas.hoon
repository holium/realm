/-  membership, spc=spaces-store
|%
::
:: +$  passport
::   $:  =roles:membership
::       alias=cord
::       status=status:membership
::   ==
:: ::
:: ::  $passports: passports (access) to spaces within Realm
:: +$  passports      (map ship passport)
:: ::
:: ::  $districts: subdivisions of the entire realm universe
:: +$  districts     (map path=space-path:spaces passports)
::
+$  invitations           (map space-path:spc invite)
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
  $%  [%invite-sent path=space-path:spc =ship =invite =member:membership]
      [%invite-received path=space-path:spc =invite]
      [%invite-removed path=space-path:spc]
      [%invite-accepted path=space-path:spc =ship =member:membership]
      [%kicked path=space-path:spc =ship]
  ==
::
+$  view
  $%  [%invitations invites=invitations]
  ==
::
--