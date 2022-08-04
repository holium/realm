::
::  %bazaar [realm]:
::
::  A store for metadata on app dockets per Realm space.
::
::  Should watch and sync data with %treaty and %docket under /garden.
::
/-  store=bazaar, docket, spaces-store=spaces, membership-store=membership, hark=hark-store, passport-store=passports, treaty-store=treaty
/+  dbug, default-agent
|%
+$  card  card:agent:gall
+$  versioned-state
    $%  state-0
    ==
+$  state-0
  $:  %0
      =membership:membership-store
      =space-apps:store
      =apps:store
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
    ::  ~/scry/bazaar/~zod/our/apps/[pinned|recommended|suite|all].json
    ::
    [%x @ @ %apps @ ~]
      =/  =ship       (slav %p i.t.path)
      =/  space-pth   `@t`i.t.t.path
      =/  arg  i.t.t.t.t.path
      ~&  >>  "{<ship>}, {<space-pth>}, {<arg>}"
      ?>  ?=(tag:store arg)
      =/  apps  (apps:view:core [ship space-pth] arg)
      =/  apps  (srt:rec:core apps)
      ``json+!>((view:enjs:core [arg apps]))
    ::
    ::  ~/scry/bazaar/allies
    ::  leverage treaty agent for now to get list of allies
    [%x %allies ~]
      ``json+!>(.^(json %gx /(scot %p our.bowl)/treaty/(scot %da now.bowl)/allies/json))
    ::
    ::  ~/scry/bazaar/treaties/${ship}
    ::  leverage treaty agent for now to get list of treaties by ship
    [%x %treaties @ ~]
      =/  =ship       (slav %p i.t.t.path)
      ``json+!>(.^(json %gx /(scot %p our.bowl)/treaty/(scot %da now.bowl)/treaties/(scot %p ship)/json))
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
                  (on:sp:core !<(=spaces-reaction:spaces-store q.cage.sign))
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
      %add         (ad +.action)
      %remove      (rem +.action)
      %pin         (pin +.action)
      %recommend   (rec +.action)
    ==
  ::
  ++  rec
    |=  [path=space-path:spaces-store =app-id:store]
    ^-  (quip card _state)
    =/  index  (~(get by space-apps.state) path)
    ?~  index  `state
    =/  entry  (~(get by u.index) app-id)
    ?~  entry  `state
    =.  rank.u.entry  (add 1 rank.u.entry)
    =/  index  (~(put by u.index) app-id u.entry)
    `state(space-apps (~(put by space-apps.state) path index))
  ::
  ++  pin
    |=  [path=space-path:spaces-store =app-id:store]
    ^-  (quip card _state)
    =/  index  (~(get by space-apps.state) path)
    ?~  index  `state
    =/  entry  (~(get by u.index) app-id)
    ?~  entry  `state
    =.  tags.u.entry  (~(put in tags.u.entry) %pinned)
    =/  index  (~(put by u.index) app-id u.entry)
    `state(space-apps (~(put by space-apps.state) path index))
  ::
  ++  ad
    |=  [path=space-path:spaces-store =app-id:store]
    ^-  (quip card _state)
    =/  index  (~(get by space-apps.state) path)
    ?~  index  `state
    =/  is-installed  (~(has by apps.state) app-id)
    =|  tags=(set tag:store)
    =.  tags  (~(put in tags) %suite)
    =.  tags  ?:(is-installed (~(put in tags) %installed) tags)
    =/  index  (~(put by u.index) app-id [%0 tags])
    `state(space-apps (~(put by space-apps.state) path index))
  ::
  ++  rem
    |=  [path=space-path:spaces-store =app-id:store]
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
    |=  reaction=spaces-reaction:spaces-store
    ^-  (quip card _state)
    :: `state
    ?-  -.reaction
      %initial  (ini +.reaction)
      %add      (add +.reaction)
      %replace  (rep +.reaction)
      %remove   (rem +.reaction)
      %space    (spc +.reaction)
    ==
  ::
  ++  ini
    |=  [=spaces:spaces-store mems=membership:membership-store]
    ^-  (quip card _state)
    `state
    :: =/  cards=(list card)
    :: %-  ~(rep by spaces)
    :: |=  [[path=space-path:spaces-store =space:spaces-store] acc=(list card)]
    ::   %-  weld
    ::   :-  acc  ^-  (list card)
    ::   :~  [%pass /bazaar/(scot %tas space.path) %agent [our.bowl dap.bowl] %watch /updates]
    ::   ==
    :: :_  state(membership mems)
    :: cards
  ::
  ++  add
    |=  [=space:spaces-store =members:membership-store]
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
    |=  [=space:spaces-store]
    ^-  (quip card _state)
    `state
  ::
  ++  rem
    |=  [path=space-path:spaces-store]
    ^-  (quip card _state)
    =/  key  [ship.path space.path]
    :_  state(membership (~(del by membership.state) key))
    :~  [%pass /bazaar/(scot %tas space.path) %agent [our.bowl dap.bowl] %leave ~]
    ==
  ++  spc
    |=  [path=space-path:spaces-store =space:spaces-store =members:membership-store]
    ^-  (quip card _state)
    `state
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
    (~(any in roles.u.member) |=(a=@ ?:(=(a %invited) %.y %.n)))
    :: =/  passport  .^(passport:passport-store %gx /(scot %p our.bowl)/passports/(scot %da now.bowl)/passport/[space]/noun)
    :: ?:(=(status.passport 'joined') %.y %.n)
  --
++  view
  |%
  ++  apps
    |=  [path=space-path:spaces-store =tag:store]
    ^-  (list app-view:store)
    =/  index  (~(get by space-apps.state) path)
    ?~  index  ~
    ::  listify the map into list of key/value pairs
    %+  roll  ~(tap by u.index)
    |=  [[=app-id:store =app-entry:store] acc=(list app-view:store)]
    ?.  (~(has in tags.app-entry) tag)  acc
    =/  app  (~(get by apps.state) app-id)
    ?~  app  acc
    =|  vw=app-view:store
    =.  meta.vw  app-entry
    =.  app.vw   u.app
    (snoc acc vw)
  --
++  rec
  |%
  ++  srt
    |=  apps=(list app-view:store)
    ^-  (list app-view:store)
    %+  sort  apps
    |=  [p=app-view:store q=app-view:store]
    ^-  ?
    (gth rank.meta.p rank.meta.q)
  --
++  enjs
  |%
  ++  view
    |=  =view:store
    ^-  json
    %-  pairs:enjs:format
    :_  ~
    ^-  [cord json]
    ?+  which.view  [%o ~]
        %recommended
      [%recommended [%a (vw:encode apps.view)]]
    ==
  --
++  encode
  |%
  ++  vw
    |=  [apps=(list app-view:store)]
    ^-  (list json)
    (turn apps ap)
  ::
  ++  ap
    |=  [=app-view:store]
    ^-  json
    ?-  -.app.app-view
      %native   (nat +.app.app-view)
      %web      (web +.app.app-view)
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
::       ^-  role:membership-store
::       ?>  ?=(%s -.json)
::       ?:  =('initiate' p.json)   %initiate
::       ?:  =('member' p.json)     %member
::       ?:  =('admin' p.json)      %admin
::       ?:  =('owner' p.json)      %owner
::       !!
::     --
::   --
--