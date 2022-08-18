::
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