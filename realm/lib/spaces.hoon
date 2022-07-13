/-  store=spaces, member-store=membership
=<  [store .]
=,  store
|%

++  create-space
  |=  [=ship name=@t slug=@t type=space-type:store updated-at=@da]
  ^-  space:store
  =/  default-theme
    [
      mode=%light
      background-color='#C4C3BF'
      accent-color='#4E9EFD'
      input-color='#FFFFFF'
      dock-color='#F5F5F4'
      icon-color='#333333'
      text-color='#2A2927'
      window-color='#F5F5F4'
      wallpaper='https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2832&q=100'
    ]
  =/  new-space
    [
      path=[ship slug]
      name=name
      type=type
      picture=''
      color='#000000'
      theme=default-theme
      updated-at=updated-at
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
    %+  frond  %spaces-reaction
    %-  pairs
    :_  ~
    ^-  [cord json]
    ?-  -.rct
        %initial
      :-  %initial
      %-  pairs
      :~  [%spaces (spaces-map:encode spaces.rct)]
          [%membership (membership-map:encode membership.rct)]
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
      :~  [%space-path s+(spat /(scot %p ship.path.rct)/(scot %tas space.path.rct))]
      ==
    ==
  ::
  ++  view :: encodes for on-peek
    |=  view=^view
    ^-  json
    %-  pairs
    :_  ~
    ^-  [cord json]
    ?-  -.view
        %space
      [%space (spc:encode space.view)]
    ::
        %spaces
      [%spaces (spaces-map:encode spaces.view)]
    ==
  --
++  encode
  =,  enjs:format
  |%
  ++  spaces-map
    |=  =spaces:store
    ^-  json
    %-  pairs
    %+  turn  ~(tap by spaces)
    |=  [pth=space-path:store space=space:store]
    =/  spc-path  (spat /(scot %p ship.pth)/(scot %tas space.pth))
    ^-  [cord json]
    [spc-path (spc space)]
  ::
  ++  membership-map
    |=  =membership:member-store
    ^-  json
    %-  pairs
    %+  turn  ~(tap by membership)
    |=  [pth=space-path:store members=members:member-store]
    =/  spc-path  (spat /(scot %p ship.pth)/(scot %tas space.pth))
    ^-  [cord json]
    [spc-path (membs members)]
  ::
  ++  membs
    |=  =members:member-store
    ^-  json
    %-  pairs
    %+  turn  ~(tap by members)
    |=  [=^ship =roles:member-store]
    ^-  [cord json]
    [(scot %p ship) [%a (turn ~(tap in roles) |=(rol=role:member-store s+(scot %tas rol)))]] 
  ::
  ++  spc
    |=  =space
    ^-  json
    %-  pairs:enjs:format
    :~  ['path' s+(spat /(scot %p ship.path.space)/(scot %tas space.path.space))]
        ['name' s+name.space]
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
    %-  pairs:enjs:format
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
          [%remove remove-space]
      ==
    ::
    ++  add-space
      %-  ot
      :~  [%name so]
          [%slug so]
          [%type space-type]
          [%members (op ;~(pfix sig fed:ag) (as rol))]
      ==
    ::
    ++  update-space
      %-  ot
      :~  [%path pth]
          [%payload edit-payload]
      ==
    ::
    ++  remove-space
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
    ++  edit-payload
      %-  of
      :~  [%name so]
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
    --
  --
  ::
--