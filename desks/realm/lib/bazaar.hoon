/-  store=bazaar, spaces-store=spaces, docket
/+  docket-lib=docket
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
      :~  [%pin add-pin]
          [%unpin rem-pin]
          [%set-pin-order set-pin-order]
          [%recommend add-rec]
          [%unrecommend rem-rec]
          [%suite-add suite-add]
          [%suite-remove suite-remove]
          [%install-app install-app]
      ==
    ::
    ++  install-app
      %-  ot
      :~  [%ship (su ;~(pfix sig fed:ag))]
          [%desk so]
      ==
    ::
    ++  add-pin
      %-  ot
      :~  [%path pth]
          [%app-id so]
          [%rank (mu ni)]
      ==
    ::
    ++  rem-pin
      %-  ot
      :~  [%path pth]
          [%app-id so]
      ==
    ::
    ++  set-pin-order
      %-  ot
      :~  [%path pth]
          [%order (ar so)]
      ==
    ::
    ++  add-rec
      %-  ot
      :~  [%path pth]
          [%app-id so]
      ==
    ::
    ++  rem-rec
      %-  ot
      :~  [%path pth]
          [%app-id so]
      ==
    ::
    ++  suite-add
      %-  ot
      :~  [%path pth]
          [%app-id so]
          [%rank ni]
      ==
    ::
    ++  suite-remove
      %-  ot
      :~  [%path pth]
          [%app-id so]
      ==
    ::
    ++  tg
      |=  =json
      ^-  tag:store
      ?>  ?=(%s -.json)
      ?:  =('pinned' p.json)              %pinned
      ?:  =('recommended' p.json)         %recommended
      ?:  =('suite' p.json)               %suite
      ?:  =('installed' p.json)           %installed
      !!
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
    :: %+  frond  %bazaar-reaction
    %-  pairs
    :_  ~
    ^-  [cord json]
    ?-  -.rct
        %initial
      :-  %initial
      %-  pairs
      :~  [%space-apps (space-apps-full:encode space-apps-full.rct)]
      ==
    ::
        %space-apps
      :-  %space-apps
      %-  pairs
      :~  [%space-path s+(spat /(scot %p ship.space-path.rct)/(scot %tas space.space-path.rct))]
          [%app-index-full (pairs (full-app-index:encode app-index-full.rct))]
          :: [%vips [%a (vips:encode vips.rct)]]
      ==
    ::
        %pin
      :-  %pin
      %-  pairs
      :~  [(spat /(scot %p ship.path.rct)/(scot %tas space.path.rct)) (pairs (weld (app-full:encode app-full.rct) (srt:encode ord.rct)))]
      ==
    ::
        %unpin
      :-  %unpin
      %-  pairs
      :~  [(spat /(scot %p ship.path.rct)/(scot %tas space.path.rct)) (pairs (weld (app-full:encode app-full.rct) (srt:encode ord.rct)))]
      ==
    ::
        %set-pin-order
      :-  %set-pin-order
      %-  pairs
      :~  [(spat /(scot %p ship.path.rct)/(scot %tas space.path.rct)) (pairs (srt:encode ord.rct))]
      ==
    ::
        %recommend
      :-  %recommend
      %-  pairs
      :~  [(spat /(scot %p ship.path.rct)/(scot %tas space.path.rct)) (pairs (weld (app-full:encode app-full.rct) (srt:encode ord.rct)))]
      ==
    ::
        %unrecommend
      :-  %unrecommend
      %-  pairs
      :~  [(spat /(scot %p ship.path.rct)/(scot %tas space.path.rct)) (pairs (weld (app-full:encode app-full.rct) (srt:encode ord.rct)))]
      ==
    ::
        %suite-add
      :-  %suite-add
      %-  pairs
      :~  [(spat /(scot %p ship.path.rct)/(scot %tas space.path.rct)) (pairs (weld (app-full:encode app-full.rct) (srt:encode ord.rct)))]
      ==
    ::
        %suite-remove
      :-  %suite-remove
      %-  pairs
      :~  [(spat /(scot %p ship.path.rct)/(scot %tas space.path.rct)) (pairs (weld (app-full:encode app-full.rct) (srt:encode ord.rct)))]
      ==
    ::
        %set-suite-order
      :-  %set-suite-order
      %-  pairs
      :~  [(spat /(scot %p ship.path.rct)/(scot %tas space.path.rct)) (pairs (srt:encode ord.rct))]
      ==
    ::
        %app-installed
      :-  %app-installed
      %-  pairs
      :~  [%app-id s+app-id.rct]
          [%app (pairs (app-detail:encode app.rct))]
      ==
    ::
        %app-uninstalled
      :-  %app-uninstalled
      %-  pairs
      :~  [%app-id s+app-id.rct]
      ==
    ::
        %treaty-added
      :-  %treaty-added
      %-  pairs
      :~  [%ship s+(crip "{<ship.rct>}")]
          [%desk s+desk.rct]
          [%docket (pairs (dkt:encode docket.rct))]
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
      (pairs (full-app-index:encode app-index-full.vi))
      ::
        %sites
      [%a (sites:encode sites.vi)]
    ==
  --
::
++  encode
  =,  enjs:format
  |%
  ++  sites
    |=  [stes=(set [ship=@p desk=@tas])]
    ^-  (list json)
    %+  turn  ~(tap in stes)
    |=  [ship=@p desk=@tas]
    ^-  json
    %-  pairs
    :~  [%ship s+(crip "{<ship>}")]
        [%desk s+desk]
    ==
  ::
  ++  space-apps-full
    |=  =space-apps-full:store
    ^-  json
    %-  pairs
    %+  turn  ~(tap by space-apps-full)
    |=  [pth=space-path:spaces-store catalog=[=app-index-full:store =sorts:store]]
    =/  spc-path  (spat /(scot %p ship.pth)/(scot %tas space.pth))
    ^-  [cord json]
    [spc-path (apps-full catalog)]
  ::
  ++  apps-full
    |=  [index=app-index-full:store =sorts:store]
    ^-  json
    %-  pairs
    :~  [%apps (pairs (full-app-index index))]
        [%sorts (pairs (app-sorts sorts))]
    ==
  ::
  ++  app-sorts
    |=  =sorts:store
    ^-  (list [cord json])
    :~  [pinned+a+(turn pinned.sorts |=(=app-id:store s+app-id))]
        [recommended+a+(turn recommended.sorts |=(=app-id:store s+app-id))]
        [suite+a+(turn suite.sorts |=(=app-id:store s+app-id))]
    ==
  ::
  ++  space-apps-lite
    |=  =space-apps-lite:store
    ^-  json
    %-  pairs
    %+  turn  ~(tap by space-apps-lite)
    |=  [pth=space-path:spaces-store catalog=[=app-index-lite:store =sorts:store]]
    =/  spc-path  (spat /(scot %p ship.pth)/(scot %tas space.pth))
    ^-  [cord json]
    [spc-path (apps-lite catalog)]
  ::
  ++  apps-lite
    |=  [index=app-index-lite:store =sorts:store]
    (pairs (weld (lite-app-index index) (app-sorts sorts)))
  ::
  ++  app-detail
    |=  =app:store
    ^-  (list [cord json])
    ?-  -.app
      ::
      %native
        :: :~  desk+s+desk.native-app.app
        :~  type+s+%native
            title+s+title.native-app.app
            info+s+info.native-app.app
            :: color+s+(scot %ux color.native-app.app)
            color+s+color.native-app.app
            icon+s+icon.native-app.app
            :: href+(href href.native-app.app)
        ==
      ::
      %web
        :~  title+s+title.web-app.app
            href+s+href.web-app.app
        ==
      ::
      %urbit  (dkt docket.app)
      ::
      %missing  ~
    ==
  ::
  ++  srt
    |=  ord=(list app-id)
    ^-  (list [cord json])
    :~  [%sort a+(turn ord |=(=app-id:store s+app-id))]
    ==
  ::
  ++  app-full
    |=  app=app-full:store
    ^-  (list [cord json])
    =/  head=(list [cord json])
    :~  [id+s+id.app]
        ['ranks' (rnks ranks.sieve.app)]
        ['tags' a+(turn ~(tap in tags.sieve.app) |=(tg=tag:store s+(scot %tas tg)))]
    ==
    =/  detail=(list [cord json])  (app-detail:encode pkg.app)
    ?~  detail  ~  (weld head detail)
  ::
  ++  full-app-index
    |=  =app-index-full:store
    ^-  (list [cord json])
    %+  turn  ~(tap by app-index-full)
    |=  [=app-id:store app=app-full:store]
    ^-  [cord json]
    [app-id (pairs (app-full:encode app))]
  ::
  ++  lite-app-index
    |=  =app-index-lite:store
    ^-  (list [cord json])
    %+  turn  ~(tap by app-index-lite)
    |=  [=app-id:store app=app-lite:store]
    ^-  [cord json]
    [app-id (app-lite app)]
  ::
  ++  app-lite
    |=  app=app-lite:store
    ^-  json
    %-  pairs
    :~  [%id s+id.app]
        :: ['ship' s+(scot %p ship.app-entry)]
        ['ranks' (rnks ranks.sieve.app)]
        ['tags' a+(turn ~(tap in tags.sieve.app) |=(tg=tag:store s+(scot %tas tg)))]
    ==
  ::
  ++  dkt
    |=  =docket:docket
    ^-  (list [cord json])
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
  ++  rnks
    |=  =ranks:store
    ^-  json
    %-  pairs
    :~  [%pinned n+(crip "{<pinned.ranks>}")]
        [%recommended n+(crip "{<recommended.ranks>}")]
        [%suite n+(crip "{<suite.ranks>}")]
    ==
    :: %+  turn  ~(tap by ranks)
    :: |=  [=tag:store rank=@ud]
    :: ^-  [cord json]
    :: ?-  tag
    ::   %pinned       ['pinned' n+(cord "{<rank>}")]
    ::   %recommended  ['recommended' n+(cord "{<rank>}")]
    ::   %suite        ['suite' n+(cord "{<rank>}")]
    ::   %installed    ['installed' n+(cord "{<rank>}")]
    :: ==
  ::
  :: ++  dkt
  ::   |=  [d=(unit [=app-id:store =docket:docket])]
  ::   ^-  json
  ::   ?~  d  ~
  ::   =/  dk  (docket:enjs:docket-lib docket.u.d)
  ::   ?>  ?=([%o *] dk)
  ::   (~(put by p.dk) %id s+app-id.u.d)
  :: ::
  :: ++  dkt
  ::   |=  d=docket:docket
  ::   ^-  json
  ::   %-  pairs
  ::   :~  title+s+title.d
  ::       info+s+info.d
  ::       color+s+(scot %ux color.d)
  ::       href+(href href.d)
  ::       image+?~(image.d ~ s+u.image.d)
  ::       version+(version version.d)
  ::       license+s+license.d
  ::       website+s+website.d
  ::   ==
  :: ::
  :: ++  href
  ::   |=  h=href:docket
  ::   %+  frond  -.h
  ::   ?-    -.h
  ::       %site  s+(spat path.h)
  ::       %glob
  ::     %-  pairs
  ::     :~  base+s+base.h
  ::         glob-reference+(glob-reference glob-reference.h)
  ::     ==
  ::   ==
  :: ::
  :: ++  version
  ::   |=  v=version:docket
  ::   ^-  json
  ::   :-  %s
  ::   %-  crip
  ::   "{(num major.v)}.{(num minor.v)}.{(num patch.v)}"
  --
--