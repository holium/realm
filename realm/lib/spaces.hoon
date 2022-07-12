/-  store=spaces
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
::  JSON 
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
        %all
      [%spaces (spaces-map spaces.rct)]
    ::
        %space
      [%space (spc space.rct)]
    ::
        %edit
      [%space (spc space.rct)]
    ::
        %archive
      [%archive s+(spat /(scot %p ship.path.rct)/(scot %tas space.path.rct))]
    ::
      :: %paired
      :: :-  %all
      :: %-  pairs
      :: :~  [%spaces (spaces-map spaces.rct)]
      :: ==
    ==
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
    ++  spc
      |=  =space
      ^-  json
      %-  pairs
      :~  [%path s+(spat /(scot %p ship.path.space)/(scot %tas space.path.space))]
          [%name s+name.space]
          [%type s+type.space]
          [%picture s+picture.space]
          [%color s+color.space]
          [%theme (thm theme.space)]
          [%updated-at (time updated-at.space)]
      ==
    ++  thm
      |=  =theme
      ^-  json
      %-  pairs
      :~
        [%mode s+(scot %tas mode.theme)]
        [%background-color s+background-color.theme]
        [%accent-color s+accent-color.theme]
        [%input-color s+input-color.theme]
        [%dock-color s+dock-color.theme]
        [%icon-color s+icon-color.theme]
        [%text-color s+text-color.theme]
        [%window-color s+window-color.theme]
        [%wallpaper s+wallpaper.theme]
      ==
    --
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
      :~  [%create create-space]
          [%edit edit-space]
          [%archive archive-space]
      ==
    ++  create-space
      %-  ot
      :~  [%name so]
          [%slug so]
          [%type space-type]
      ==
    ++  edit-space
      %-  ot
      :~  [%path pth]
          [%payload edit-payload]
      ==
    ::
    ++  archive-space
      %-  ot
      :~  [%path pth]
      ==
    ::
    ++  pth
      %-  ot
      :~  [%ship (su ;~(pfix sig fed:ag))]
          [%space so]
      ==
    ++  edit-payload
      %-  of
      :~  [%name so]
          [%picture so]
          [%color so]
          [%theme thm]
      ==
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
    ++  theme-mode
      |=  =json
      ^-  theme-mode:store
      ?>  ?=(%s -.json)
      ?:  =('light' p.json)    %light
      ?:  =('dark' p.json)     %dark
      !!

    ++  space-type
      |=  =json
      ^-  space-type:store
      ?>  ?=(%s -.json)
      ?:  =('group' p.json)   %group
      ?:  =('our' p.json)     %our
      !!
    --
  --
  ::
--