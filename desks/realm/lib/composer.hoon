/-  sur=composer
|%
++  dejs
  =,  dejs:format
  |%
  ++  action
    |=  jon=json
    ^-  action:sur
    =<  (decode jon)
    |%
    ++  decode
      %-  of
      :~  [%add-space space-path]
          [%remove-space space-path]
          [%add-stack (ot ~[space-path+space-path stack+stack])]
          [%remove-stack (ot ~[space-path+space-path stack-id+so])]
          [%set-current-stack (ot ~[space-path+space-path stack-id+so])]
          [%add-window (ot ~[space-path+space-path stack-id+so window+window])]
          [%remove-window (ot ~[space-path+space-path stack-id+so window-id+so])]
          [%set-window-bounds (ot ~[space-path+space-path stack-id+so window-id+so bounds+bounds])]
          [%set-window-layer (ot ~[space-path+space-path stack-id+so window-id+so z-index+ni])]
      ==
    ++  space-path
      %-  ot
      :~  [%ship (su ;~(pfix sig fed:ag))]
          [%space so]
      ==
    ++  stack
      %-  ot
      :~  [%id so]
          [%host (se %p)]
          [%type (su (perk %singleplayer %multiplayer ~))]
          [%windows (om window)]
          [%metadata (om so)]
      ==
    ++  window
      %-  ot
      :~  [%id so]
          [%owner (se %p)]
          [%app so]
          [%path so]
          [%access (su (perk %write %read ~))]
          [%type (su (perk %urbit %web %native ~))]
          [%metadata (om so)]
          [%z-index so]
          [%bounds (ot ~[x+nu y+nu height+nu width+nu])]
      ==
    ++  bounds
      %-  ot
      :~  [%x ni]
          [%y ni]
          [%height ni]
          [%width ni]
      ==
    --
  --
::
++  enjs
  =,  enjs:format
  |%
  ++  view
    |=  =view:sur
    ^-  json
    ?-  -.view
        %compositions
      %-  pairs
      :_  ~
      ^-  [cord json]
      [%compositions (compositions:encode compositions.view)]
    ==
  --
::
++  encode
  =,  enjs:format
  |%
  ++  compositions
    |=  =compositions:sur
    ^-  json
    %-  pairs
    %+  turn  ~(tap by compositions)
    |=  [=space-path:sur =composer:sur]
    ^-  [cord json]
    :-  (spat /(scot %p ship.space-path)/(scot %tas space.space-path))
    %-  pairs
    :~  ['space' s+(spat /(scot %p ship.space.composer)/(scot %tas space.space.composer))]
        ['current' s+current.composer]
        ['our' (stack:encode our.composer)]
        :-  'stacks'
        %-  pairs
        %+  turn  ~(tap by stacks.composer)
        |=  [=stack-id:sur =stack:sur]
        ^-  [cord json]
        :-  stack-id
        (stack:encode stack)
    ==
  ++  stack
    |=  =stack:sur
    ^-  json
    %-  pairs
    :~  ['id' s+id.stack]
        ['host' s+(scot %p host.stack)]
        ['type' s+type.stack]
        :-  'windows'
        %-  pairs
        ^-  (list [cord json])
        %+  turn  ~(tap by windows.stack)
        |=  [=window-id:sur =window:sur]
        [window-id (window:encode window)]
    ==
  ++  window
    |=  =window:sur
    ^-  json
    %-  pairs
    :~  ['id' s+id.window]
        ['owner' s+(scot %p owner.window)]
        ['app' s+app.window]
        ['path' s+path.window]
        ['access' s+access.window]
        ['type' s+type.window]
        :-  'metadata'
        %-  pairs
        %+  turn  ~(tap by metadata.window)
        |=  [p=cord q=cord]
        [p s+q]
        ['z-index' s+z-index.window]
        :-  'bounds'
          %-  pairs
          :~  ['x' (numb x.bounds.window)]
              ['y' (numb y.bounds.window)]
              ['height' (numb height.bounds.window)]
              ['width' (numb width.bounds.window)]
          ==
    ==
  --
--
