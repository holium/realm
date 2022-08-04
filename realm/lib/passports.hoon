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
/-  sur=passports
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
        %friends
      [%friends (frens:encode friends.rct)]
      ::
        %friend
      :-  %friend
      %-  pairs
      :~  [%ship s+(scot %p ship.rct)]
          [%friend (fren:encode friend.rct)]
      ==
      ::
        %new-friend
      :-  %new-friend
      %-  pairs
      :~  [%ship s+(scot %p ship.rct)]
          [%friend (fren:encode friend.rct)]
      ==
      ::
        %bye-friend
      :-  %bye-friend
      (pairs [%ship s+(scot %p ship.rct)]~)
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
    ::  Friends
    ::
        %add-friend
      :-  %add-friend
      %-  pairs
      :~  [%ship s+(scot %p ship.act)]
      ==
    ::
        %edit-friend
      :-  %edit-friend
      %-  pairs
      :~  [%ship s+(scot %p ship.act)]
          [%pinned [%b pinned.act]]
          [%tags [%a (turn ~(tap in tags.act) |=(tag=cord s+tag))]]
      ==
    ::
        %remove-friend
      :-  %remove-friend
      %-  pairs
      :~  [%ship s+(scot %p ship.act)]
      ==
    ::
    ::  Receiving
    ::
        %be-fren
      :-  %be-fren
      ~
    ::
        %yes-fren
      :-  %yes-fren
      ~
    ::
        %bye-fren
      :-  %bye-fren
      ~
    ::
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
        %passports
      [%passports (passes:encode passports.view)]
      ::
        %friends
      [%friends (frens:encode friends.view)]
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
          [%add-friend add-friend]
          [%edit-friend edit-friend]
          [%remove-friend remove-friend]
          [%be-fren ul]
          [%yes-fren ul]
          [%bye-fren ul]
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
    |=  =friends
    ^-  json
    %-  pairs
    %+  turn  ~(tap by friends)
    |=  [=^ship =friend]
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
    |=  =friend
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
    ==
  ::
  ++  rols
    |=  =roles:membership
    ^-  json
    [%a (turn ~(tap in roles) |=(rol=role:membership s+(scot %tas rol)))]
  --
--