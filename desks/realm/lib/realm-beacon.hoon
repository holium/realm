/-  store=realm-beacon
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
      :~
          [%seen id=@ud]
      ==
    ::
    ++  seen
      %-  ot
      :~  [%id ni]
      ==
    --
  --
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
    :-  -.rct
    ?-  -.rct
        %seen
      %-  pairs
      :~  [%id s+id.rct]
      ==
    ==
  ::
  ++  view  :: encodes for on-peek
    |=  vi=view:store
    ^-  json
    %-  pairs
    :_  ~
    ^-  [cord json]
    :-  -.vi
    ?-  -.vi
      ::
        %latest
      (latest-js:encode latest.vi)
      ::
    ==
  --
::
++  encode
  =,  enjs:format
  |%
  ::
  ++  latest-js
    |=  =notifications:store
    ^-  json
    %-  pairs
    %+  turn  ~(tap by stalls)
      |=  [pth=space-path:spaces-store =stall:store]
      =/  spc-path      (spat /(scot %p ship.pth)/(scot %tas space.pth))
      ^-  [cord json]
      [spc-path (stall-js:encode stall)]
  ::
  ++  stall-js
    |=  =stall:store
    ^-  json
    %-  pairs
    :~  ['suite' (suite-js:encode suite.stall)]
        ['recommended' (recommended-js:encode recommended.stall)]
    ==
  ::
  ++  docks-js
    |=  =docks:store
    ^-  json
    %-  pairs
    %+  turn  ~(tap by docks)
      |=  [pth=space-path:spaces-store =dock:store]
      =/  spc-path      (spat /(scot %p ship.pth)/(scot %tas space.pth))
      ^-  [cord json]
      [spc-path a+(turn dock |=(=app-id:store s+app-id))]
  ::
  ++  suite-js
    |=  =suite:store
    ^-  json
    %-  pairs
    %+  turn  ~(tap by suite)
      |=  [index=@ud =app-id:store]
      ^-  [cord json]
      [(scot %ud index) s+(cord app-id)]
  ::
  ++  recommended-js
    |=  =recommended:store
    ^-  json
    %-  pairs
    ::  TODO sort and only return the last 4
    %+  turn  ~(tap by recommended)
      |=  [=app-id:store =member-set:store]
      ^-  [cord json]
      [app-id (numb ~(wyt in member-set))]
  ::
  ++  catalog-js
    |=  =catalog:store
    ^-  json
    %-  pairs
    %+  turn  ~(tap by catalog)
      |=  [=app-id:store app=app:store]
      ^-  [cord json]
      [app-id (app-detail:encode app-id app)]
  ::
  ++  app-detail
    |=  [=app-id:store =app:store]
    ?-  -.app
      ::
      %native
        ^-  json
        %-  pairs
        :~  ['id' s+app-id]
            ['type' s+%native]
            ['title' s+title.native-app.app]
            ['info' s+info.native-app.app]
            ['color' s+color.native-app.app]
            ['icon' s+icon.native-app.app]
            ['config' (config:enjs:realm config.native-app.app)]
        ==
      ::
      %web
        ^-  json
        %-  pairs
        :~  ['id' s+app-id]
            ['title' s+title.web-app.app]
            ['href' s+href.web-app.app]
            ['favicon' s+favicon.web-app.app]
            ['config' (config:enjs:realm config.web-app.app)]
        ==
      ::
      %urbit   (urbit-app:encode app-id +.app)
      ::
    ==
  ::
  ++  urbit-app
    |=  [=app-id app=urbit-app:store]
    %+  merge  (dkt docket.app)
    %-  pairs
    :~
      ['id' s+app-id]
      ['installStatus' [%s `@t`install-status.app]]
      ['config' (config:enjs:realm config.app)]
      ['host' ?~(host.app ~ s+(scot %p u.host.app))]
    ==
  ::
  ++  dkt
    |=  [=docket:docket]
    ^-  json
    %-  pairs
    :~  type+s+%urbit
        title+s+title.docket
        info+s+info.docket
        color+s+(scot %ux color.docket)
        href+(href href.docket)
        image+?~(image.docket ~ s+u.image.docket)
        version+(version version.docket)
        license+s+license.docket
        website+s+website.docket
    ==
  ::
  ++  href
    |=  h=href:docket
    %+  frond  -.h
    ?-    -.h
        %site  s+(spat path.h)
        %glob
      %-  pairs
      :~  base+s+base.h
          glob-reference+(glob-reference glob-reference.h)
      ==
    ==
  ::
  ++  glob-reference
    |=  ref=glob-reference:docket
    %-  pairs
    :~  hash+s+(scot %uv hash.ref)
        location+(glob-location location.ref)
    ==
  ::
  ++  glob-location
    |=  loc=glob-location:docket
    ^-  json
    %+  frond  -.loc
    ?-  -.loc
      %http  s+url.loc
      %ames  s+(scot %p ship.loc)
    ==
  ::
  ++  version
    |=  v=version:docket
    ^-  json
    :-  %s
    %-  crip
    "{(num major.v)}.{(num minor.v)}.{(num patch.v)}"
  ::
  ++  num
    |=  a=@u
    ^-  ^tape
    =/  p=json  (numb a)
    ?>  ?=(%n -.p)
    (trip p.p)
  ::
  ++  allies-js
    |=  =allies:ally:treaty
    ^-  json
    %-  pairs
      %+  turn  ~(tap by allies)
      |=  [s=^ship a=alliance:treaty]
      [(scot %p s) (alliance a)]
  ::
  ++  treaty-map
    |=  t-map=(map [=^ship =desk] =treaty:treaty)
    ^-  json
    %-  pairs
    %+  turn  ~(tap by t-map)
      |=  [[s=^ship =desk] t=treaty:treaty]
      [(foreign-desk s desk) (treaty-js t)]
  ::
  ++  treaty-js
    |=  t=treaty:treaty
    ^-  json
    %+  merge  (dkt docket.t)
    %-  pairs
    :~  ['ship' s+(scot %p ship.t)]
        ['desk' s+desk.t]
        ['cass' (case case.t)]
        ['hash' s+(scot %uv hash.t)]
    ==
  ::
  ++  foreign-desk
    |=  [s=^ship =desk]
    ^-  cord
    (crip "{(scow %p s)}/{(trip desk)}")
  ::
  ++  case
    |=  c=^case
    %+  frond  -.c
    ?-  -.c
      %da   s+(scot %da p.c)
      %tas  s+(scot %tas p.c)
      %ud   (numb p.c)
    ==
  ::
  ++  alliance
    |=  a=alliance:treaty
    ^-  json
    :-  %a
    %+  turn  ~(tap in a)
      |=  [=^ship =desk]
      ^-  json
      s+(foreign-desk ship desk)
  ::
  --
--
