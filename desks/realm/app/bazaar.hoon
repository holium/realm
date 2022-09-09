::
::  %bazaar [realm]:
::
::  A store for metadata on app dockets per Realm space.
::
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
        =app-catalog:store
        space-apps=space-apps-lite:store
        installations=(map ship desk)
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
  =/  apps=app-index-lite:store           (index:apps:core initial.charge-update)
  %-  (slog leaf+"{<[apps]>}" ~)
  =/  our-space                           [our.bowl 'our']
  :: ~&  >  our-space
  :: build slimmed down space specific app (metadata) from docket charges (installed apps)
  :: =/  index      (~(put by space-apps.state) our-space [apps *sorts:store])
  :: build robust app catalog from docket charges (installed apps)
  =/  catalog     (catalog:apps:core initial.charge-update)

  :: also setup some native apps that are not part of the docket

  ::  configure browser
  =|  =app-lite:store
  =.  id.app-lite                         %os-browser
  =.  ranks.sieve.app-lite                [0 0 0]
  =.  tags.sieve.app-lite                 (~(put in tags.sieve.app-lite) %installed)
  =/  apps                                (~(put by apps) id.app-lite app-lite)

  =|  =native-app:store
  =.  title.native-app                    'Relic Browser'
  =.  color.native-app                    '#92D4F9'
  =.  icon.native-app                     'AppIconCompass'
  =/  catalog                             (~(put by catalog) id.app-lite [%native native-app])

  ::  configure settings
  =|  =app-lite:store
  =.  id.app-lite                         %os-settings
  =.  ranks.sieve.app-lite                [0 0 0]
  =.  tags.sieve.app-lite                 (~(put in tags.sieve.app-lite) %installed)
  =/  apps                                (~(put by apps) id.app-lite app-lite)

  =|  =native-app:store
  =.  title.native-app                    'Settings'
  =.  color.native-app                    '#ACBCCB'
  =.  icon.native-app                     'AppIconSettings'
  =/  catalog                             (~(put by catalog) id.app-lite [%native native-app])

  =.  space-apps.state                    (~(put by space-apps.state) our-space [apps *sorts:store])
  =.  app-catalog.state                   catalog

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
      `state
    ::
    [%updates ~]
      ::  only host should get all updates
      ?>  (is-host:core src.bowl)
      =/  apps  initial:apps:core
      :: ~&  >>  "{<dap.bowl>}: sending %initial {<[%initial apps]>}"
      :: (bazaar:send-reaction:core [%initial space-apps.state] [/updates ~])
      (bazaar:send-reaction:core [%initial apps] [/updates ~] ~)
    ::
    [%bazaar @ @ ~]
      :: The space level watch subscription
      =/  host        `@p`(slav %p i.t.path)
      =/  space-pth   `@t`i.t.t.path
      :: https://developers.urbit.org/guides/core/app-school/8-subscriptions#incoming-subscriptions
      ::  recommends crash on permission check or other failure
      ?>  (check-member:security:core [host space-pth] src.bowl)
      =/  pth         [host space-pth]
      =/  paths       [/bazaar/(scot %p our.bowl)/(scot %tas space-pth) ~]
      =/  apps        (space-initial:apps:core pth)
      (bazaar:send-reaction:core [%space-apps pth apps] paths ~)
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
      =/  which  `@tas`i.t.t.t.t.path
      ?+  which  ``json+!>(~)
        ::
        %all
        =/  apps  (view:apps:core [ship space-pth] ~)
        ?~  apps  ``json+!>([%a ~]) :: empty array
        ``bazaar-view+!>([%apps u.apps])
        ::
        %pinned
        =/  apps  (view:apps:core [ship space-pth] (some %pinned))
        ?~  apps  ``json+!>([%a ~]) :: empty array
        ``bazaar-view+!>([%apps u.apps])
        ::
        %recommended
        =/  apps  (view:apps:core [ship space-pth] (some %recommended))
        ?~  apps  ``json+!>([%a ~]) :: empty array
        ``bazaar-view+!>([%apps u.apps])
        ::
        %suite
        =/  apps  (view:apps:core [ship space-pth] (some %suite))
        ?~  apps  ``json+!>([%a ~]) :: empty array
        ``bazaar-view+!>([%apps u.apps])
        ::
        %installed
        =/  apps  (view:apps:core [ship space-pth] (some %installed))
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
          :~  [%pass /docket %agent [our.bowl %docket] %watch /charges]
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
          :~  [%pass /treaties %agent [our.bowl %treaty] %watch /treaties]
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
          :~  [%pass /allies %agent [our.bowl %treaty] %watch /allies]
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
      %pin               (add-pin +.action)
      %unpin             (rem-pin +.action)
      %set-pin-order     (set-pin-order +.action)
      %recommend         (add-rec +.action)
      %unrecommend       (rem-rec +.action)
      %suite-add         (add-ste +.action)
      %suite-remove      (rem-ste +.action)
      %install-app       (install-app +.action)
    ==
  ::
  ++  add-pin
    |=  [path=space-path:spaces-store =app-id:store rank=(unit @ud)]
    ^-  (quip card _state)
    =/  app            (~(got by app-catalog.state) app-id)
    =/  apps            (~(got by space-apps.state) path)
    =/  app-lite             (~(got by index.apps) app-id)
    =.  tags.sieve.app-lite     (~(put in tags.sieve.app-lite) %pinned)
    =/  rank  ?~(rank (count-apps index.apps %pinned) u.rank)
    =.  pinned.ranks.sieve.app-lite   rank
    =.  index.apps  (pin index.apps app-lite)
    =.  pinned.sorts.apps     (sort-apps (extract-apps index.apps %pinned) %pinned %asc)
    =/  paths  [/updates /bazaar/(scot %p ship.path)/(scot %tas space.path) ~]
    =.  space-apps.state  (~(put by space-apps.state) path apps)
    (bazaar:send-reaction [%pin path [app-id sieve.app-lite app] pinned.sorts.apps] paths ~)
  ::
  ++  rem-pin
    |=  [path=space-path:spaces-store =app-id:store]
    ^-  (quip card _state)
    =/  app            (~(got by app-catalog.state) app-id)
    =/  apps  (~(got by space-apps.state) path)
    =/  app-lite   (~(got by index.apps) app-id)
    =.  tags.sieve.app-lite  (~(del in tags.sieve.app-lite) %pinned)
    =.  index.apps  (unpin index.apps app-lite)
    =.  pinned.sorts.apps     (sort-apps (extract-apps index.apps %pinned) %pinned %asc)
    =.  space-apps.state  (~(put by space-apps.state) path apps)
    =/  paths  [/updates /bazaar/(scot %p ship.path)/(scot %tas space.path) ~]
    (bazaar:send-reaction [%unpin path [app-id sieve.app-lite app] pinned.sorts.apps] paths ~)
  ::
  ++  set-pin-order
    |=  [path=space-path:spaces-store order=(list app-id:store)]
    ^-  (quip card _state)
    =/  apps            (~(got by space-apps.state) path)
    =/  updated-apps
    %-  roll
    :-  order
    |=  [=app-id:store acc=[index=(map =app-id:store =app-lite:store) rank=@ud]]
    =/  app  (~(get by index.apps) app-id)
    ?~  app  acc
    =.  pinned.ranks.sieve.u.app   rank.acc
    [(~(put by index.acc) app-id u.app) (add rank.acc 1)]
    =.  index.apps          index.updated-apps
    =.  pinned.sorts.apps   order
    =.  space-apps.state  (~(put by space-apps.state) path apps)
    =/  paths  [/updates /bazaar/(scot %p ship.path)/(scot %tas space.path) ~]
    (bazaar:send-reaction [%set-pin-order path order] paths ~)
  ::
  ::  $add-rec: note that recommending an app potentially changes the order
  ::    of the app in the recommendations list; therefore the new order (ord)
  ::    will be included in the reaction to account for changes in position
  ++  add-rec
    |=  [path=space-path:spaces-store =app-id:store]
    ^-  (quip card _state)
    =/  app            (~(got by app-catalog.state) app-id)
    =/  apps                        (~(got by space-apps.state) path)
    =/  app-lite                         (~(got by index.apps) app-id)
    =.  tags.sieve.app-lite                (~(put in tags.sieve.app-lite) %recommended)
    =.  recommended.ranks.sieve.app-lite   (add recommended.ranks.sieve.app-lite 1)
    =.  index.apps                        (~(put by index.apps) app-id app-lite)
    =.  recommended.sorts.apps     (sort-apps (extract-apps index.apps %recommended) %recommended %desc)
    =.  space-apps.state  (~(put by space-apps.state) path apps)
    =/  paths  [/updates /bazaar/(scot %p ship.path)/(scot %tas space.path) ~]
    (bazaar:send-reaction [%recommend path [app-id sieve.app-lite app] recommended.sorts.apps] paths ~)
  ::
  ++  rem-rec
    |=  [path=space-path:spaces-store =app-id:store]
    ^-  (quip card _state)
    =/  app            (~(got by app-catalog.state) app-id)
    =/  apps  (~(got by space-apps.state) path)
    =/  app-lite   (~(got by index.apps) app-id)
    =.  tags.sieve.app-lite  (~(del in tags.sieve.app-lite) %recommended)
    =.  recommended.ranks.sieve.app-lite  (sub recommended.ranks.sieve.app-lite 1)
    =.  index.apps  (~(put by index.apps) app-id app-lite)
    =.  recommended.sorts.apps     (sort-apps (extract-apps index.apps %recommended) %recommended %desc)
    =.  space-apps.state  (~(put by space-apps.state) path apps)
    =/  paths  [/updates /bazaar/(scot %p ship.path)/(scot %tas space.path) ~]
  (bazaar:send-reaction [%unrecommend path [app-id sieve.app-lite app] recommended.sorts.apps] paths ~)
  ::
  ++  add-ste
    |=  [path=space-path:spaces-store =app-id:store rank=@ud]
    ^-  (quip card _state)
    ~&  >>  "{<dap.bowl>}: suite-add => {<[path app-id rank]>}"
    =/  paths  [/updates /bazaar/(scot %p ship.path)/(scot %tas space.path) ~]
    ~&  >>  "{<dap.bowl>}: sending reaction {<[path app-id rank]>}"
    =/  app            (~(got by app-catalog.state) app-id)
    =/  apps                    (~(got by space-apps.state) path)
    =.  index.apps                    (remove-at-pos index.apps rank)
    =|  sieve=sieve:store
    =.  tags.sieve               (~(put in tags.sieve) %suite)
    =.  tags.sieve               (~(put in tags.sieve) %installed)
    =.  suite.ranks.sieve        rank
    =.  index.apps                    (~(put by index.apps) app-id [app-id sieve])
    =.  suite.sorts.apps     (sort-apps (extract-apps index.apps %suite) %suite %asc)
    =.  space-apps.state              (~(put by space-apps.state) path apps)
    ~&  >>  "{<dap.bowl>}: suite-add {<[path [app-id sieve app]]>}"
    (bazaar:send-reaction [%suite-add path [app-id sieve app] suite.sorts.apps] paths ~)
  ::
  ++  rem-ste
    |=  [path=space-path:spaces-store =app-id:store]
    ^-  (quip card _state)
    =/  app            (~(got by app-catalog.state) app-id)
    =/  apps                (~(got by space-apps.state) path)
    =/  app-lite                 (~(got by index.apps) app-id)
    =.  tags.sieve.app-lite        (~(del in tags.sieve.app-lite) %suite)
    =.  index.apps                (~(put by index.apps) app-id app-lite)
    =.  suite.sorts.apps     (sort-apps (extract-apps index.apps %suite) %suite %asc)
    =.  space-apps.state    (~(put by space-apps.state) path apps)
    =/  paths  [/updates /bazaar/(scot %p ship.path)/(scot %tas space.path) ~]
    (bazaar:send-reaction [%suite-remove path [app-id sieve.app-lite app] suite.sorts.apps] paths ~)
  ::
  ++  install-app
    |=  [=ship =desk]
    ^-  (quip card _state)
    ~&  >  "{<dap.bowl>}: install-app {<[ship desk]>}"
    =/  allies=update:ally:treaty  .^(update:ally:treaty %gx /(scot %p our.bowl)/treaty/(scot %da now.bowl)/allies/noun)
    ~&  >  "{<dap.bowl>}: install-app {<[allies]>}"
    ::  is the ship already an ally? if not, we'll have to add them as an ally
    ::   then once alliance is completed, trigger docket to install
    ?>  ?=(%ini -.allies)
    ?.  (~(has by init.allies) ship)
      %-  (slog leaf+"{<ship>} not an ally. adding {<ship>} as ally..." ~)
      :: queue this installation request, so that once alliance is complete,
      ::   we can automatically kick off the install
      :: =/  alliance  (silt [[ship desk] ~])
      =.  installations.state  (~(put by installations.state) ship desk)
      :_  state
      ::  poke treaty to add ally
      [%pass / %agent [our.bowl %treaty] %poke ally-update-0+!>([%add ship])]~
    :_  state
    :: ship is already an ally. trigger app install in docket
    [%pass / %agent [our.bowl %docket] %poke docket-install+!>([ship desk])]~
  ::
  ++  extract-apps
    |=  [=app-index-lite:store =tag:store]
    ^-  (list [=app-id:store =app-lite:store])
    %-  skim
    :-  ~(tap by app-index-lite)
    |=  [=app-id:store =app-lite:store]
    ?:  (~(has in tags.sieve.app-lite) tag)  %.y  %.n
  ::
  ++  sort-apps
    |=  [apps=(list [=app-id:store =app-lite:store]) tag=?(%pinned %recommended %suite) dir=?(%asc %desc)]
    ^-  (list app-id:store)
    %-  turn
      :-
      %-  sort
      :-  apps
      |=  [a=[=app-id:store =app-lite:store] b=[=app-id:store =app-lite:store]]
      ?-  tag
        %pinned
          ?:  =(dir %asc)
            (lth pinned.ranks.sieve.app-lite.a pinned.ranks.sieve.app-lite.b)
          (gth pinned.ranks.sieve.app-lite.a pinned.ranks.sieve.app-lite.b)
        ::s
        %recommended
          ?:  =(dir %asc)
            (lth recommended.ranks.sieve.app-lite.a recommended.ranks.sieve.app-lite.b)
          (gth recommended.ranks.sieve.app-lite.a recommended.ranks.sieve.app-lite.b)
        ::
        %suite
          ?:  =(dir %asc)
            (lth suite.ranks.sieve.app-lite.a suite.ranks.sieve.app-lite.b)
          (gth suite.ranks.sieve.app-lite.a suite.ranks.sieve.app-lite.b)

      ==
    |=  [=app-id:store =app-lite:store]
    app-id
  ::
  ++  remove-at-pos
    |=  [apps=app-index-lite:store rank=@ud]
    :: ^-  app-index-lite:store
    %-  ~(gas by `app-index-lite:store`~)
    ^-  (list [=app-id:store =app-lite:store])
    %-  skim
    :-  ~(tap by apps)
    |=  [[id=app-id:store [=app-id:store =sieve:store]]]
    ::  if the app is part if this space's suite and at the same position
    ::    as the one being added to the suite, remove
    ?:  ?&  (~(has in tags.sieve) %suite)
            =(suite.ranks.sieve rank)
        ==  %.n  %.y
  ::  count apps in the index that are tagged with tag
  ++  count-apps
    |=  [apps=app-index-lite:store =tag:store]
    ^-  @ud
    %-  ~(rep by apps)
    |=  [[=app-id:store =app-lite:store] acc=@ud]
    ?:  (~(has in tags.sieve.app-lite) tag)  (add acc 1)  acc
  ::
  ++  pin
    |=  [apps=app-index-lite:store app=app-lite:store]
    ^-  app-index-lite:store
    %-  ~(rep by apps)
    |:  [[=app-id:store =app-lite:store] acc=`app-index-lite:store`~]
      ?:  =(app-id id.app)  (~(put by acc) app-id app)
      =/  updated-app
      ?:  (gte pinned.ranks.sieve.app-lite pinned.ranks.sieve.app)
        =.  pinned.ranks.sieve.app-lite  (add pinned.ranks.sieve.app-lite 1)
        app-lite
      app-lite
      %-  (slog leaf+"adding {<[app-id updated-app]>} to apps..." ~)
      (~(put by acc) app-id updated-app)
  ::
  ++  unpin
    |=  [apps=app-index-lite:store app=app-lite:store]
    ^-  app-index-lite:store
    %-  ~(rep by apps)
    |:  [[=app-id:store =app-lite:store] acc=`app-index-lite:store`~]
      ::  skip the item we are unpinning
      ?:  =(id.app app-id)  (~(put by acc) id.app app)
      =/  updated-app
      ?:  (gth pinned.ranks.sieve.app-lite pinned.ranks.sieve.app)
        =.  pinned.ranks.sieve.app-lite  (sub pinned.ranks.sieve.app-lite 1)
        app-lite
      app-lite
      (~(put by acc) app-id updated-app)
  --
::
++  apps
  |%
  ++  initial
    ^-  space-apps-full:store
    :: scry for now. if performance issues, move back to on-init maybe
    :: =/  =charge-update:docket  .^(charge-update:docket %gx /(scot %p our.bowl)/docket/(scot %da now.bowl)/charges/noun)
    :: ?>  ?=([%initial *] charge-update)
    :: =/  charges=(map desk charge:docket)  initial.charge-update
    %-  ~(rep by space-apps:state)
    |:  [[=space-path:spaces-store [=app-index-lite:store =sorts:store]] acc=`space-apps-full:store`~]
    =/  apps  (view space-path ~)
    ?~  apps  acc
    (~(put by acc) space-path [u.apps sorts])
  ::
  ++  space-initial
    |=  =space-path:spaces-store
    ^-  app-index-full:store
    =/  apps  (~(got by space-apps.state) space-path)
    %-  ~(rep by index.apps)
    |:  [[=app-id:store =app-lite:store] acc=`app-index-full:store`~]
    =/  app  (~(got by app-catalog.state) app-id)
    =|  app-full=app-full:store
    =.  id.app-full         app-id
    =.  sieve.app-full      sieve.app-lite
    =.  pkg.app-full        app
    (~(put by acc) app-id app-full)
  ::
  ++  view
    |=  [path=space-path:spaces-store tag=(unit tag:store)]
    ^-  (unit app-index-full:store)
    ?.  (~(has by space-apps.state) path)  ~
    =/  apps  (~(got by space-apps.state) path)
    :: ~&  >>>  "{<dap.bowl>}: {<app-catalog:state>}"
    =/  result=app-index-full:store
    %-  ~(rep by index.apps)
    |:  [[=app-id:store =app-lite:store] acc=`app-index-full:store`~]
      :: skip if filter is neither %all nor the app tagged with tag
      ?.  ?|  =(tag ~)
              ?&  !=(tag ~)
                  (~(has in tags.sieve.app-lite) (need tag))
              ==
          ==  acc
      :: =/  charge  (~(get by charges.state) app-id)

      =/  app  (~(get by app-catalog.state) app-id)
      =|  app-full=app-full:store
      =.  id.app-full        app-id
      =.  sieve.app-full     sieve.app-lite
      ?~  app
        ~&  >>>  "{<dap.bowl>}: app {<app-id>} not found."
        =.  pkg.app-full     [%missing ~]
        (~(put by acc) app-id app-full)
      =.  tags.sieve.app-full  (~(put in tags.sieve.app-full) %installed)
      =.  pkg.app-full      u.app
      (~(put by acc) app-id app-full)
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
    ^-  app-index-lite:store
    %-  ~(rep by charges)
    |=  [[=desk =charge:docket] acc=app-index-lite:store]
      =|  app=app-lite:store
      =.  id.app          desk
      :: =.  ship.app  our.bowl
      =.  tags.sieve.app    (~(put in tags.sieve.app) %installed)
      =.  ranks.sieve.app   [0 0 0]
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
    %pin              (on-pin +.rct)
    %unpin            (on-unpin +.rct)
    %set-pin-order    (on-set-pin-order +.rct)
    %recommend        (on-rec +.rct)
    %unrecommend      (on-unrec +.rct)
    %suite-add        (on-suite-add +.rct)
    %suite-remove     (on-suite-rem +.rct)
    %set-suite-order  (on-set-suite-order +.rct)
    %app-installed    `state
    %app-uninstalled  `state
    %treaty-added     `state
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
    |=  [=space-path:spaces-store =app-index-full:store]
    ^-  (quip card _state)
    ::  get all of 'our' installed apps on this ship, and compare it to the list of
    ::   space apps to determine the installation status of the app
    =/  =charge-update:docket  .^(charge-update:docket %gx /(scot %p our.bowl)/docket/(scot %da now.bowl)/charges/noun)
    ?>  ?=([%initial *] charge-update)
    :: only if this reaction originated remotely should we attempt to process it
    ?:  =(our.bowl src.bowl)  `state
    =/  result=[=app-catalog:store =app-index-lite:store]
    %-  ~(rep by app-index-full)
    |=  [[=app-id:store =app-full:store] acc=[=app-catalog:store =app-index-lite:store]]
    ::  is this app installed?
    =/  updated-app-full
      ?:  (~(has by initial.charge-update) app-id)
        =.  tags.sieve.app-full  (~(put in tags.sieve.app-full) %installed)
        app-full
      =.  tags.sieve.app-full  (~(del in tags.sieve.app-full) %installed)
      app-full
    =.  app-catalog.acc      (~(put by app-catalog.acc) app-id pkg.updated-app-full)
    =.  app-index-lite.acc   (~(put by app-index-lite.acc) app-id [app-id sieve.updated-app-full])
    acc
    =.  space-apps.state    (~(put by space-apps.state) space-path [app-index-lite.result *sorts:store])
    =.  app-catalog.state   (~(gas by app-catalog.state) ~(tap by app-catalog.result))
    :: :_  state(app-catalog (~(gas by app-catalog.state) ~(tap by app-catalog.result)))
    :: notify the UI of that we've accepted an invite to a new space and there
    ::   are apps available in this new space
    (bazaar:send-reaction:core [%space-apps space-path app-index-full] [/updates ~] ~)
  ::
  ++  on-pin
    |=  [path=space-path:spaces-store =app-full:store ord=(list app-id:store)]
    ^-  (quip card _state)
    ~&  >  "{<dap.bowl>}: bazaar-reaction [pin] => {<[path app-full ord]>}"
    `state
  ::
  ++  on-unpin
    |=  [path=space-path:spaces-store =app-full:store ord=(list app-id:store)]
    ^-  (quip card _state)
    ~&  >  "{<dap.bowl>}: bazaar-reaction [unpin] => {<[path app-full ord]>}"
    `state
  ::
  ++  on-set-pin-order
    |=  [path=space-path:spaces-store ord=(list app-id:store)]
    ^-  (quip card _state)
    ~&  >  "{<dap.bowl>}: bazaar-reaction [set-pin-order] => {<[path ord]>}"
    `state
  ::
  ++  on-rec
    |=  [path=space-path:spaces-store =app-full:store ord=(list app-id:store)]
    ^-  (quip card _state)
    ~&  >  "{<dap.bowl>}: bazaar-reaction [recommended] => {<[path app-full]>}"
    `state
  ::
  ++  on-unrec
    |=  [path=space-path:spaces-store =app-full:store ord=(list app-id:store)]
    ^-  (quip card _state)
    ~&  >  "{<dap.bowl>}: bazaar-reaction [unrecommended] => {<[path app-full]>}"
    `state
  ::
  ++  on-suite-add
    |=  [path=space-path:spaces-store =app-full:store ord=(list app-id:store)]
    ^-  (quip card _state)
    ~&  >  "{<dap.bowl>}: bazaar-reaction [on-suite-add] => {<[path app-full]>}"
    :: only if this reaction originated remotely should we attempt to process it
    ?:  =(our.bowl src.bowl)  `state
    `state
  ::
  ++  on-suite-rem
    |=  [path=space-path:spaces-store =app-full:store ord=(list app-id:store)]
    ^-  (quip card _state)
    ~&  >  "{<dap.bowl>}: bazaar-reaction [on-suite-rem] => {<[path app-full]>}"
    `state
  ::
  ++  on-set-suite-order
    |=  [path=space-path:spaces-store ord=(list app-id:store)]
    ^-  (quip card _state)
    ~&  >  "{<dap.bowl>}: bazaar-reaction [set-suite-order] => {<[path ord]>}"
    `state
  --
::
:: ++  suite
::   |%
::   ++  add
::     |=  [path=space-path:spaces-store =app:store rank=(unit @ud)]
::     ^-  @ud
::     ::  check to see if we have this new app in this ship's catalog
::     ::   if not add it
::     =/  catalog-entry  (~(get by app-catalog.state) id.app)
::     =/  updates=[=app-catalog:store installed=?]
::     ?~  catalog-entry
::       [(~(put by app-catalog.state) id.app app) %.n]
::     [app-catalog.state %.y]
::     =/  space-apps                      (~(got by space-apps.state) path)
::     ?:  (~(has by space-apps) id.app)   !!
::     =|  app-lite=app-lite:store
::     =.  id.app-lite                    id.app-lite
::     :: =.  ship.app-entry                  ship.path
::     =.  tags.app-lite                  (~(put in tags.app-lite) %suite)
::     =.  tags.app-lite  ?:(=(installed.updates %.y) (~(put in tags.app) %installed) tags.app)
::     =/  rank                            ?~(rank (lent ~(val by apps)) u.rank)
::     =.  suite.ranks.app-entry           rank
::     =/  space-apps                      (~(put by space-apps) id.app-entry app-entry)
::     ::  update state
::     =.  space-apps.state                (~(put by space-apps.state) path apps)
::     =.  app-catalog.state               app.catalog.updates
::     rank
::   --
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
    :: %glob  (bazaar:send-reaction:core [%initial-treaties desk [%urbit docket.charge]] [/updates ~])
    `state
  ::
  ++  on-add
    |=  [=treaty:treaty]
    ^-  (quip card _state)
    ~&  >>  "{<dap.bowl>}: treaty-update [on-add] => {<[treaty]>}"
    ::  do we have a pending installation request for this ship/desk?
    =/  installation  (~(get by installations.state) ship.treaty)
    ?~  installation  `state
    ~&  >>  "{<dap.bowl>}: [on-new] => testing {<u.installation>} = {<desk.treaty>}..."
    ?.  =(u.installation desk.treaty)  `state
    ~&  >>  "{<dap.bowl>}: [on-new] => triggering install {<[ship.treaty desk.treaty]>}..."
    =/  install-poke  [%pass /docket-install %agent [our.bowl %docket] %poke docket-install+!>([ship.treaty desk.treaty])]~
    ::  trigger docker install
    :: :_  state
    (bazaar:send-reaction:core [%treaty-added [ship.treaty desk.treaty] docket.treaty] [/updates ~] install-poke)
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
    :: (bazaar:send-reaction:core [%new-ally-added [ship.treaty desk.treaty] [%urbit docket.charge]] [/updates ~])
    `state
  ::
  ++  on-add
    |=  [=ship]
    ^-  (quip card _state)
    :: =/  =update:treaty:treaty  .^(update:treaty:treaty %gx /(scot %p our.bowl)/treaty/(scot %da now.bowl)/treaties/(scot %p ship)/noun)
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
      %glob
        ::  once fully installed, remove the installation entry from state
        ?.  ?=(%glob -.href.docket.charge)
         (bazaar:send-reaction:core [%app-installed desk [%urbit docket.charge]] [/updates ~] ~)
        =/  loc  location.glob-reference.href.docket.charge
        ?.  ?=(%ames -.loc)
          (bazaar:send-reaction:core [%app-installed desk [%urbit docket.charge]] [/updates ~] ~)
        =/  app-ship      ship.loc
        =/  installation  (~(get by installations.state) app-ship)
        ?~  installation
          (bazaar:send-reaction:core [%app-installed desk [%urbit docket.charge]] [/updates ~] ~)
        =.  installations.state  (~(del by installations.state) app-ship)
        (bazaar:send-reaction:core [%app-installed desk [%urbit docket.charge]] [/updates ~] ~)
    ==
  ::
  ++  rem
    |=  [=desk]
    ^-  (quip card _state)
    ~&  >>  "{<dap.bowl>}: charge-update [del-charge] received. {<desk>}"
    (bazaar:send-reaction:core [%app-uninstalled desk] [/updates ~] ~)
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
    :: ~&  >  spaces
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
    =.  space-apps.state  (~(put by space-apps.state) path.space [*app-index-lite:store *sorts:store])
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
    |=  [payload=reaction:store paths=(list path) cards=(list card)]
    ^-  (quip card _state)
    =/  fack  [%give %fact paths bazaar-reaction+!>(payload)]~
    :_  state
    ?~  cards  fack  (weld fack cards)
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