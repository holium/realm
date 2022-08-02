/-  store=spaces, member-store=membership
/+  spaces-lib=spaces
=<  [store .]
=,  store
|%
++  new-invite
  |=  [path=space-path:store inviter=ship =ship =role:membership =space:store invited-at=@da]
  ^-  invite:store
  =/  new-invite
    [
      inviter=inviter
      path=path
      role=role
      message=''
      name=name:space
      type=type:space
      invited-at=invited-at
    ]
  new-invite
::
::  json 
::
++  enjs
  =,  enjs:format
  |%
  ++  invite-action
    |=  act=^invite-action
    ^-  json
    %+  frond  %invite-action
    %-  pairs
    :_  ~
    ^-  [cord json]
    ?-  -.act
        %send-invite
      :-  %send-invite
      %-  pairs
      :~  [%path s+(spat /(scot %p ship.path.act)/(scot %tas space.path.act))]
          [%ship s+(scot %p ship.act)]
          [%role s+(scot %tas role.act)]
      ==
        %invited
      :-  %invited
      %-  pairs
      :~  [%path s+(spat /(scot %p ship.path.act)/(scot %tas space.path.act))]
          [%invite (invite:encode invite.act)]
      ==
        %accept-invite
      :-  %accept-invite
      %-  pairs
      :~  [%path s+(spat /(scot %p ship.path.act)/(scot %tas space.path.act))]
      ==
      ::   %accepted
      :: :-  %accepted
      :: %-  pairs
      :: :~  [%path s+(spat /(scot %p ship.path.act)/(scot %tas space.path.act))]
      :: ==
    ==
  ::
  ++  invite-reaction
    |=  rct=^invite-reaction
    ^-  json
    %+  frond  %invite-reaction
    %-  pairs
    :_  ~
    ^-  [cord json]
    ?-  -.rct
        %invite-sent
      :-  %invite-sent
      %-  pairs
      :~  [%path s+(spat /(scot %p ship.path.rct)/(scot %tas space.path.rct))]
          [%invite (invite:encode invite.rct)]
      ==
        %invite-accepted
      :-  %invite-accepted
      %-  pairs
      :~  [%path s+(spat /(scot %p ship.path.rct)/(scot %tas space.path.rct))]
          [%ship s+(scot %p ship.path.rct)]
          [%roles [%a (turn ~(tap in roles.rct) |=(rol=role:member-store s+(scot %tas rol)))]]
      ==
    ==
  ::
  ::
  ++  invite-view
    |=  view=^invite-view
    ^-  json
    %-  pairs
    :_  ~
    ^-  [cord json]
    ?-  -.view
        %invitations
      :-  %invitations
      %-  pairs
      :~  [%invites (our-invites:encode invites.view)]
      ==
    ==
  --
::
++  encode
  =,  enjs:format
  |%
  ++  our-invites
    |=  =our-invites:store
    ^-  json
    %-  pairs
    %+  turn  ~(tap by our-invites)
    |=  [pth=space-path:store inv=invite:store]
    =/  spc-path  (spat /(scot %p ship.pth)/(scot %tas space.pth))
    ^-  [cord json]
    [spc-path (invite inv)]
  ::
  ++  invite
    |=  =invite:store
    ^-  json
    %-  pairs:enjs:format
    :~  ['inviter' s+(scot %p inviter.invite)]
        ['path' s+(spat /(scot %p ship.path.invite)/(scot %tas space.path.invite))]
        ['role' s+(scot %tas role.invite)]
        ['message' s+message.invite]
        ['name' s+name.invite]
        ['type' s+type.invite]
        ['invitedAt' (time invited-at.invite)]
    ==
  --

::
++  dejs
  =,  dejs:format
  |%
  ++  invite-action
    |=  jon=json
    ^-  invite-action:store
    =<  (decode jon)
    |%
    ++  decode
      %-  of
      :~  [%send-invite send-invite-payload]
          [%accept-invite accept-invite-payload]
          [%invited invited-payload]
          :: [%accepted accepted-payload]
      ==
    ::
    :: ++  accepted-payload
    ::   %-  ot
    ::   :~  [%path pth]
    ::   ==
    :: ::
    ++  accept-invite-payload
      %-  ot
      :~  [%path pth]
          :: [%space space:action:dejs:spaces-lib]
      ==
    ::
    ++  invited-payload
      %-  ot
      :~  [%path pth]
          [%invite invite]
      ==
    ::
    ++  invite
      %-  ot
      :~  [%inviter (su ;~(pfix sig fed:ag))]
          [%path pth]
          [%role rol]
          [%message so]
          [%name so]
          [%type space-type:action:dejs:spaces-lib]
          [%invited-at di]
      ==
    ::
    ++  send-invite-payload
      %-  ot
      :~  [%path pth]
          [%ship (su ;~(pfix sig fed:ag))]
          [%role rol]
      ==
    ::
    ++  pth
      %-  ot
      :~  [%ship (su ;~(pfix sig fed:ag))]
          [%space so]
      ==
    ::
    ++  rol
      |=  =json
      ^-  role:member-store
      ?>  ?=(%s -.json)
      ?:  =('invited' p.json)    %invited
      ?:  =('initiate' p.json)   %initiate
      ?:  =('member' p.json)     %member
      ?:  =('admin' p.json)      %admin
      ?:  =('owner' p.json)      %owner
      !!
    --
  --
  ::
--