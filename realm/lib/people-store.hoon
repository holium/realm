/-  sur=people
/+  res=resource
=<  [sur .]
=,  sur
|%
++  nu                                              ::  parse number as hex
  |=  jon=json
  ?>  ?=([%s *] jon)
  (rash p.jon hex)
::
++  enjs
  =,  enjs:format
  |%
  ++  action
    |=  act=^action
    ^-  json
    %+  frond  %people-action
    %-  pairs
    :_  ~
    ^-  [cord json]
    ?-  -.act
    ::
        %add
      :-  %add
      %-  pairs
      :~  [%ship (ship ship.act)]
          [%person (pers person.act)]
      ==
    ::
        %remove
      :-  %remove
      (pairs [%ship (ship ship.act)]~)
    ::
        %edit
      :-  %edit
      %-  pairs
      :~  [%ship (ship ship.act)]
          [%edit-field (edit payload.act)]
          [%timestamp (time timestamp.act)]
      ==
    ==
  ::
  ++  pers
    |=  =person
    ^-  json
    %-  pairs
    :~  [%role s+role.person]
        [%rank s+rank.person]
        [%nickname s+nickname.contact.person]
        [%bio s+bio.contact.person]
        [%status s+status.contact.person]
        [%color s+(scot %ux color.contact.person)]
        [%avatar ?~(avatar.contact.person ~ s+u.avatar.contact.person)]
        [%cover ?~(cover.contact.person ~ s+u.cover.contact.person)]
        [%groups a+(turn ~(tap in groups.contact.person) (cork enjs-path:res (lead %s)))]
        [%last-updated (time last-updated.contact.person)]
    ==
  ::
  ++  edit
    |=  field=edit-field
    ^-  json
    %+  frond  -.field
    ?-  -.field
      %role      [%s role.field]
      %rank      [%s rank.field]
    ==
  --
::
++  dejs
  =,  dejs:format
  |%
  ++  action
    |=  jon=json
    ^-  ^action
    =<  (decode jon)
    |%
    ++  decode
      %-  of
      :~  [%add add-person]
          [%remove remove-person]
          [%edit edit-person]
      ==
    ::
    ++  add-person
      %-  ot
      :~  [%ship (su ;~(pfix sig fed:ag))]
          [%person pers]
      ==
    ::
    ++  remove-person  (ot [%ship (su ;~(pfix sig fed:ag))]~)
    ::
    ++  edit-person
      %-  ot
      :~  [%ship (su ;~(pfix sig fed:ag))]
          [%edit-field edit]
          [%timestamp di]
      ==
    ::
    ++  pers
      %-  ot
      :~  [%role rol]
          [%rank rnk]
          [%contact cont]
      ==
    ::
    ++  cont
      %-  ot
      :~  [%nickname so]
          [%bio so]
          [%status so]
          [%color nu]
          [%avatar (mu so)]
          [%cover (mu so)]
          [%groups (as dejs:res)]
          [%last-updated di]
      ==
    ::
    ++  edit
      %-  of
      :~  [%role rol]
          [%rank rnk]
      ==
    ::
    ++  rnk
      |=  =json
      ^-  rank:title
      ?>  ?=(%s -.json)
      ?:  =('czar' p.json)  %czar
      ?:  =('king' p.json)  %king
      ?:  =('duke' p.json)  %duke
      ?:  =('earl' p.json)  %earl
      ?:  =('pawn' p.json)  %pawn
      !!
    ::
    ++  rol
      |=  =json
      ^-  role
      ?>  ?=(%s -.json)
      ?:  =('owner' p.json)  %owner
      ?:  =('admin' p.json)  %admin
      ?:  =('member' p.json)  %member
      ?:  =('initiate' p.json)  %initiate
      !!
    --
  --
--