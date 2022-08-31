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
      :~  [%add-tag add-tag]
          [%remove-tag rem-tag]
          [%suite-add suite-add]
          [%suite-remove suite-remove]
      ==
    ::
    ++  add-tag
      %-  ot
      :~  [%path pth]
          [%app-id so]
          [%tag tg]
          [%rank (mu ni)]
      ==
    ::
    ++  rem-tag
      %-  ot
      :~  [%path pth]
          [%app-id so]
          [%tag tg]
      ==
    ::
    ++  suite-add
      %-  ot
      :~  [%path pth]
          [%app-id so]
          [%rank (mu ni)]
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
          [%app-views (appvws:encode app-views.rct)]
      ==
    ::
        %add-tag
      :-  %add-tag
      %-  pairs
      :~  [%space-path s+(spat /(scot %p ship.path.rct)/(scot %tas space.path.rct))]
          [%app-id s+app-id.rct]
          [%tag s+(scot %tas tag.rct)]
          :: [%rank ~]
      ==
    ::
        %remove-tag
      :-  %remove-tag
      %-  pairs
      :~  [%space-path s+(spat /(scot %p ship.path.rct)/(scot %tas space.path.rct))]
          [%app-id s+app-id.rct]
          [%tag s+(scot %tas tag.rct)]
          :: [%rank ~]
      ==
    ::
        %suite-add
      :-  %suite-add
      %-  pairs
      :~  [%space-path s+(spat /(scot %p ship.path.rct)/(scot %tas space.path.rct))]
          [%app-id s+app-id.rct]
          [%rank n+(crip "{<rank.rct>}")]
      ==
    ::
        %suite-remove
      :-  %suite-remove
      %-  pairs
      :~  [%space-path s+(spat /(scot %p ship.path.rct)/(scot %tas space.path.rct))]
          [%app-id s+app-id.rct]
      ==
    ::
        %app-installed
      :-  %app-installed
      %-  pairs
      :~  [%desk s+desk.rct]
          [%docket (pairs (dkt:encode docket.rct))]
      ==
    ::
        %app-uninstalled
      :-  %app-uninstalled
      %-  pairs
      :~  [%desk s+desk.rct]
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
      (appvws:encode app-views.vi)
    ==
  --
::
++  encode
  =,  enjs:format
  |%
  ++  space-apps-full
    |=  =space-apps-full:store
    ^-  json
    %-  pairs
    %+  turn  ~(tap by space-apps-full)
    |=  [pth=space-path:spaces-store =app-views:store]
    =/  spc-path  (spat /(scot %p ship.pth)/(scot %tas space.pth))
    ^-  [cord json]
    [spc-path (appvws app-views)]
  ::
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
  ++  appvws
    |=  =app-views:store
    ^-  json
    %-  pairs
    %+  turn  ~(tap by app-views)
    |=  [=app-id:store =app-view:store]
    ^-  [cord json]
    [app-id (appvw app-view)]
  ::
  ++  appvw
    |=  =app-view:store
    ^-  json
    =/  meta=(list [cord json])
    :~  [%id s+id.app-entry.app-view]
        ['ship' s+(scot %p ship.app-entry.app-view)]
        ['ranks' (rnks ranks.app-entry.app-view)]
        ['tags' a+(turn ~(tap in tags.app-entry.app-view) |=(tg=tag:store s+(scot %tas tg)))]
    ==
    =/  data=(list [cord json])
    ?-  -.app.app-view
      ::
      %native
        :~  desk+s+desk.native-app.app.app-view
            title+s+title.native-app.app.app-view
            info+s+info.native-app.app.app-view
            color+s+(scot %ux color.native-app.app.app-view)
            image+s+image.native-app.app.app-view
            href+(href href.native-app.app.app-view)
        ==
      ::
      %web
        :~  id+s+id.web-app.app.app-view
            title+s+title.web-app.app.app-view
            href+s+href.web-app.app.app-view
        ==
      ::
      %urbit  (dkt docket.app.app-view)
      ::
      %missing  ~
    ==
    %-  pairs
    ?~  data  meta  (weld meta data)
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
    :~  [%id s+id.app-entry]
        ['ship' s+(scot %p ship.app-entry)]
        ['ranks' (rnks ranks.app-entry)]
        ['tags' a+(turn ~(tap in tags.app-entry) |=(tg=tag:store s+(scot %tas tg)))]
    ==
  ::
  ++  dkt
    |=  =docket:docket
    ^-  (list [cord json])
    :~  title+s+title.docket
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
    :~  [%default n+(crip "{<default.ranks>}")]
        [%pinned n+(crip "{<pinned.ranks>}")]
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