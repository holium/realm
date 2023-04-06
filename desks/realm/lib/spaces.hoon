/-  store=spaces-store, member-store=membership, visas, chat-db
/+  memb-lib=membership, rc-lib=realm-chat
=<  [store .]
=,  store
|%

++  pathify-space-path
  |=  =space-path:store
  ^-  path
  /(scot %p ship.space-path)/(wood space.space-path)

:: TODO make this smart enough to actually do different logic based on
:: the value of `chat-access`, instead of just always doing the logic
:: for [%role %member]
++  create-space-chat
  |=  [=space:store =chat-access:store =members:member-store t=@da]
  ^-  (quip card:agent:gall space:store)
  ::  spaces chats path format: /spaces/<space-path>/chats/<@uv>
  =/  chat-path  (weld /spaces (weld (pathify-space-path path.space) /chats/(scot %uv (sham path.space))))
  =/  metadata-settings
    :~  ['image' '']
        ['title' (crip "{(trip name.space)}: general chat")]
        ['description' '']
        ['creator' (scot %p ship.path.space)]
        ['reactions' 'true']
    ==
  =/  metadata=(map cord cord)   (~(gas by *(map cord cord)) metadata-settings)
  =/  pathrow=path-row:chat-db  [chat-path metadata %space-chat t t ~ %host %.n *@dr]
  =/  all-peers=ship-roles:chat-db
    ::?+  -.chat-access  !! :: default crash not-implemented an access type
    ::  %members
        %+  turn
          %+  skim
            ~(tap by members)
          |=  kv=[k=ship v=member:member-store]
          :: matching members are status %joined or %host AND have
          :: either %member or %owner roles
          ?&  |(=(status.v.kv %joined) =(status.v.kv %host))
              |((~(has in roles.v.kv) %member) (~(has in roles.v.kv) %owner))
          ==
        |=  kv=[k=ship v=member:member-store]
        [k.kv ?:(=(status.v.kv %host) %host %member)]
      :: TODO logic for peers lists for %admins %invited %whitelist and %blacklist
    ::==
  ~&  >>>  all-peers
  =/  cards
    %+  turn
      all-peers
    |=  [s=ship role=@tas]
    (create-path-db-poke:rc-lib s pathrow all-peers)

  =.  chats.space  (~(put by chats.space) chat-path [chat-path chat-access])

  [cards space]

::  creates the necessary cards for poking %chat-db to add the new ship
::  to all the relevant chats it should be added to
++  add-ship-to-matching-chats
  |=  [=ship =member:member-store =space:store =bowl:gall]
  ^-  (list card:agent:gall)
  %-  zing
  %+  turn
    ~(tap by chats.space)
  |=  kv=[k=path v=chat:store]
  ^-  (list card:agent:gall)
  ?+  -.access.v.kv  ~ :: TODO handle other modes of chat access
    %role
      ?.  &((~(has in roles.member) role.access.v.kv) |(=(%joined status.member) =(%host status.member)))  ~
      =/  pathpeers   (scry-peers:rc-lib k.kv bowl)
      =/  matches     (skim pathpeers |=(p=peer-row:chat-db =(patp.p ship)))
      ?:  (gth (lent matches) 0)  ~  :: this ship is already in this chat, so no need to add them
      [%pass /rcpoke %agent [our.bowl %realm-chat] %poke %chat-action !>([%add-ship-to-chat k.kv ship])]~
  ==

::  creates the necessary cards for poking %chat-db to remove the new ship
::  to all chats within the space
++  remove-ship-from-space-chats
  |=  [=ship =space:store =bowl:gall]
  ^-  (list card:agent:gall)
  %-  zing
  %+  turn
    ~(tap by chats.space)
  |=  kv=[k=path v=chat:store]
  ^-  (list card:agent:gall)
  [%pass /rcpoke %agent [our.bowl %realm-chat] %poke %chat-action !>([%remove-ship-from-chat k.kv ship])]~

++  create-space
  |=  [=ship slug=@t payload=add-payload:store updated-at=@da]
  ^-  space:store
  =/  default-theme
    [
      mode=%light
      background-color='#C4C3BF'
      accent-color='#4E9EFD'
      input-color='#FFFFFF'
      dock-color='#FFFFFF'
      icon-color='#CECECC'
      text-color='#333333'
      window-color='#FFFFFF'
      wallpaper='https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2832&q=100'
    ]
  =/  new-space
    [
      path=[ship slug]
      name=name:payload
      description=description:payload
      type=type:payload
      access=access:payload
      picture=picture:payload
      color=color:payload
      archetype=archetype:payload
      theme=default-theme
      updated-at=updated-at
      chats=*chats:store
    ]
  new-space
::
::  json
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
        %initial
      :-  %initial
      %-  pairs
      :~  [%spaces (spaces-map:encode spaces.rct)]
          [%membership (membership-map:encode membership.rct)]
          [%invitations (invitations:encode invitations.rct)]
          [%current (curr:encode current.rct)]
      ==
    ::
        %add
      :-  %add
      %-  pairs
      :~  [%space (spc:encode space.rct)]
          [%members (membs:encode members.rct)]
      ==
    ::
        %replace
      :-  %replace
      %-  pairs
      :~  [%space (spc:encode space.rct)]
      ==
    ::
        %remove
      :-  %remove
      %-  pairs
      :~  [%space-path s+(spat (pathify-space-path path.rct))]
      ==
    ::
        %remote-space
      :-  %remote-space
      %-  pairs
      :~  [%path s+(spat (pathify-space-path path.rct))]
          [%space (spc:encode space.rct)]
          :: [%members (passes:encode:membership membership.rct)]
          [%members (membs:encode members.rct)]
      ==
        %current
      :-  %current
      %-  pairs
      :~  [%path s+(spat (pathify-space-path path.rct))]
          [%space s+space.path.rct]
      ==
    
      ::   %members
      :: :-  %members
      :: %-  pairs
      :: :~  [%path s+(spat /(scot %p ship.path.rct)/(wood space.path.rct))]
      ::     [%members (membership-json:encode:memb-lib membership.rct)]
      :: ==
    ==
  ::
  ++  view :: encodes for on-peek
    |=  vi=^view
    ^-  json
    %-  pairs
    :_  ~
    ^-  [cord json]
    :-  -.vi
    ?-  -.vi
      ::
        %space
      (spc:encode space.vi)
      ::
        %spaces
      (spaces-map:encode spaces.vi)
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
      :~  [%add add-space]
          [%update update-space]
          [%remove path-key]
          [%join path-key]
          [%leave path-key]
          [%current path-key]
          :: [%kicked kicked]
      ==
    ::
    ++  de-space
      %-  ot
      :~  [%path pth]
          [%name so]
          [%type space-type]
          [%access access]
          [%picture so]
          [%color so]
          [%archetype archetype]
          [%theme thm]
          [%updated-at di]
      ==
    ::
    ++  add-space
      %-  ot
      :~  [%slug so]
          [%payload add-payload]
          [%members (op ;~(pfix sig fed:ag) memb)]
      ==
    ::
    ++  update-space
      %-  ot
      :~  [%path pth]
          [%payload edit-payload]
      ==
    ::
    ++  kicked
      %-  ot
      :~  [%path pth]
          [%ship (su ;~(pfix sig fed:ag))]
      ==
    ::
    ++  path-key
      %-  ot
      :~  [%path pth]
      ==
    ::
    ++  pth
      %-  ot
      :~  [%ship (su ;~(pfix sig fed:ag))]
          [%space so]
      ==
    ::
    ++  add-payload
      %-  ot
      :~  [%name so]
          [%description so]
          [%type space-type]
          [%access access]
          [%picture so]
          [%color so]
          [%archetype archetype]
      ==
    ::
    ++  edit-payload
      %-  ot
      :~  [%name so]
          [%description so]
          [%access (su (perk %public %private ~))]
          [%picture so]
          [%color so]
          [%theme thm]
      ==
    ::
    ++  thm
      %-  ot
      :~  [%mode theme-mode]
          [%background-color so]
          [%accent-color so]
          [%input-color so]
          [%dock-color so]
          [%icon-color so]
          [%text-color so]
          [%window-color so]
          [%wallpaper so]
      ==
    ::
    ++  memb
      %-  ot
      :~  [%roles (as rol)]
          [%alias so]
          [%status status]
          :: [%pinned bo]
      ==
    ::
    ++  theme-mode
      |=  =json
      ^-  theme-mode:store
      ?>  ?=(%s -.json)
      ?:  =('light' p.json)    %light
      ?:  =('dark' p.json)     %dark
      !!
    ::
    ++  space-type
      |=  =json
      ^-  space-type:store
      ?>  ?=(%s -.json)
      ?:  =('group' p.json)   %group
      ?:  =('our' p.json)     %our
      ?:  =('space' p.json)   %space
      !!
    ::
    ++  rol
      |=  =json
      ^-  role:member-store
      ?>  ?=(%s -.json)
      ?:  =('initiate' p.json)   %initiate
      ?:  =('member' p.json)     %member
      ?:  =('admin' p.json)      %admin
      ?:  =('owner' p.json)      %owner
      !!
    ::
    ++  archetype
      |=  =json
      ^-  archetype:store
      ?>  ?=(%s -.json)
      ?:  =('home' p.json)                %home
      ?:  =('community' p.json)           %community
      ?:  =('creator-dao' p.json)         %creator-dao
      ?:  =('service-dao' p.json)         %service-dao
      ?:  =('investment-dao' p.json)      %investment-dao
      !!
    ::
    ++  access
      |=  =json
      ^-  space-access:store
      ?>  ?=(%s -.json)
      ?:  =('public' p.json)              %public
      ?:  =('antechamber' p.json)         %antechamber
      ?:  =('private' p.json)             %private
      !!
    ::
    ++  status
      |=  =json
      ^-  status:member-store
      ?>  ?=(%s -.json)
      ?:  =('invited' p.json)     %invited
      ?:  =('joined' p.json)      %joined
      ?:  =('host' p.json)        %host
      !!
    --
  --
::
::
::
++  encode
  =,  enjs:format
  |%
  ++  spaces-map
    |=  =spaces:store
    ^-  json
    %-  pairs
    %+  turn  ~(tap by spaces)
    |=  [pth=space-path:store space=space:store]
    ^-  [cord json]
    [(spat (pathify-space-path pth)) (spc space)]
  ::
  ++  membership-map
    |=  =membership:member-store
    ^-  json
    %-  pairs
    %+  turn  ~(tap by membership)
    |=  [pth=space-path:store members=members:member-store]
    ^-  [cord json]
    [(spat (pathify-space-path pth)) (membs members)]
  ::
  ++  membs
    |=  =members:member-store
    ^-  json
    %-  pairs
    %+  turn  ~(tap by members)
    |=  [=^ship =member:member-store]
    ^-  [cord json]
    [(scot %p ship) (memb member)]
  ::
  ++  memb
    |=  =member:member-store
    ^-  json
    %-  pairs
    :~  ['roles' a+(turn ~(tap in roles.member) |=(rol=role:member-store s+(scot %tas rol)))]
        ['status' s+(scot %tas status.member)]
        :: ['pinned' b+pinned.member]
    ==
  ++  curr
    |=  current=space-path:store
    ^-  json
    %-  pairs
    :~  ['path' s+(spat (pathify-space-path current))]
        ['space' s+space.current]
    ==
  ::
  ++  spc
    |=  =space
    ^-  json
    %-  pairs
    :~  ['path' s+(spat (pathify-space-path path.space))]
        ['name' s+name.space]
        ['description' s+description.space]
        ['access' s+access.space]
        ['type' s+type.space]
        ['picture' s+picture.space]
        ['color' s+color.space]
        ['theme' (thm theme.space)]
        ['updatedAt' (time updated-at.space)]
    ==
  ::
  ++  thm
    |=  =theme
    ^-  json
    %-  pairs
    :~
      ['mode' s+(scot %tas mode.theme)]
      ['backgroundColor' s+background-color.theme]
      ['accentColor' s+accent-color.theme]
      ['inputColor' s+input-color.theme]
      ['dockColor' s+dock-color.theme]
      ['iconColor' s+icon-color.theme]
      ['textColor' s+text-color.theme]
      ['windowColor' s+window-color.theme]
      ['wallpaper' s+wallpaper.theme]
    ==
  ::
  ++  invitations
    |=  =invitations:visas
    ^-  json
    %-  pairs
    %+  turn  ~(tap by invitations)
    |=  [pth=space-path:store inv=invite:visas]
    ^-  [cord json]
    [(spat (pathify-space-path pth)) (invite inv)]
  ::
  ++  invite
    |=  =invite:visas
    ^-  json
    %-  pairs:enjs:format
    :~  ['inviter' s+(scot %p inviter.invite)]
        ['path' s+(spat (pathify-space-path path.invite))]
        ['role' s+(scot %tas role.invite)]
        ['message' s+message.invite]
        ['name' s+name.invite]
        ['type' s+type.invite]
        ['picture' s+picture.invite]
        ['color' s+color.invite]
        ['invitedAt' (time invited-at.invite)]
    ==
  ::
  --
--
