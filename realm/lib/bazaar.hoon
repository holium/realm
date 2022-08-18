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
      :~  [%pin dat]
          [%unpin dat]
          [%like dat]
          [%dislike dat]
          [%suite-add dat]
          [%suite-remove dat]
      ==
    ::
    ++  dat
      %-  ot
      :~  [%path pth]
          [%app-id so]
      ==
    ::
    ++  pth
      %-  ot
      :~  [%ship (su ;~(pfix sig fed:ag))]
          [%space so]
      ==
    --
  --
::
::
::  json
::
++  enjs
  =,  enjs:format
  |%
  ++  reaction
    |=  rct=^reaction
    ^-  json
    %+  frond  %bazaar-reaction
    %-  pairs
    :_  ~
    ^-  [cord json]
    ?-  -.rct
        %initial
      :-  %initial
      %-  pairs
      :~  [%space-apps (space-apps:encode space-apps.rct)]
      ==
    ::
        %space-apps
      :-  %space-apps
      %-  pairs
      :~  [%space-path s+(spat /(scot %p ship.path.rct)/(scot %tas space.path.rct))]
          [%app-index (apidx app-index.rct)]
      ==
    ==
  --
::  json
::
++  enjs
  =,  enjs:format
  |%
  ::
  ++  view :: encodes for on-peek
    |=  vw=^view
    ^-  json
    %-  pairs
    :_  ~
    ^-  [cord json]
    :-  -.vw
    ?-  -.vw
      ::
        %apps
      (apidx:encode apps.vw)
    ==
  --
::
++  encode
  =,  enjs:format
  |%
  ++  space-apps
    |=  =space-apps:store
    ^-  json
    %-  pairs
    %+  turn  ~(tap by space-apps)
    |=  [pth=space-path:store =app-index:store]
    =/  spc-path  (spat /(scot %p ship.pth)/(scot %tas space.pth))
    ^-  [cord json]
    [spc-path (apidx app-index)]
  ::
  ++  apidx
    |=  =app-index:store
    ^-  json
    %-  pairs
    %+  turn  ~(tap by app-index)
    |=  [=app-id:store =app-entry:store]
    =/  spc-path  (spat /(scot %p ship.pth)/(scot %tas space.pth))
    ^-  [cord json]
    [app-id (apntry app-entry)]
  ::
  ++  apntry
    |=  =app-entry:store
    ^-  json
    %-  pairs
    :~  ['ship' s+(cord "{<ship.app-entry>}")]
        ['rank' ni+rank.app-entry]
        ['tags' a+(turn ~(tap in tags.app-entry) |=(tg=tag:store s+(scot %tas tg)))]
    ==
  --