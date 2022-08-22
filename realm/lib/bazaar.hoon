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
    ~&  >>  "{<jon>}"
    =<  (decode jon)
    |%
    ++  decode
      %-  of
      :~  [%add-tag add-tag]
          [%remove-tag rem-tag]
      ==
    ::
    ++  add-tag
      %-  ot
      :~  [%path pth]
          :: [%app-id so]
          :: [%tag tg]
          :: [%rank (mu ni)]
      ==
    ::
    ++  rem-tag
      %-  ot
      :~  [%path pth]
          [%app-id so]
          [%tag tg]
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
        ['ranks' (rnks ranks.app-entry)]
        ['tags' a+(turn ~(tap in tags.app-entry) |=(tg=tag:store s+(scot %tas tg)))]
        ['docket' ?~(docket.app-entry ~ (docket:enjs:docket-lib u.docket.app-entry))]
    ==
  ::
  ++  rnks
    |=  =ranks:store
    ^-  json
    %-  pairs
    %+  turn  ~(tap by ranks)
    |=  [=tag:store rank=@ud]
    ^-  [cord json]
    ?-  tag
      %pinned       ['pinned' n+(cord "{<rank>}")]
      %recommended  ['recommended' n+(cord "{<rank>}")]
      %suite        ['suite' n+(cord "{<rank>}")]
      %installed    ['installed' n+(cord "{<rank>}")]
    ==
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