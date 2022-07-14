::  people [realm]:
::
::  People management lib within Realm. Mostly handles [de]serialization
::    to/from json from types stored in people sur.
::
::  Permissions management is centralized in the spaces agent. People
::   agent synch's permissions with spaces. People agent also
::   synch's contacts from contact-store.
::
::
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
      :~  [%path s+(spat /(scot %p ship.path.act)/(scot %tas space.path.act))]
          [%ship (ship ship.act)]
          [%person (pers person.act)]
          [%roles (rols roles.act)]
      ==
    ::
        %remove
      :-  %remove
      (pairs [%ship (ship ship.act)]~)
    ::
        %edit
      :-  %edit
      %-  pairs
      :~  [%path (pth path.act)]
          [%ship (ship ship.act)]
          [%payload (edit payload.act)]
      ==
    ::
        %ping
      :-  %ping
      (pairs [%msg ?~(msg.act ~ s+(need msg.act))]~)
    ==
  ::
  ++  pth
    |=  path=space-path:spaces
    ^-  json
    [%s (spat /(scot %p ship.path)/(scot %tas space.path))]
  ::
  ++  pers
    |=  =person
    ^-  json
    %-  pairs
    :~  [%last-known-active ?~(last-known-active.person ~ (time (need last-known-active.person)))]
    ==
  ::
  ++  edit
    |=  field=edit-field
    ^-  json
    %+  frond  -.field
    ?-  -.field
      %alias      [%s alias.field]
    ==
  ::
  ++  rols
    |=  =roles:membership
    ^-  json
    [%a (turn ~(tap in roles) |=(rol=role:membership s+(scot %tas rol)))]
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
      :~  [%path pth]
          [%ship (su ;~(pfix sig fed:ag))]
          [%person pers]
          [%roles (as rol)]
      ==
    ::
    ++  remove-person
      %-  ot
      :~  [%path pth]
          [%ship (su ;~(pfix sig fed:ag))]
      ==
    ::
    ++  edit-person
      %-  ot
      :~  [%path pth]
          [%ship (su ;~(pfix sig fed:ag))]
          [%payload edit-payload]
      ==
    ::
    ++  pers
      %-  ot
      :~  [%last-known-active (mu di)]
      ==
    ::
    ++  pth
      %-  ot
      :~  [%ship (su ;~(pfix sig fed:ag))]
          [%space so]
      ==
    ::
    ++  edit-payload
      %-  of
      :~  [%alias so]
      ==
    ::
    ++  rol
      |=  =json
      ^-  role:membership
      ?>  ?=(%s -.json)
      ?:  =('initiate' p.json)   %initiate
      ?:  =('member' p.json)     %member
      ?:  =('admin' p.json)      %admin
      ?:  =('owner' p.json)      %owner
      !!
    --
  --
--