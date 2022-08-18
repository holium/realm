/-  store=bazaar, spaces-store=spaces
=<  [store .]
=,  store
|%
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
      :~  [%space-path s+(spat /(scot %p ship.space-path.rct)/(scot %tas space.space-path.rct))]
          [%app-index (apidx:encode app-index.rct)]
      ==
    ==
  ::
  ++  view :: encodes for on-peek
    |=  vi=view:store
    ^-  json
    %-  pairs
    :_  ~
    ^-  [cord json]
    :-  -.vi
    ?-  -.vi
      ::
        %apps
      (apidx:encode app-index.vi)
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
    |=  [pth=space-path:spaces-store =app-index:store]
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
    ^-  [cord json]
    [app-id (apntry app-entry)]
  ::
  ++  apntry
    |=  =app-entry:store
    ^-  json
    %-  pairs
    :~  ['ship' s+(scot %p ship.app-entry)]
        ['rank' n+rank.app-entry]
        ['tags' a+(turn ~(tap in tags.app-entry) |=(tg=tag:store s+(scot %tas tg)))]
    ==
  --
--