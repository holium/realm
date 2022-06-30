/-  sur=people-store
/+  res=resource
=<  [sur .]
=,  sur
|%
::
++  enjs
  =,  enjs:format
  |%
  ++  update
    |=  upd=^update
    ^-  json
    %+  frond  %people-update
    %-  pairs
    :_  ~
    ^-  [cord json]
    ?-  -.upd
    ::
        %add
      :-  %add
      %-  pairs
      :~  [%ship (ship ship.upd)]
          [%person (cont person.upd)]
      ==
    ::
        %remove
      :-  %remove
      (pairs [%ship (ship ship.upd)]~)
    ::
        %edit
      :-  %edit
      %-  pairs
      :~  [%ship (ship ship.upd)]
          [%edit-field (edit edit-field.upd)]
          [%timestamp (time timestamp.upd)]
      ==
    ==
  ::
  ++  cont
    |=  =person
    ^-  json
    %-  pairs
    :~  [%rank s+rank.person]
        [%last-updated (time last-updated.person)]
    ==
  ::
  ++  edit
    |=  field=edit-field
    ^-  json
    %+  frond  -.field
    ?-  -.field
      %rank      s+rank.field
    ==
  --
::
++  dejs
  =,  dejs:format
  |%
  ++  update
    |=  jon=json
    ^-  ^update
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
          [%person cont]
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
    ++  cont
      %-  ot
      :~  [%rank so]
      ==
    ::
    ++  edit
      %-  of
      :~  [%rank so]
      ==
    --
  --