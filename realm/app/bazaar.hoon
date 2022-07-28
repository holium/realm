::
::  %bazaar [realm]:
::
::  A store for metadata on app dockets per Realm space.
::
::  Should watch and sync data with %treaty and %docket under /garden.
::
/-  store=bazaar, docket, sp-sur=spaces, membership-store=membership, hark=hark-store, passport-store=passports
/+  dbug, default-agent
|%
+$  card  card:agent:gall
+$  versioned-state
    $%  state-0
    ==
+$  state-0
  $:  %0
      =membership:membership-store
      =installed-apps:store
      =space-apps:store
  ==
--
=|  state-0
=*  state  -
%-  agent:dbug
^-  agent:gall
=<
|_  =bowl:gall
+*  this  .
    def   ~(. (default-agent this %.n) bowl)
    core   ~(. +> [bowl ~])
::
++  on-init
  ^-  (quip card _this)
  ::  scry docket for charges
  =/  jon=json  .^(json %gx /(scot %p our.bowl)/docket/(scot %da now.bowl)/charges/json)
  ::  convert charges json to charge data type (defined in docket)
  :: =/  charges  (charges:dejs:format jon)
  :: :_  this(charges charges)
  :_  this
  :~  ::  listen for charge updates (docket/desk)
      [%pass /docket %agent [our.bowl %docket] %watch /charges]
      [%pass /spaces %agent [our.bowl %spaces] %watch /updates]
  ==

++  on-save   !>(~)
++  on-load   |=(vase `..on-init)
::
++  on-poke
  |=  [=mark =vase]
  ^-  (quip card _this)
  =^  cards  state
  ?+  mark  (on-poke:def mark vase)
    %app-store-action  (on:action:core !<(action:store vase))
  ==
  [cards this]
::
++  on-watch
  |=  =path
  ^-  (quip card _this)
  =^  cards  state
  ?+  path            (on-watch:def path)
    [%updates @ ~]    (bind:su:core i.t.path)
    [%response ~]     ~
  ==
  [cards this]
::
++  on-leave  |=(path `..on-init)
::
++  on-peek
  |=  =path
  ^-  (unit (unit cage))
  ?+    path  (on-peek:def path)
    ::
    ::  ~/scry/bazaar/~zod/our/apps/[pinned|recommended|suite|installed].json
    ::
    [%x @ @ %apps @ ~]
      =/  =ship       (slav %p i.t.path)
      =/  space-pth   `@t`i.t.t.path
      =/  which  i.t.t.t.t.path
      ~&  >>  "{<ship>}, {<space-pth>}, {<which>}"
      ?+  which  ``json+!>(~)
        ::
        %pinned
        ``json+!>(~)
          :: =/  apps  (~(get by pinned.space-apps.state) [ship space-pth])
          :: ?~  apps      ``json+!>(~)
          :: ``json+!>((view:enjs:core [%pinned u.apps]))
        ::
        %recommended
          =/  apps  (~(get by recommended.space-apps.state) [ship space-pth])
          ?~  apps      ``json+!>(~)
          ::  sort the list of recommended apps by star count
          =/  apps=(list [@u app:store])  (srt:rec:core u.apps)
          ``json+!>((view:enjs:core [%recommended apps]))
        ::
        %suite
        ``json+!>(~)
          :: =/  apps  (~(get by suite.space-apps.state) [ship space-pth])
          :: ?~  apps      ``json+!>(~)
          :: ``json+!>((view:enjs:core [%suite u.apps]))
        ::
        :: %installed
        ::   =/  apps  (~(get by suite.space-apps.state) [ship space-pth])
        ::   ?~  apps      ``json+!>(~)
        ::   ``json+!>((view:enjs:core [%installed u.apps]))
      ==
  ==
::
++  on-agent
  |=  [=wire =sign:agent:gall]
  ^-  (quip card _this)
  =/  wirepath  `path`wire
  ?+    wire  (on-agent:def wire sign)
    [%spaces ~]
      ?+    -.sign  (on-agent:def wire sign)
        %watch-ack
          ?~  p.sign  `this
          ~&  >>>  "{<dap.bowl>}: spaces subscription failed"
          `this
    ::
        %kick
          ~&  >  "{<dap.bowl>}: spaces kicked us, resubscribing..."
          :_  this
          :~  [%pass /spaces %agent [our.bowl %spaces] %watch /updates]
          ==
    ::
        %fact
          ?+    p.cage.sign  (on-agent:def wire sign)
              %spaces-reaction
                =^  cards  state
                  (on:sp:core !<(=reaction:sp-sur q.cage.sign))
                [cards this]
          ==
      ==

    [%docket ~]
      ?+    -.sign  (on-agent:def wire sign)
        %watch-ack
          ?~  p.sign  `this
          ~&  >>>  "{<dap.bowl>}: docket/charges subscription failed"
          `this
    ::
        %kick
          ~&  >  "{<dap.bowl>}: docket/charges kicked us, resubscribing..."
          :_  this
          :~  [%pass /spaces %agent [our.bowl %spaces] %watch /updates]
          ==
    ::
        %fact
          ?+    p.cage.sign  (on-agent:def wire sign)
              %charge-update
                =^  cards  state
                  (on:ch:core !<(=charge-update:docket q.cage.sign))
                [cards this]
          ==
      ==
  ==
::
++  on-arvo   |=([wire sign-arvo] !!)
++  on-fail   |=([term tang] `..on-init)
--
|_  [=bowl:gall cards=(list card)]
::
++  core  .
::
++  action
  |%
  ++  on
    |=  =action:store
    ^-  (quip card _state)
    ?-  -.action
      %add         (add +.action)
      %remove      (rem +.action)
    ==
  ::
  ++  add
    |=  [path=space-path:sp-sur =sample:store]
    ^-  (quip card _state)
    `state
  ::
  ++  rem
    |=  [path=space-path:sp-sur =sample:store]
    ^-  (quip card _state)
    `state
  --
::  charge arms
++  ch
  |%
  ++  on
    |=  upd=charge-update:docket
    ^-  (quip card _state)
    ?-  -.upd
      ::  initial does not to be sent. must scry docket for charges
      %initial        (ini:ch:core initial.upd)
      %add-charge     (add:ch:core +.upd)
      %del-charge     (rem:ch:core +.upd)
    ==
  ::
  ++  ini
    |=  [initial=(map desk charge:docket)]
    ^-  (quip card _state)
    ~&  >>  "{<dap.bowl>}: charge-update [initial] received. {<initial>}"
    `state
  ::
  ++  add
    |=  [=desk =charge:docket]
    ^-  (quip card _state)
    ~&  >>  "{<dap.bowl>}: charge-update [add-charge] received. {<desk>}, {<charge>}"
    `state
  ::
  ++  rem
    |=  [=desk]
    ^-  (quip card _state)
    ~&  >>  "{<dap.bowl>}: charge-update [del-charge] received. {<desk>}"
    `state
  --
::  spaces arms
++  sp
  |%
  ++  on
    |=  =reaction:sp-sur
    ^-  (quip card _state)
    ?-  -.reaction
      %initial  (ini +.reaction)
      %add      (add +.reaction)
      %replace  (rep +.reaction)
      %remove   (rem +.reaction)
    ==
  ::
  ++  ini
    |=  [sps=spaces:sp-sur mems=membership:membership-store]
    ^-  (quip card _state)
    =/  cards=(list card)
    %-  ~(rep by sps)
    |=  [[path=space-path:sp-sur =space:sp-sur] acc=(list card)]
      %-  weld
      :-  acc  ^-  (list card)
      :~  [%pass /bazaar/(scot %tas space.path) %agent [our.bowl dap.bowl] %watch /updates]
      ==
    :_  state(membership mems)
    cards
  ::
  ++  add
    |=  [=space:sp-sur =members:membership-store]
    ^-  (quip card _state)
    =/  key  [ship.path.space space.path.space]
    :_  state(membership (~(put by membership.state) key members))
    :~  [%pass /bazaar/(scot %tas space.path.space) %agent [our.bowl dap.bowl] %watch /updates]
    ==
  ::
  ::  $rep: not sure what to do here. could try and get existing space
  ::    and delete that from map, then re-add this new space, but what to
  ::    do about missing membership info?
  ++  rep
    |=  [=space:sp-sur]
    ^-  (quip card _state)
    `state
  ::
  ++  rem
    |=  [path=space-path:sp-sur]
    ^-  (quip card _state)
    =/  key  [ship.path space.path]
    :_  state(membership (~(del by membership.state) key))
    :~  [%pass /bazaar/(scot %tas space.path) %agent [our.bowl dap.bowl] %leave ~]
    ==
  --
::  subscription (watch) handling
++  su
  |%
  ::
  ::  $bi: bind. check that remote is a valid space member. if
  ::    member allow subscription.
  ++  bind
    |=  [space=cord]
    ^-  (quip card _state)
    :: https://developers.urbit.org/guides/core/app-school/8-subscriptions#incoming-subscriptions
    ::  recommends crash on permission check or other failure
    ?.  (check-member:security:core space src.bowl)  !!
    `state
  --
::
::  $security. member/permission checks
++  security
  |%
  ::  $check-member - check for member existence and 'joined' status
  ::    add additional security as needed
  ++  check-member
    |=  [space=cord =ship]
    =/  members  (~(get by membership.state) [our.bowl space])
    ?~  members  %.n
    =/  member  (~(get by u.members) ship)
    ?~  member  %.n
    =/  passport  .^(passport:passport-store %gx /(scot %p our.bowl)/passports/(scot %da now.bowl)/passport/[space]/noun)
    ?:(=(status.passport 'joined') %.y %.n)
  --
++  rec
  |%
  ++  srt
    |=  apps=(set [@u app:store])
    ^-  (list [@u app:store])
    %+  sort  ~(tap in apps)
    |=  [p=[stars=@u app:store] q=[stars=@u app:store]]
    ^-  ?
    (gth stars.p stars.q)
  --
++  enjs
  |%
  ++  view
    |=  =view:store
    ^-  json
    %-  pairs:enjs:format
    :_  ~
    ^-  [cord json]
    ?-  -.view
        %recommended
      [%recommended [%a (rec:encode apps.view)]]
    ==
  --
++  encode
  |%
  ++  rec
    |=  [apps=(list [@u app:store])]
    ^-  (list json)
    %+  turn  apps
    |=  [stars=@u =app:store]
    ?-  -.app
      %native   (nat +.app)
      %web      (web +.app)
    ==
  ::
  ++  nat
    |=  [app=native-app:store]
    ^-  json
    %-  pairs:enjs:format
    :~  ['desk' s+desk.app]
        ['title' s+title.app]
        ['info' s+info.app]
        ['color' s+(scot %ux color.app)]
        ['image' s+image.app]
        ['href' (ref href.app)]
    ==
  ::
  ++  web
    |=  [app=web-app:store]
    ^-  json
    %-  pairs:enjs:format
    :~  ['id' s+id.app]
        ['title' s+title.app]
        ['href' s+href.app]
    ==
  ::
  ++  ref
    |=  [=href:store]
    ^-  json
    ?-  -.href
      %glob   (glob +.href)
      %site   s+(spat path.href)
    ==
  ::
  ++  glob
    |=  [base=term =glob-reference:store]
    ^-  json
    [%s base]
  --
::
:: ++  dejs
::   =,  dejs:format
::   |%
::   ++  charge-update
::     |=  jon=json
::     ^-  ^charge-update:docket
::     =<  (decode jon)
::     |%
::     ++  decode
::       %-  of
::       :~  [%initial initial]
::           [%add-charge add-charge]
::           [%del-charge del-charge]
::       ==
::     ::
::     ++  initial

::     ::
::     ++  add-charge
::       %-  ot
::       :~  [%desk so]
::           [%charge chrg]
::       ==
::     ::
::     ++  remove-passport
::       %-  ot
::       :~  [%path pth]
::           [%ship (su ;~(pfix sig fed:ag))]
::       ==
::     ::
::     ++  chrg
::       %-  ot
::       :~  [%docket dkt]
::           [%chad chd]
::       ==
::     ::
::     ++  dkt
::       %-  ot
::       :~  [%title so]
::           [%info so]
::           [%color nu]
::           [%href hr]
::           [%image (un so)]
::           [%version ]
::     ++  chd
::     ::
::     ++  edit-passport
::       %-  ot
::       :~  [%path pth]
::           [%ship (su ;~(pfix sig fed:ag))]
::           [%payload payl]
::       ==
::     ::
::     ++  payl
::       |=  jon=json
::       ^-  payload
::       =/  data  ?:(?=([%o *] jon) p.jon ~)
::       =/  result=payload
::       %-  ~(rep by data)
::       |=  [[key=@tas jon=json] obj=payload]
::       ?+  key  obj
::          %alias         (~(put in obj) [%alias (so jon)])
::          %add-roles     (~(put in obj) [%add-roles ((as rol) jon)])
::          %remove-roles  (~(put in obj) [%remove-roles ((as rol) jon)])
::       ==
::       result
::     ::
::     ++  pth
::       %-  ot
::       :~  [%ship (su ;~(pfix sig fed:ag))]
::           [%space so]
::       ==
::     ::
::     ++  rol
::       |=  =json
::       ^-  role:membership
::       ?>  ?=(%s -.json)
::       ?:  =('initiate' p.json)   %initiate
::       ?:  =('member' p.json)     %member
::       ?:  =('admin' p.json)      %admin
::       ?:  =('owner' p.json)      %owner
::       !!
::     --
::   --
--