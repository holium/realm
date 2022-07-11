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

++  to-js
  |=  spc=space:store
  |^  ^-  json
  %-  pairs:enjs:format
  :: =/  ship-name  (scot %p ship.path.spc)
  :~
    ['path' (path:enjs:format /(scot %p ship.path.spc))]
    ['name' s+name.spc]
    ['type' s+type.spc]
    ['picture' s+picture.spc]
    ['color' s+color.spc]
    ['theme' theme]
  ==
  ++  theme
    %-  pairs:enjs:format
    :~
      [%mode s+mode.theme.spc]
      [%background-color s+background-color.theme.spc]
      [%accent-color s+accent-color.theme.spc]
      [%input-color s+input-color.theme.spc]
      [%dock-color s+dock-color.theme.spc]
      [%icon-color s+icon-color.theme.spc]
      [%text-color s+text-color.theme.spc]
      [%window-color s+window-color.theme.spc]
      [%wallpaper s+wallpaper.theme.spc]
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
      %-  of
      :~  [%ship (su ;~(pfix sig fed:ag))]
          [%space-name so]
      ==
    ++  edit-payload
      %-  of
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