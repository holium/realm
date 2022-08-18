::
::  %bazaar [realm]:
::
::  A store for metadata on app dockets per Realm space.
::
::  Should watch and sync data with %treaty and %docket under /garden.
::
/-  store=bazaar, docket, spaces-store=spaces, membership-store=membership, hark=hark-store, passports-store=passports
/+  verb, dbug, default-agent
=>
  |%
  +$  card  card:agent:gall
  +$  versioned-state
      $%  state-0
      ==
  +$  state-0
    $:  %0
        =membership:membership-store
        =space-apps:store
        charges=(map desk charge:docket)
    ==
  --
=|  state-0
=*  state  -
=<
%+  verb  &
%-  agent:dbug
|_  =bowl:gall
+*  this  .
    def   ~(. (default-agent this %|) bowl)
    core   ~(. +> [bowl ~])
::
++  on-init
  ^-  (quip card _this)
  ::  scry docket for charges
  =/  =charge-update:docket  .^(charge-update:docket %gx /(scot %p our.bowl)/docket/(scot %da now.bowl)/charges/noun)
  ?>  ?=([%initial *] charge-update)
  %-  (slog leaf+"{<dap.bowl>}: docket sync" ~)
  :_  this(charges initial.charge-update)
  :~  ::  listen for charge updates (docket/desk)
      [%pass /docket %agent [our.bowl %docket] %watch /charges]
      [%pass /spaces %agent [our.bowl %spaces] %watch /updates]
      [%pass /bazaar %agent [our.bowl %bazaar] %watch /updates]
  ==
::
++  on-save
  ^-  vase
  !>(state)
::
++  on-load
  |=  old-state=vase
  ^-  (quip card:agent:gall agent:gall)
  =/  old  !<(versioned-state old-state)
  ?-  -.old
    %0  `this(state old)
  ==
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
  ?+  path              (on-watch:def path)
    ::
    [%updates ~]
      ::  only host should get all updates
      ?>  (is-host:core src.bowl)
      (bazaar:send-reaction:core [%initial space-apps.state] [/updates ~])
    ::
    [%bazaar @ @ ~]
      :: The space level watch subscription
      =/  host        `@p`(slav %p i.t.path)
      =/  space-pth   `@t`i.t.t.path
      ~&  >  [i.t.path host space-pth src.bowl]
      :: https://developers.urbit.org/guides/core/app-school/8-subscriptions#incoming-subscriptions
      ::  recommends crash on permission check or other failure
      ?>  (check-member:security:core [host space-pth] src.bowl)
      =/  pth         [our.bowl space-pth]
      =/  paths       [/bazaar/(scot %p our.bowl)/(scot %tas space-pth) ~]
      =/  apps        (~(got by space-apps.state) pth)
      (bazaar:send-reaction:core [%space-apps pth apps] paths)
    ::
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
    ::  ~/scry/bazaar/~zod/our/apps/[pinned|recommended|suite|installed|all].json
    ::
    [%x @ @ %apps @ ~]
      =/  =ship       (slav %p i.t.path)
      =/  space-pth   `@t`i.t.t.path
      =/  which  i.t.t.t.t.path
      ~&  >>  "{<ship>}, {<space-pth>}, {<which>}"
      ?+  which  ``json+!>(~)
        ::
        %all
          =/  apps  (~(got by space-apps.state) [ship space-pth])
          =/  apps=app-index:store
          %-  ~(rep by apps)
          |=  [[=app-id:store =app-entry:store] acc=app-index:store]
            =/  charge  (~(get by charges.state) app-id)
            =.  tags.app-entry
              ?~  charge
                tags.app-entry
              (~(put in tags.app-entry) %installed)
            (~(put by acc) app-id app-entry)
        ``bazaar-view+!>([%apps apps])
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
          ?~  p.sign  %-  (slog leaf+"{<dap.bowl>}: subscribed to spaces" ~)  `this
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
                (spaces-reaction:core !<(=reaction:spaces-store q.cage.sign))
              [cards this]
          ==
      ==

    [%docket ~]
      ?+    -.sign  (on-agent:def wire sign)
        %watch-ack
          ?~  p.sign  %-  (slog leaf+"{<dap.bowl>}: subscribed to docket" ~)  `this
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

    [%bazaar ~]
      ?+    -.sign  (on-agent:def wire sign)
        %watch-ack
          ?~  p.sign  %-  (slog leaf+"{<dap.bowl>}: subscribed to bazaar/updates" ~)  `this
          ~&  >>>  "{<dap.bowl>}: bazaar/updates subscription failed"
          `this
    ::
        %kick
          ~&  >  "{<dap.bowl>}: bazaar/updates kicked us, resubscribing..."
          :_  this
          :~  [%pass /bazaar %agent [our.bowl %bazaar] %watch /updates]
          ==
    ::
        %fact
          ?+    p.cage.sign  (on-agent:def wire sign)
              %bazaar-reaction
                =^  cards  state
                  (bazaar-reaction:core !<(=reaction:store q.cage.sign))
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
++  this  .
::
++  action
  |%
  ++  on
    |=  =action:store
    ^-  (quip card _state)
    ?-  -.action
      %pin         (pin +.action)
      %recommend   (rec +.action)
      %add         (add +.action)
      %remove      (rem +.action)
    ==
  ::
  ++  pin
    |=  [path=space-path:spaces-store =app-id:store]
    ^-  (quip card _state)
    `state
  ::
  ++  rec
    |=  [path=space-path:spaces-store =app-id:store]
    ^-  (quip card _state)
    `state
  ::
  ++  add
    |=  [path=space-path:spaces-store =app-id:store]
    ^-  (quip card _state)
    `state
  ::
  ++  rem
    |=  [path=space-path:spaces-store =app-id:store]
    ^-  (quip card _state)
    `state
  --
::  bazaar reactions
++  bazaar-reaction
  |=  [rct=reaction:store]
  ^-  (quip card _state)
  |^
  ?-  -.rct
    %initial        (on-initial +.rct)
    %space-apps     (on-space-apps +.rct)
  ==
  ::
  ++  on-initial
    |=  [=space-apps:store]
    ^-  (quip card _state)
    `state
  ::
  ++  on-space-apps
    |=  [=space-path:spaces-store =app-index:store]
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
++  spaces-reaction
  |=  [rct=reaction:spaces-store]
  ^-  (quip card _state)
  |^
  ?-  -.rct
    %initial        (on-initial +.rct)
    %add            (on-add +.rct)
    %replace        (on-replace +.rct)
    %remove         (on-remove +.rct)
    %space          (on-space-initial +.rct)
    %member-added   (on-member-added +.rct)
  ==
  ::
  ++  on-initial
    |=  [spaces=spaces:spaces-store]
    ^-  (quip card _state)
    :: =/  cards=(list card)
    :: %-  ~(rep by sps)
    :: |=  [[path=space-path:spaces-store =space:spaces-store] acc=(list card)]
    ::   %-  weld
    ::   :-  acc  ^-  (list card)
    ::   :~  [%pass /bazaar/(scot %tas space.path) %agent [our.bowl dap.bowl] %watch /updates]
    ::   ==
    :: :_  state(membership mems)
    :: cards
    `state
  ::
  ++  on-add
    |=  [space=space:spaces-store members=members:membership-store]
    ^-  (quip card _state)
    `state
  ::
  ++  on-replace
    |=  [space=space:spaces-store]
    ^-  (quip card _state)
    `state
  ::
  ++  on-remove
    |=  [path=space-path:spaces-store]
    ^-  (quip card _state)
    `state
  ::
  ++  on-space-initial
    |=  [path=space-path:spaces-store space=space:spaces-store]
    ^-  (quip card _state)
    `state
  ::
  ++  on-member-added
    |=  [path=space-path:spaces-store =ship]
    ^-  (quip card _state)
    :: ?:  ?|  =(our.bowl ship.path)
    ::         =(ship ship.path)
    ::     ==  `state
    %-  (slog leaf+"{<dap.bowl>}: on-member-added:spaces-reaction => subscribing to bazaar @ {<path>}..." ~)
    `state
    :: :~  [%pass /passports %agent [ship.path %passports] %watch /members/(scot %p ship.path)/(scot %tas space.path)]
    :: ==
  --
::
++  send-reaction
  |%
  ::
  ++  bazaar
    |=  [payload=reaction:store paths=(list path)]
    ^-  (quip card _state)
    :_  state
    :~  [%give %fact paths bazaar-reaction+!>(payload)]
    ==
  --
::
::  $security. member/permission checks
++  security
  |%
  ::  $check-member - check for member existence and 'joined' status
  ::    add additional security as needed
  ++  check-member
    |=  [path=space-path:spaces-store =ship]
    =/  members  (~(get by membership.state) path)
    ?~  members  %.n
    =/  member  (~(get by u.members) ship)
    ?~  member  %.n
    =/  passport  .^(passport:passports-store %gx /(scot %p ship.path)/passports/(scot %da now.bowl)/passport/[space.path]/noun)
    ?:(=(status.passport 'joined') %.y %.n)
  --
::
++  is-host
  |=  [=ship]
  =(our.bowl ship)
--