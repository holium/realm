::
::  %bazaar [realm]:
::
::  A store for metadata on app dockets per Realm space.
::
::  notes: we currently do not store docket detail in bazaar (by design).
::   instead, docket info is scried and relayed to UI on initial bazaar subscription.
::   to simplify the UI and minimize subscriptions, those app events UI is interested
::   in (new apps, treaties, allies) are handled here in this agent and relayed to UI
::   over /updates path
::
/-  store=bazaar, docket, spaces-store=spaces
/-  membership-store=membership, hark=hark-store, passports-store=passports
/-  treaty
/+  verb, dbug, default-agent
=>
  |%
  +$  card  card:agent:gall
  +$  versioned-state
      $%  state-0
      ==
  +$  state-0
    $:  %0
        :: =membership:membership-store
        =app-catalog:store
        =space-apps:store
        :: charges=(map desk charge:docket)
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
  =/  apps=app-index:store  (index:apps:core initial.charge-update)
  =/  our-space             [our.bowl 'our']
  :: build slimmed down space specific app (metadata) from docket charges (installed apps)
  =.  space-apps.state      (~(put by space-apps.state) our-space apps)
  :: build robust app catalog from docket charges (installed apps)
  =.  app-catalog.state     (catalog:apps:core initial.charge-update)
  :: ~&  >>>  "{<space-apps.state>}"
  :_  this
  :~  ::  listen for charge updates (docket/desk)
      [%pass /docket %agent [our.bowl %docket] %watch /charges]
      [%pass /treaties %agent [our.bowl %treaty] %watch /treaties]
      [%pass /allies %agent [our.bowl %treaty] %watch /allies]
      [%pass /spaces %agent [our.bowl %spaces] %watch /updates]
      [%pass /bazaar %agent [our.bowl %bazaar] %watch /our]
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
  ~&  >>  "{<dap.bowl>}: {<[mark vase]>}"
  =^  cards  state
  ?+  mark  (on-poke:def mark vase)
    %bazaar-action  (on:action:core !<(action:store vase))
  ==
  [cards this]
::
++  on-watch
  |=  =path
  ^-  (quip card _this)
  =^  cards  state
  ?+  path              (on-watch:def path)
     :: agent updates
    [%our ~]
      ::  only host agent should get our updates
      ?>  (is-host:core src.bowl)
      ~&  >>  "{<dap.bowl>}: subscribing to /our"
      `state
    ::
    [%updates ~]
      ::  only host should get all updates
      ?>  (is-host:core src.bowl)
      =/  apps  initial:apps:core
      ~&  >>  "{<dap.bowl>}: subscribing to /updates"
      :: (bazaar:send-reaction:core [%initial space-apps.state] [/updates ~])
      (bazaar:send-reaction:core [%initial apps] [/updates ~])
    ::
    [%bazaar @ @ ~]
      :: The space level watch subscription
      =/  host        `@p`(slav %p i.t.path)
      =/  space-pth   `@t`i.t.t.path
      :: https://developers.urbit.org/guides/core/app-school/8-subscriptions#incoming-subscriptions
      ::  recommends crash on permission check or other failure
      ?>  (check-member:security:core [host space-pth] src.bowl)
      =/  pth         [our.bowl space-pth]
      =/  paths       [/bazaar/(scot %p our.bowl)/(scot %tas space-pth) ~]
      =/  apps        (space-initial:apps:core pth)
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

    :: scry for now. if performance issues, move back to on-init maybe
    =/  =charge-update:docket  .^(charge-update:docket %gx /(scot %p our.bowl)/docket/(scot %da now.bowl)/charges/noun)
    ?>  ?=([%initial *] charge-update)
    =/  charges=(map desk charge:docket)  initial.charge-update

  ?+    path  (on-peek:def path)
    ::
    ::  ~/scry/bazaar/~zod/our/apps/[pinned|recommended|suite|installed|all].json
    ::
    [%x @ @ %apps @ ~]
      =/  =ship       (slav %p i.t.path)
      =/  space-pth   `@t`i.t.t.path
      =/  which  `@tas`i.t.t.t.t.path
      ?+  which  ``json+!>(~)
        ::
        %all
        =/  apps  (view:apps:core charges [ship space-pth] ~)
        ?~  apps  ``json+!>([%a ~]) :: empty array
        ``bazaar-view+!>([%apps u.apps])
        ::
        %pinned
        =/  apps  (view:apps:core charges [ship space-pth] (some %pinned))
        ?~  apps  ``json+!>([%a ~]) :: empty array
        ``bazaar-view+!>([%apps u.apps])
        ::
        %recommended
        =/  apps  (view:apps:core charges [ship space-pth] (some %recommended))
        ?~  apps  ``json+!>([%a ~]) :: empty array
        ``bazaar-view+!>([%apps u.apps])
        ::
        %suite
        =/  apps  (view:apps:core charges [ship space-pth] (some %suite))
        ?~  apps  ``json+!>([%a ~]) :: empty array
        ``bazaar-view+!>([%apps u.apps])
        ::
        %installed
        =/  apps  (view:apps:core charges [ship space-pth] (some %installed))
        ?~  apps  ``json+!>([%a ~]) :: empty array
        ``bazaar-view+!>([%apps u.apps])
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

    [%treaties ~]
      ?+    -.sign  (on-agent:def wire sign)
        %watch-ack
          ?~  p.sign  %-  (slog leaf+"{<dap.bowl>}: subscribed to /treaties" ~)  `this
          ~&  >>>  "{<dap.bowl>}: /treaties subscription failed"
          `this
    ::
        %kick
          ~&  >  "{<dap.bowl>}: /treaties kicked us, resubscribing..."
          :_  this
          :~  [%pass /spaces %agent [our.bowl %spaces] %watch /updates]
          ==
    ::
        %fact
          ?+    p.cage.sign  (on-agent:def wire sign)
              %treaty-update-0
                =^  cards  state
                  (treaty-update:core !<(=update:treaty:treaty q.cage.sign))
                [cards this]
          ==
      ==

    [%allies ~]
      ?+    -.sign  (on-agent:def wire sign)
        %watch-ack
          ?~  p.sign  %-  (slog leaf+"{<dap.bowl>}: subscribed to /allies" ~)  `this
          ~&  >>>  "{<dap.bowl>}: /allies subscription failed"
          `this
    ::
        %kick
          ~&  >  "{<dap.bowl>}: /allies kicked us, resubscribing..."
          :_  this
          :~  [%pass /spaces %agent [our.bowl %spaces] %watch /updates]
          ==
    ::
        %fact
          ?+    p.cage.sign  (on-agent:def wire sign)
              %ally-update-0
                =^  cards  state
                  (ally-update:core !<(=update:ally:treaty q.cage.sign))
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
      %add-tag           (add-tag +.action)
      %remove-tag        (rem-tag +.action)
      %suite-add         (suite-add +.action)
      %suite-remove      (suite-remove +.action)
    ==
  ::
  ++  add-tag
    |=  [path=space-path:spaces-store =app-id:store =tag:store rank=(unit @ud)]
    ^-  (quip card _state)
    ::  installed tags are managed by bazaar agent
    ?>  !?=(%installed tag)
    =/  apps  (~(got by space-apps.state) path)
    =/  app  (~(got by apps) app-id)
    =.  tags.app  (~(put in tags.app) tag)
    ::  only update rank if requested (not null value)
    :: =.  ranks.app  ?~(rank ranks.app (~(put in ranks.app) tag u.rank))
    =/  apps  (~(put by apps) app-id app)
    =.  space-apps.state  (~(put by space-apps.state) path apps)
    =/  paths  [/updates /bazaar/(scot %p ship.path)/(scot %tas space.path) ~]
    :: :_  state(space-apps (~(put by space-apps.state) path apps))
    (bazaar:send-reaction [%add-tag path app-id tag] paths)
  ::
  ++  rem-tag
    |=  [path=space-path:spaces-store =app-id:store =tag:store]
    ^-  (quip card _state)
    ::  installed tags are managed by bazaar agent
    ?>  !?=(%installed tag)
    =/  apps  (~(got by space-apps.state) path)
    =/  app  (~(got by apps) app-id)
    =.  tags.app  (~(del in tags.app) tag)
    =/  apps  (~(put by apps) app-id app)
    =.  space-apps.state  (~(put by space-apps.state) path apps)
    =/  paths  [/updates /bazaar/(scot %p ship.path)/(scot %tas space.path) ~]
    (bazaar:send-reaction [%remove-tag path app-id tag] paths)
    :: `state(space-apps (~(put by space-apps.state) path apps))
  ::
  ++  suite-add
    |=  [path=space-path:spaces-store =app-id:store rank=(unit @ud)]
    ^-  (quip card _state)
    ~&  >>  "{<dap.bowl>}: suite-add => {<[path app-id rank]>}"
    =/  paths  [/updates /bazaar/(scot %p ship.path)/(scot %tas space.path) ~]
    ~&  >>  "{<dap.bowl>}: sending reaction {<[path app-id rank]>}"
    =/  result=[apps=space-apps:store rank=@ud]  (add:suite path app-id rank)
    =.  space-apps.state  apps.result
    (bazaar:send-reaction [%suite-add path app-id rank.result] paths)
  ::
  ++  suite-remove
    |=  [path=space-path:spaces-store =app-id:store]
    ^-  (quip card _state)
    =/  apps                (~(got by space-apps.state) path)
    =/  app                 (~(got by apps) app-id)
    =.  tags.app            (~(del in tags.app) %suite)
    =/  apps                (~(put by apps) app-id app)
    =.  space-apps.state    (~(put by space-apps.state) path apps)
    =/  paths  [/updates /bazaar/(scot %p ship.path)/(scot %tas space.path) ~]
    (bazaar:send-reaction [%suite-remove path app-id] paths)
  --
::
++  apps
  |%
  ++  initial
    ^-  space-apps-full:store
    :: scry for now. if performance issues, move back to on-init maybe
    =/  =charge-update:docket  .^(charge-update:docket %gx /(scot %p our.bowl)/docket/(scot %da now.bowl)/charges/noun)
    ?>  ?=([%initial *] charge-update)
    =/  charges=(map desk charge:docket)  initial.charge-update
    %-  ~(rep by space-apps:state)
    |:  [[=space-path:spaces-store =app-index:store] acc=`space-apps-full:store`~]
    =/  apps  (view charges space-path ~)
    ?~  apps  acc
    (~(put by acc) space-path u.apps)
  ::
  ++  space-initial
    |=  =space-path:spaces-store
    ^-  app-views:store
    =/  apps  (~(got by space-apps.state) space-path)
    %-  ~(rep by apps)
    |:  [[=app-id:store =app-entry:store] acc=`app-views:store`~]
    =/  app  (~(get by app-catalog.state) app-id)
    ?~  app  acc
    =|  app-view=app-view:store
    =.  app-entry.app-view  app-entry
    =.  app.app-view        u.app
    (~(put by acc) app-id app-view)
  ::
  ++  view
    |=  [charges=(map desk charge:docket) path=space-path:spaces-store tag=(unit tag:store)]
    ^-  (unit app-views:store)
    ?.  (~(has by space-apps.state) path)  ~
    =/  apps  (~(got by space-apps.state) path)
    =/  result=app-views:store
    %-  ~(rep by apps)
    |:  [[=app-id:store =app-entry:store] acc=`app-views:store`~]
      :: skip if filter is neither %all nor the app tagged with tag
      ?.  ?|  =(tag ~)
              ?&  !=(tag ~)
                  (~(has in tags.app-entry) (need tag))
              ==
          ==  acc
      :: =/  charge  (~(get by charges.state) app-id)
      =/  charge  (~(get by charges) app-id)
      =|  app-view=app-view:store
      =.  app-entry.app-view       app-entry
      ?~  charge
        =.  app.app-view           [%missing ~]
        (~(put by acc) app-id app-view)
      =.  tags.app-entry.app-view  (~(put in tags.app-entry.app-view) %installed)
      =.  app.app-view             [%urbit docket.u.charge]
      (~(put by acc) app-id app-view)
    ?~(result ~ (some result))
  ::
  ++  catalog
    |=  [charges=(map desk charge:docket)]
    ^-  app-catalog:store
    %-  ~(rep by charges)
    |:  [[=desk =charge:docket] acc=`app-catalog:store`~]
    (~(put by acc) desk [%urbit docket.charge])
  ::
  ++  index
    |=  [charges=(map desk charge:docket)]
    ^-  app-index:store
    %-  ~(rep by charges)
    |=  [[=desk =charge:docket] acc=app-index:store]
      =|  app=app-entry:store
      =.  id.app    desk
      =.  ship.app  our.bowl
      =.  tags.app  (~(put in tags.app) %installed)
      =.  ranks.app  [0 0 0 0]
      ~&  >>  "{<app>}"
      (~(put by acc) desk app)
  --
::  bazaar reactions
++  bazaar-reaction
  |=  [rct=reaction:store]
  ^-  (quip card _state)
  |^
  ?-  -.rct
    %initial          (on-initial +.rct)
    %space-apps       (on-space-apps +.rct)
    %add-tag          (on-add-tag +.rct)
    %remove-tag       (on-rem-tag +.rct)
    %suite-add        (on-suite-add +.rct)
    %suite-remove     (on-suite-rem +.rct)
    %app-installed    `state
    %app-uninstalled  `state
  ==
  ::
  ++  on-initial
    |=  [=space-apps-full:store]
    ^-  (quip card _state)
    `state
  ::
  ::  this reaction comes in as a result of accepting an invitation
  ::   to a space and then subscribing to the space-path
  ++  on-space-apps
    |=  [=space-path:spaces-store =app-views:store]
    ^-  (quip card _state)
    ~&  >  "{<dap.bowl>}: bazaar-reaction [on-space-apps] => {<[space-path app-views our.bowl src.bowl]>}"
    :: only if this reaction originated remotely should we attempt to process it
    ?:  =(our.bowl src.bowl)  `state
    =/  result=[=app-catalog:store =app-index:store]
    %-  ~(rep by app-views)
    |=  [[=app-id:store =app-view:store] acc=[=app-catalog:store =app-index:store]]
    =.  app-catalog.acc     (~(put by app-catalog.acc) app-id app.app-view)
    =.  app-index.acc       (~(put by app-index.acc) app-id app-entry.app-view)
    acc
    =.  space-apps.state    (~(put by space-apps.state) space-path app-index.result)
    =.  app-catalog.state   (~(gas by app-catalog.state) ~(tap by app-catalog.result))
    :: :_  state(app-catalog (~(gas by app-catalog.state) ~(tap by app-catalog.result)))
    :: notify the UI of that we've accepted an invite to a new space and there
    ::   are apps available in this new space
    (bazaar:send-reaction:core [%space-apps space-path app-views] [/updates ~])
  ::
  ++  on-add-tag
    |=  [path=space-path:spaces-store =app-id:store =tag:store] :: rank=(unit @ud)]
    ^-  (quip card _state)
    ~&  >  "{<dap.bowl>}: bazaar-reaction [on-add-tag] => {<[path app-id tag]>}"
    `state
  ::
  ++  on-rem-tag
    |=  [path=space-path:spaces-store =app-id:store =tag:store] :: rank=(unit @ud)]
    ^-  (quip card _state)
    ~&  >  "{<dap.bowl>}: bazaar-reaction [on-rem-tag] => {<[path app-id tag]>}"
    `state
  ::
  ++  on-suite-add
    |=  [path=space-path:spaces-store =app-id:store rank=@ud]
    ^-  (quip card _state)
    ~&  >  "{<dap.bowl>}: bazaar-reaction [on-suite-add] => {<[path app-id rank]>}"
    :: only if this reaction originated remotely should we attempt to process it
    ?:  =(our.bowl src.bowl)  `state
    =/  result=[=space-apps:store rank=@ud]  (add:suite path app-id (some rank))
    =.  space-apps.state  space-apps.result
    (bazaar:send-reaction:core [%suite-add path app-id rank.result] [/updates ~])
  ::
  ++  on-suite-rem
    |=  [path=space-path:spaces-store =app-id:store]
    ^-  (quip card _state)
    ~&  >  "{<dap.bowl>}: bazaar-reaction [on-suite-rem] => {<[path app-id]>}"
    `state
  --
::
++  suite
  |%
  ++  add
    |=  [path=space-path:spaces-store =app-id:store rank=(unit @ud)]
    ^-  [=space-apps:store @ud]
    ~&  >>  "{<dap.bowl>}: add:suite => {<[path app-id rank]>}"
    =/  apps                      (~(got by space-apps.state) path)
    ?:  (~(has by apps) app-id)   !!
    =|  app=app-entry:store
    =.  id.app                    app-id
    =.  ship.app                  our.bowl
    =.  tags.app                  (~(put in tags.app) %suite)
    =/  rank                      ?~(rank (lent ~(val by apps)) u.rank)
    =.  suite.ranks.app           rank
    :: =.  dist.app                  [%urbit docket.charge]
    =/  apps                      (~(put by apps) app-id app)
    [(~(put by space-apps.state) path apps) rank]
  --
::
++  treaty-update
  |=  [upd=update:treaty:treaty]
  ^-  (quip card _state)
  |^
  ?-  -.upd
    %ini       (on-ini +.upd)
    %add       (on-add +.upd)
    %del       (on-del +.upd)
  ==
  ::
  ++  on-ini
    |=  [init=(map [=ship =desk] =treaty:treaty)]
    ^-  (quip card _state)
    ~&  >>  "{<dap.bowl>}: treaty-update [on-initial] => {<init>}"
    `state
  ::
  ++  on-add
    |=  [=treaty:treaty]
    ^-  (quip card _state)
    ~&  >>  "{<dap.bowl>}: treaty-update [on-add] => {<[treaty]>}"
    `state
  ::
  ++  on-del
    |=  [=ship =desk]
    ^-  (quip card _state)
    ~&  >>  "{<dap.bowl>}: treaty-update [on-del] => {<[ship desk]>}"
    `state
  --
::
++  ally-update
  |=  [upd=update:ally:treaty]
  ^-  (quip card _state)
  |^
  ?-  -.upd
    %ini       (on-ini +.upd)
    %new       (on-new +.upd)
    %add       (on-add +.upd)
    %del       (on-del +.upd)
  ==
  ::
  ++  on-ini
    |=  [init=(map ship alliance:treaty)]
    ^-  (quip card _state)
    ~&  >>  "{<dap.bowl>}: ally-update [on-initial] => {<init>}"
    `state
  ::
  ++  on-new
    |=  [=ship =alliance:treaty]
    ^-  (quip card _state)
    ~&  >>  "{<dap.bowl>}: ally-update [on-new] => {<[ship alliance]>}"
    `state
  ::
  ++  on-add
    |=  [=ship]
    ^-  (quip card _state)
    ~&  >>  "{<dap.bowl>}: ally-update [on-add] => {<[ship]>}"
    `state
  ::
  ++  on-del
    |=  [=ship]
    ^-  (quip card _state)
    ~&  >>  "{<dap.bowl>}: ally-update [on-del] => {<[ship]>}"
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
    :: only if done (head is %glob). see garden/sur/docket.hoon for more details
    ?+  -.chad.charge  `state
      %glob  (bazaar:send-reaction:core [%app-installed desk docket.charge] [/updates ~])
    ==
  ::
  ++  rem
    |=  [=desk]
    ^-  (quip card _state)
    ~&  >>  "{<dap.bowl>}: charge-update [del-charge] received. {<desk>}"
    (bazaar:send-reaction:core [%app-uninstalled desk] [/updates ~])
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
    %new-space      (on-new-space +.rct)
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
    =.  space-apps.state  (~(put by space-apps.state) path.space ~)
    :: =.  membership.state  (~(put by membership.state) path.space members)
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
    `state(space-apps (~(del by space-apps.state) path)) :: , membership (~(del by membership.state) path))
  ::
  ++  on-new-space
    |=  [path=space-path:spaces-store space=space:spaces-store]
    ^-  (quip card _state)
    :: ?:  ?|  =(our.bowl ship.path)
    ::         =(ship ship.path)
    ::     ==  `state
    ::  no need to subscribe to our own ship's bazaar. we're already getting all updates
    ?:  =(our.bowl ship.path)  `state
    %-  (slog leaf+"{<dap.bowl>}: on-space-initial:spaces-reaction => subscribing to bazaar @ {<path>}..." ~)
    :_  state
    :~  [%pass /bazaar %agent [ship.path %bazaar] %watch /bazaar/(scot %p ship.path)/(scot %tas space.path)]
    ==
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
    :: =/  members  (~(get by membership.state) path)
    :: ?~  members  %.n
    :: =/  member  (~(get by u.members) ship)
    :: ?~  member  %.n
    =/  vw  .^(view:passports-store %gx /(scot %p ship.path)/passports/(scot %da now.bowl)/(scot %p ship.path)/(scot %tas space.path)/members/(scot %p ship)/noun)
    ?>  ?=([%member *] vw)
    ?:(=(status.passport.vw 'joined') %.y %.n)
  --
::
++  is-host
  |=  [=ship]
  =(our.bowl ship)
--