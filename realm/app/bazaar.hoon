::
::  %bazaar [realm]:
::
::  A store for metadata on app dockets per Realm space.
::
::  Should watch and sync data with %treaty and %docket under /garden.
::
/-  store=bazaar, docket, spaces, membership-store=membership, hark=hark-store
/+  dbug, default-agent
|%
+$  card  card:agent:gall
+$  versioned-state
    $%  state-0
    ==
+$  state-0
  $:  %0
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
++  on-watch  |=(path !!)
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
        ``json+!>(~)
          :: =/  apps  (~(get by recommended.space-apps.state) [ship space-pth])
          :: ?~  apps      ``json+!>(~)
          :: ``json+!>((view:enjs:core [%recommended u.apps]))
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
        :: %fact
        ::   ?+    p.cage.sign  (on-agent:def wire sign)
        ::       %spaces-reaction
        ::         =/  action  !<(=reaction:spaces q.cage.sign)
        ::         =^  cards  state
        ::         ?-  -.action :: (on-agent:def wire sign)
        ::           %initial  (on-spaces-initial:core action)
        ::           %add      (on-spaces-add:core action)
        ::           %replace  (on-spaces-replace:core action)
        ::           %remove   (on-spaces-remove:core action)
        ::         ==
        ::         [cards this]
        ::   ==
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
    |=  [path=space-path:spaces =sample:store]
    ^-  (quip card _state)
    `state
  ::
  ++  rem
    |=  [path=space-path:spaces =sample:store]
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