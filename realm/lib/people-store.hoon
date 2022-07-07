/-  sur=people
/+  res=resource
=<  [sur .]
=,  sur
|%
::
++  enjs
  =,  enjs:format
  |%
  ++  action
    |=  upd=^action
    ^-  json
    %-  pairs
    ^-  (list [cord json])
    %-  weld
    :_  ^-  (list [cord json])
        :~  [%action s+-.upd]
            [%resource s+%people]
        ==
    ^-  (list [cord json])
    ?-  -.upd
    ::
        %add
      :~  :-  %context
          %-  pairs
          :~  [%space s+space.upd]
          ==
          :-  %data
          %-  pairs
          :~  [%ship (ship ship.upd)]
              [%person (cont person.upd)]
      ==  ==
    ::
        %remove
    :~  :-  %context
        %-  pairs
        :~  [%space s+space.upd]
        ==
        :-  %data
        %-  pairs
        :~  [%ship (ship ship.upd)]
    ==  ==
    ::
        %edit
    :~  :-  %context
        %-  pairs
        :~  [%space s+space.upd]
            [%ship (ship ship.upd)]
        ==
        :-  %data
        %-  pairs
        :~  [%edit-field (edit edit-field.upd)]
            [%timestamp (time timestamp.upd)]
    ==  ==  ==

  ::
  ++  cont
    |=  =person
    ^-  json
    %-  pairs
    :~  [%role [%s role.person]]
        [%rank [%s rank.person]]
        [%last-updated (time last-updated.person)]
    ==
  ::
  ++  edit
    |=  field=edit-field
    ^-  json
    %+  frond  -.field
    ?-  -.field
      %role      s+role.field
      %rank      s+rank.field
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
      :~  [%space so]
          [%ship (su ;~(pfix sig fed:ag))]
          [%person cont]
      ==
    ::
    ++  remove-person
      %-  ot
      :~  [%space so]
          [%ship (su ;~(pfix sig fed:ag))]
      ==
    ::
    ++  edit-person
      %-  ot
      :~  [%space so]
          [%ship (su ;~(pfix sig fed:ag))]
          [%edit-field edit]
          [%timestamp di]
      ==
    ::
    ++  cont
      %-  ot
      :~  [%role rol]
          [%rank rnk]
          [%last-updated di]
      ==
    ::
    ++  edit
      %-  of
      :~  [%rank rnk]
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
::
++  entxt
  =,  enjs:format
  |%
  ++  action
    |=  upd=^action
    ^-  cord
    (crip (en-json:html (action:enjs upd)))
  --
--