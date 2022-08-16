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
/-  sur=passports, spcs=spaces, frens-sur=friends
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
  ++  reaction
    |=  rct=^reaction
    ^-  json
    %-  pairs
    :_  ~
    ^-  [cord json]
    ?-  -.rct
        %members
      :-  %members
      %-  pairs
      :~  [%path s+(spat /(scot %p ship.path.rct)/(scot %tas space.path.rct))]
          [%members (passes:encode passports.rct)]
      ==
        %all
      [%members (dists:encode districts.rct)]
    ==
  ::
  ++  action
    |=  act=^action
    ^-  json
    %+  frond  %passports-action
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
          [%payload (payl payload.act)]
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
          [%payload (payl payload.act)]
      ==
    ::
        %ping
      :-  %ping
      (pairs [%msg ?~(msg.act ~ s+(need msg.act))]~)
    ::
    ==
  ::
  ++  pth
    |=  path=space-path:spaces
    ^-  json
    [%s (spat /(scot %p ship.path)/(scot %tas space.path))]
  ::
  ++  mo
    |=  edit=mod
    ^-  json
    %+  frond  -.edit
    ?-  -.edit
      %alias         [%s alias.edit]
      %add-roles     (rols roles.edit)
      %remove-roles  (rols roles.edit)
    ==
  ::
  ++  payl
    |=  =payload
    ^-  json
    =/  obj=(map @t json)
    %-  ~(rep in payload)
    |=  [edit=mod obj=(map @t json)]
    (~(put by obj) -.edit (mo edit))
    [%o obj]
  ::
  ++  rols
    |=  =roles:membership
    ^-  json
    [%a (turn ~(tap in roles) |=(rol=role:membership s+(scot %tas rol)))]
  ::
  ++  view :: encodes for on-peek
    |=  view=^view
    ^-  json
    %-  pairs
    :_  ~
    ^-  [cord json]
    ?-  -.view
        %people
      [%people (peeps:encode people.view)]
      ::
        %members
      [%members (passes:encode passports.view)]
      ::
        %member
      [%member (pass:encode passport.view)]
      ::
        %is-member
      [%is-member b+is-member.view]
      ::
        %districts
      [%districts (dists:encode districts.view)]
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
      :~  [%add add-passport]
          [%remove remove-passport]
          [%edit edit-passport]
      ==
    ::
    ++  add-friend
      %-  ot
      :~  [%ship (su ;~(pfix sig fed:ag))]
      ==
    ::
    ++  edit-friend
      %-  ot
      :~  [%ship (su ;~(pfix sig fed:ag))]
          [%pinned bo]
          [%tags (as cord)]
      ==
    ::
    ++  remove-friend
      %-  ot
      :~  [%ship (su ;~(pfix sig fed:ag))]
      ==
    ::
    ++  add-passport
      %-  ot
      :~  [%path pth]
          [%ship (su ;~(pfix sig fed:ag))]
          [%payload payl]
      ==
    ::
    ++  remove-passport
      %-  ot
      :~  [%path pth]
          [%ship (su ;~(pfix sig fed:ag))]
      ==
    ::
    ++  edit-passport
      %-  ot
      :~  [%path pth]
          [%ship (su ;~(pfix sig fed:ag))]
          [%payload payl]
      ==
    ::
    ++  payl
      |=  jon=json
      ^-  payload
      =/  data  ?:(?=([%o *] jon) p.jon ~)
      =/  result=payload
      %-  ~(rep by data)
      |=  [[key=@tas jon=json] obj=payload]
      ?+  key  obj
         %alias         (~(put in obj) [%alias (so jon)])
         %add-roles     (~(put in obj) [%add-roles ((as rol) jon)])
         %remove-roles  (~(put in obj) [%remove-roles ((as rol) jon)])
      ==
      result
    ::
    ++  pth
      %-  ot
      :~  [%ship (su ;~(pfix sig fed:ag))]
          [%space so]
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
::
::
::
++  encode
  =,  enjs:format
  |%
  ++  dists
    |=  =districts
    ^-  json
    %-  pairs
    %+  turn  ~(tap by districts)
    |=  [pth=space-path:spcs =passports]
    =/  spc-path  (spat /(scot %p ship.pth)/(scot %tas space.pth))  
    ^-  [cord json]
    [spc-path (passes passports)]
  ::
  ++  peeps
    |=  =people
    ^-  json
    %-  pairs
    %+  turn  ~(tap by people)
    |=  [=^ship =person]
    ^-  [cord json]
    [(scot %p ship) (pers person)]
  ::
  ++  frens
    |=  =friends:frens-sur
    ^-  json
    %-  pairs
    %+  turn  ~(tap by friends)
    |=  [=^ship =friend:frens-sur]
    ^-  [cord json]
    [(scot %p ship) (fren friend)]
  ::
  ++  passes
    |=  =passports
    ^-  json
    %-  pairs
    %+  turn  ~(tap by passports)
    |=  [=^ship =passport]
    ^-  [cord json]
    [(scot %p ship) (pass passport)]
  ::
  ++  pers
    |=  =person
    ^-  json
    %-  pairs
    :~
      ['last-known-active' ?~(last-known-active.person ~ (time u.last-known-active.person))]
    ==
  ::
  ++  fren
    |=  =friend:frens-sur
    ^-  json
    %-  pairs:enjs:format
    :~  ['pinned' b+pinned.friend]
        ['tags' [%a (turn ~(tap in tags.friend) |=(tag=cord s+tag))]]
        ['mutual' b+mutual.friend]
    ==
  ::
  ++  pass
    |=  =passport
    ^-  json
    %-  pairs
    :~
      ['alias' s+alias.passport]
      ['roles' (rols roles.passport)]
      ['status' s+(scot %tas status.passport)]
    ==
  ::
  ++  rols
    |=  =roles:membership
    ^-  json
    [%a (turn ~(tap in roles) |=(rol=role:membership s+(scot %tas rol)))]
  ::
  ++  is-mem
    |=  is=?
    ^-  json
    %-  pairs
    :~
      ['is-member' b+is]
    ==
  ::
  --
--