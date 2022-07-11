/-  store=spaces
=<  [store .]
=,  store
|%

++  create-space
  |=  [=ship name=@t slug=@t type=space-type:store]
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
      name=`@t`(scot %p ship)
      type=type
      picture=''
      color='#000000'
      theme=default-theme
    ]
  new-space
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
      :-  %all
      %-  pairs
      :~  [%spaces (spaces-map spaces.rct)]
      ==
    ==
    ::
    ++  spaces-map
      |=  =spaces:store
      ^-  json
      %-  pairs
      %+  turn  ~(tap by spaces)
      |=  [pth=space-path:store space=space:store]
      =/  spc-path  (spat /(scot %p ship.pth)/(scot %tas space-name.pth))
      ^-  [cord json]
      [spc-path (spc space)]
    ::
    ++  spc
      |=  [=space]
      ^-  json
      %-  pairs
      :~  [%path s+(spat /(scot %p ship.path.space)/(scot %tas space-name.path.space))]
          [%name s+name.space]
          [%type s+type.space]
          [%picture s+picture.space]
          [%color s+color.space]
          [%theme (thm theme.space)]
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
          :: [%edit edit-space]
      ==
    ++  create-space
      %-  ot
      :~  [%name so]
          [%slug so]
          [%type space-type]
      ==
    ++  edit-space
      %-  ot
      :~  [%path path]
          [%payload edit-payload]
      ==
    ::
    ++  path
      %-  ot
      :~  [%ship (su ;~(pfix sig fed:ag))]
          [%space-name so]
      ==
    ++  edit-payload
      %-  ot
      :~  [%name so]
          [%picture so]
          [%color so]
      ==
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