::
::  %bazaar [realm]:
::
::  A store for metadata on app dockets and installs.
::
::
/-  store=bazaar-store, docket, spaces-store, vstore=visas
/-  membership-store=membership, hark=hark-store
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
        =catalog:store
        =stalls:store
        =docks:store
        =grid-index:store
        =recommendations:store
        pending-installs=(map ship desk)
    ==
  --
=|  state-0
=*  state  -
=<
  %+  verb  &
  %-  agent:dbug
  |_  =bowl:gall
  +*  this    .
      def     ~(. (default-agent this %|) bowl)
      core    ~(. +> [bowl ~])
  ::
  ++  on-init
    ^-  (quip card _this)
    =/  =charge-update:docket  .^(charge-update:docket %gx /(scot %p our.bowl)/docket/(scot %da now.bowl)/charges/noun)
    ?>  ?=([%initial *] charge-update)
    =/  our-space                     [our.bowl 'our']
    =/  catalog                       (init-catalog:helpers:bazaar initial.charge-update)
    =|  =native-app:store
      =.  title.native-app            'Relic Browser'
      =.  color.native-app            '#92D4F9'
      =.  icon.native-app             'AppIconCompass'
    =/  catalog                       (~(put by catalog) %os-browser [%native native-app])
    =|  =native-app:store
      =.  title.native-app            'Settings'
      =.  color.native-app            '#ACBCCB'
      =.  icon.native-app             'AppIconSettings'
    =.  catalog.state                 (~(put by catalog) %os-settings [%native native-app])
    =/  spaces-scry                   .^(view:spaces-store %gx /(scot %p our.bowl)/spaces/(scot %da now.bowl)/all/noun)
    ?>  ?=(%spaces -.spaces-scry)
    =/  spaces                        spaces.spaces-scry
    ~&  >  ['on-init %spaces scry' spaces.spaces-scry]
    =/  stalls       
      %+  turn  ~(tap by spaces)
        |=  [path=space-path:spaces-store =space:spaces-store]
        [path [suite=~ recommended=~]]
    =/  docks       
      %+  turn  ~(tap by spaces)
        |=  [path=space-path:spaces-store =space:spaces-store]
        [path [~]]
    =.  stalls.state        (~(gas by stalls.state) stalls)
    =.  docks.state         (~(gas by docks.state) docks)
    :_  this
    :~ 
        [%pass /docket %agent [our.bowl %docket] %watch /charges]
        [%pass /treaties %agent [our.bowl %treaty] %watch /treaties]
        [%pass /allies %agent [our.bowl %treaty] %watch /allies]
        [%pass /spaces %agent [our.bowl %spaces] %watch /updates]
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
    ?+  mark                    (on-poke:def mark vase)
      %bazaar-action            (action:bazaar:core !<(action:store vase))
      %bazaar-interaction       (interaction:bazaar:core !<(interaction:store vase))
    ==
    [cards this]
  ::
  ++  on-watch
    |=  =path
    ^-  (quip card _this)
    =/  cards=(list card)
    ?+  path                  (on-watch:def path)
      [%updates ~]
        ~&  >>  "{<dap.bowl>}: [on-watch]. {<src.bowl>} subscribing to updates..."
        ?>  (is-host:core src.bowl)
        [%give %fact [/updates ~] bazaar-reaction+!>([%initial catalog.state stalls.state docks.state recommendations.state])]~
      ::
      [%bazaar @ @ ~]         :: The space level watch subscription
        =/  host              `@p`(slav %p i.t.path)
        =/  space-path        `@t`i.t.t.path
        :: https://developers.urbit.org/guides/core/app-school/8-subscriptions#incoming-subscriptions
        ::  recommends crash on permission check or other failure
        =/  path              [host space-path]
        ?>  (check-member:security:core path src.bowl)
        ~&  >>  "{<dap.bowl>}: [on-watch]. {<src.bowl>} subscribing to {<(spat /(scot %p host)/(scot %tas space-path))>}..."
        =/  paths             [/bazaar/(scot %p our.bowl)/(scot %tas space-path) ~]
        =/  space-data        (filter-space-data:helpers:bazaar path)
        [%give %fact paths bazaar-reaction+!>([%joined-bazaar path catalog.space-data stall.space-data])]~
      ::
    ==
    [cards this]
  ::
  ++  on-peek
    |=  =path
    ^-  (unit (unit cage))

    ?+    path  (on-peek:def path)
      ::
      [%x %catalog ~]     ::  ~/scry/bazaar/catalog
        ``bazaar-view+!>([%catalog catalog.state])
      ::
      [%x %installed ~]   ::  ~/scry/bazaar/installed 
        =/  apps          (skim ~(tap by catalog.state) skim-installed:helpers:bazaar:core)
       ``bazaar-view+!>([%installed `catalog:store`(malt apps)])
      ::
      [%x %allies ~]     ::  ~/scry/bazaar/allies
        =/  allies   allies:scry:bazaar:core
        ``bazaar-view+!>([%allies allies])
      ::
      [%x %treaties ship=@ ~]     ::  ~/scry/bazaar/allies
        =/  =ship      (slav %p i.t.t.path)
        =/  treaties   (treaties:scry:bazaar:core ship)
        ``bazaar-view+!>([%treaties treaties])
      ::
      :: [%x %treaties @ @ ~]     ::  ~/scry/bazaar/allies
      ::   =/  =ship       (slav %p i.t.t.path)
      ::   =/  =desk       (slav %tas i.t.t.t.path)
      ::   ~&  >  [ship desk]
      ::   =/  treaty      (treaty:scry:bazaar:core ship desk)
      ::   :: ~&  >  treaty
      ::   ``json+!>(~)
      :: ``bazaar-view+!>([%treaty treaty])
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
            ?+    p.cage.sign   (on-agent:def wire sign)
                  %spaces-reaction
                =^  cards  state
                  (reaction:spaces:core !<(=reaction:spaces-store q.cage.sign))
                [cards this]
                ::
                  %visa-reaction
                =^  cards  state
                  (reaction:visas:core !<(=reaction:vstore q.cage.sign))
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
      ::  only space members will sub to this
      [%bazaar @ @ ~]
          ?+    -.sign  (on-agent:def wire sign)
            %watch-ack
              ?~  p.sign  `this
              ~&  >>>  "{<dap.bowl>}: bazaar subscription failed"
              `this
            %kick
              =/  =ship       `@p`(slav %p i.t.wire)
              =/  space-pth   `@t`i.t.t.wire
              ~&  >  "{<dap.bowl>}: bazaar kicked us, resubscribing... {<ship>} {<space-pth>}"
              =/  watch-path      [/bazaar/(scot %p ship)/(scot %tas space-pth)]
              :_  this
              :~  [%pass watch-path %agent [ship %bazaar] %watch watch-path]
              ==
            %fact
              ?+    p.cage.sign  (on-agent:def wire sign)
                  %bazaar-reaction
                  =^  cards  state
                    (reaction:bazaar:core !<(=reaction:store q.cage.sign))
                  [cards this]
              ==
          ==
      ==
  ::
  ++  on-arvo   |=([wire sign-arvo] !!)
  ++  on-leave  |=(path `..on-init)
  ++  on-fail ::  |=([term tang] `..on-init)
    |=  [=term =tang]
    ^-  (quip card _this)
    %-  (slog leaf+"error in {<dap.bowl>}" >term< tang)
    `this
  :: |=([term tang] `..on-init)
--
|_  [=bowl:gall cards=(list card)]
::
++  core  .
++  bazaar
  |%
  ++  action
    |=  =action:store
    ^-  (quip card _state)
    |^
    ?-  -.action          
      %pin               (add-pin +.action)
      %unpin             (rem-pin +.action)
      %reorder-pins      (reorder-pins +.action)
      %recommend         (recommend +.action)
      %unrecommend       (unrecommend +.action)
      %suite-add         (add-suite +.action)
      %suite-remove      (rem-suite +.action)
      %install-app       (install-app +.action)
      %uninstall-app     (uninstall-app +.action)
    ==
    ::
    ++  add-pin
      |=  [path=space-path:spaces-store =app-id:store index=(unit @ud)]
      ?>  =(our.bowl src.bowl)
      =/  upd-docks=dock:store      (~(gut by docks.state) path ~)
      =/  index                     ?~(index (lent upd-docks) u.index)
      =/  exists-at                 (find [app-id]~ upd-docks)
      ?~  exists-at                 ::  should only pin if it doesnt exist              
        =.  upd-docks               (into upd-docks index app-id)
        =.  docks.state             (~(put by docks.state) [path upd-docks])
        :_  state
        [%give %fact [/updates ~] bazaar-reaction+!>([%pinned path app-id index])]~
      `state
    ::
    ++  reorder-pins
      |=  [path=space-path:spaces-store =dock:store]
      ?>  =(our.bowl src.bowl)
      =.  docks.state             (~(put by docks.state) [path dock])
      :_  state
      [%give %fact [/updates ~] bazaar-reaction+!>([%pins-reodered path dock])]~
      
    ++  rem-pin
      |=  [path=space-path:spaces-store =app-id:store]
      ?>  =(our.bowl src.bowl)
      =/  upd-docks                 (~(got by docks.state) path)
      =/  index                     (find [app-id]~ upd-docks)
      ?~  index                     `state
      =.  upd-docks                 (oust [(need index) 1] upd-docks)
      =.  docks.state               (~(put by docks.state) [path upd-docks])
      :_  state
      [%give %fact [/updates ~] bazaar-reaction+!>([%unpinned path app-id])]~
    ::
    ++  add-suite
      |=  [path=space-path:spaces-store =app-id:store index=@ud]
      ?.  (is-host:core ship.path)
        (member-add-suite path app-id index)
      (host-add-suite path app-id index)
      ::
      ++  member-add-suite
        |=  [path=space-path:spaces-store =app-id:store index=@ud]
        ?>  (check-admin:security path src.bowl)
        :_  state
        [%pass / %agent [ship.path %bazaar] %poke bazaar-action+!>([%suite-add path app-id index])]~
      ::
      ++  host-add-suite
        |=  [path=space-path:spaces-store =app-id:store index=@ud]
        =/  stall=stall:store   (~(gut by stalls.state) path [suite=~ recommended=~])
        =.  suite.stall         (~(put by suite.stall) [index app-id])
        =.  stalls.state        (~(put by stalls.state) [path stall])
        =/  paths               [/updates /bazaar/(scot %p ship.path)/(scot %tas space.path) ~]
        :_  state
        [%give %fact paths bazaar-reaction+!>([%suite-added path app-id index])]~
    ::
    ++  rem-suite
      |=  [path=space-path:spaces-store index=@ud]
      ?.  (is-host:core ship.path)
        (member-remove-suite path index)
      (host-remove-suite path index)
      ::
      ++  member-remove-suite
        |=  [path=space-path:spaces-store index=@ud]
        ?>  (check-admin:security path src.bowl)
        :_  state
        [%pass / %agent [ship.path %bazaar] %poke bazaar-action+!>([%suite-remove path index])]~
      ::
      ++  host-remove-suite
        |=  [path=space-path:spaces-store index=@ud]
        =/  stall               (~(got by stalls.state) path)
        =.  suite.stall         (~(del by suite.stall) index)
        =.  stalls.state        (~(put by stalls.state) [path stall])
        =/  paths               [/updates /bazaar/(scot %p ship.path)/(scot %tas space.path) ~]
        :_  state
        [%give %fact paths bazaar-reaction+!>([%suite-removed path index])]~
    ::
    ++  install-app
      |=  [=ship =desk]
      ^-  (quip card _state)    
      ?>  =(our.bowl src.bowl)
      =/  allies      allies:scry:bazaar
      ?.  (~(has by allies) ship)
        %-  (slog leaf+"{<ship>} not an ally. adding {<ship>} as ally..." ~)
        ::  queue this installation request, so that once alliance is complete,
        ::  we can automatically kick off the install
        =.  pending-installs.state  (~(put by pending-installs.state) ship desk)
        :_  state
        [%pass / %agent [our.bowl %treaty] %poke ally-update-0+!>([%add ship])]~
      :_  state
      :~
        [%pass / %agent [our.bowl %docket] %poke docket-install+!>([ship desk])]
      ==
    ::
    ++  uninstall-app
      |=  [=desk]
      ^-  (quip card _state)
      ?>  =(our.bowl src.bowl)
      :_  state
      [%pass / %agent [our.bowl %docket] %poke docket-uninstall+!>([desk])]~
    ::
    ++  recommend
      |=  [=app-id:store]
      ?>  =(our.bowl src.bowl)
      ~&  >  ['recommend' our.bowl src.bowl]
      =.  recommendations.state     (~(put in recommendations.state) app-id)
      =/  app                       (~(got by catalog.state) app-id)
      =/  updated-stalls=[=stalls:store cards=(list card)]
      %-  ~(rep by stalls.state)
        |=  [[path=space-path:spaces-store =stall:store] result=[=stalls:store cards=(list card)]]
        ?:  (we-host:helpers path)
          =/  rec-members             (~(gut by recommended.stall) app-id ~)
          =.  rec-members             (~(put in rec-members) our.bowl)
          =.  recommended.stall       (~(put by recommended.stall) [app-id rec-members])
          =.  stalls.result           (~(put by stalls.result) [path stall])
          =/  paths                   [/updates /bazaar/(scot %p ship.path)/(scot %tas space.path) ~]
          [stalls.result [%give %fact paths bazaar-reaction+!>([%stall-update path stall])]~]
        ::  we need to poke host
        =/  cards  
          :~
            [%pass / %agent [ship.path %bazaar] %poke bazaar-interaction+!>([%member-recommend path app-id app])]
          ==
        [stalls.state cards]
      =.  stalls.state            stalls.updated-stalls
      =.  cards.updated-stalls    (snoc cards.updated-stalls [%give %fact [/updates ~] bazaar-reaction+!>([%recommended app-id stalls.state])])
      :_  state
      cards.updated-stalls
    ::
    ++  unrecommend
      |=  [=app-id:store]
      ?>  =(our.bowl src.bowl)
      =.  recommendations.state   (~(del in recommendations.state) app-id)
      =/  updated-stalls=[=stalls:store cards=(list card)]
      %-  ~(rep by stalls.state)
        |=  [[path=space-path:spaces-store =stall:store] result=[=stalls:store cards=(list card)]]
        ?:  (we-host:helpers path)
          =/  rec-members             (~(gut by recommended.stall) app-id ~)
          =.  rec-members             (~(del in rec-members) our.bowl)
          =.  recommended.stall       
            ?:  =(~(wyt in rec-members) 0)
              (~(del by recommended.stall) app-id)
            (~(put by recommended.stall) [app-id rec-members])
          =.  stalls.result           (~(put by stalls.result) [path stall])
          =/  paths                   [/updates /bazaar/(scot %p ship.path)/(scot %tas space.path) ~]
          [stalls.result [%give %fact paths bazaar-reaction+!>([%stall-update path stall])]~]
        =/  cards  
          :~
            [%pass / %agent [ship.path %bazaar] %poke bazaar-interaction+!>([%member-unrecommend path app-id])]
          ==
        [stalls.state cards]

      =.  stalls.state            stalls.updated-stalls
      =.  cards.updated-stalls    (snoc cards.updated-stalls [%give %fact [/updates ~] bazaar-reaction+!>([%unrecommended app-id stalls.state])])
      ~&  >  cards.updated-stalls
      :_  state
      cards.updated-stalls
    ::
    --
  ++  reaction
    |=  [rct=reaction:store]
    ^-  (quip card _state)
    |^
    ?+  -.rct             `state
      %recommended        (on-rec +.rct)
      %unrecommended      (on-unrec +.rct)
      %suite-added        (on-suite-add +.rct)
      %suite-removed      (on-suite-rem +.rct)
      %joined-bazaar      (on-joined +.rct)
      %stall-update       (on-stall-update +.rct)
    ==
    ::
    ++  on-rec
      |=  [app-id=@tas =stalls:store]
      `state
    ::
    ++  on-unrec
      |=  [app-id=@tas =stalls:store]
      `state
    ::
    ++  on-suite-add
      |=  [path=space-path:spaces-store app-id=@tas index=@ud]
      ?:  =(is-host:core ship.path)
        `state
      =/  stall               (~(got by stalls.state) path)
      =.  suite.stall         (~(put by suite.stall) [index app-id])
      =.  stalls.state        (~(put by stalls.state) [path stall])
      `state
    ::
    ++  on-suite-rem
      |=  [path=space-path:spaces-store index=@ud]
      ?:  =(is-host:core ship.path)
        `state
      =/  stall               (~(got by stalls.state) path)
      =.  suite.stall         (~(del by suite.stall) index)
      =.  stalls.state        (~(put by stalls.state) [path stall])
      `state
    ::
    ++  on-joined
      |=  [path=space-path:spaces-store =catalog:store =stall:store]
      =.  stalls.state        (~(put by stalls.state) [path stall])
      =.  docks.state         (~(put by docks.state) [path [~]])
      =/  new-catalog-apps=(list [=app-id:store =app:store])
        %-  ~(rep by catalog)
          |=  [entry=[=app-id:store =app:store] result=(list [=app-id:store =app:store])]
          ?:  (~(has by catalog.state) app-id.entry)  ::  if we already have the app
            result
          (snoc result entry)
      =.  catalog.state       (~(uni by catalog.state) (malt new-catalog-apps))
      :_  state
      [%give %fact [/updates ~] bazaar-reaction+!>([%joined-bazaar path catalog stall])]~

    ::
    ++  on-stall-update
      |=  [path=space-path:spaces-store =stall:store]
      =.  stalls.state        (~(put by stalls.state) [path stall])
      :_  state
      [%give %fact [/updates ~] bazaar-reaction+!>([%stall-update path stall])]~
    --
  ++  interaction 
    |=  [itc=interaction:store]
    ^-  (quip card _state)
    |^
    ?-  -.itc             
      %member-recommend          (member-recommend +.itc)
      %member-unrecommend        (member-unrecommend +.itc)
    ==
    ::
    ++  member-recommend
      |=  [path=space-path:spaces-store =app-id:store =app:store]
      ?>  (check-member:security path src.bowl)
      =/  stall                   (~(got by stalls.state) path)
      =/  rec-members             (~(gut by recommended.stall) app-id ~)
      =.  rec-members             (~(put in rec-members) src.bowl)
      =.  recommended.stall       (~(put by recommended.stall) [app-id rec-members])
      =.  stalls.state            (~(put by stalls.state) [path stall])
      =/  paths                   [/updates /bazaar/(scot %p ship.path)/(scot %tas space.path) ~]
      :_  state
      [%give %fact paths bazaar-reaction+!>([%stall-update path stall])]~
    ::
    ++  member-unrecommend
      |=  [path=space-path:spaces-store =app-id:store]
      ?>  (check-member:security path src.bowl)
      =/  stall                   (~(got by stalls.state) path)
      =/  rec-members=member-set:store           
        ?:  (~(has by recommended.stall) app-id)
          =/  members     (~(got by recommended.stall) app-id)
          =.  members     (~(del in members) src.bowl)
          members
        ~
      =.  recommended.stall       
        ?:  =(~(wyt in rec-members) 0)
          (~(del by recommended.stall) app-id)
        (~(put by recommended.stall) [app-id rec-members])
      =.  stalls.state            (~(put by stalls.state) [path stall])
      =/  paths                   [/updates /bazaar/(scot %p ship.path)/(scot %tas space.path) ~]
      :_  state
      [%give %fact paths bazaar-reaction+!>([%stall-update path stall])]~
    --
  ++  give
    |=  [payload=reaction:store paths=(list path) cards=(list card)]
    ^-  (quip card _state)
    =/  fack  [%give %fact paths bazaar-reaction+!>(payload)]~
    :_  state
    ?~  cards  fack  (weld fack cards)
  ::
  ++  scry
    |%
    ++  allies
      ^-  allies:ally:treaty
      =/  allies  .^(update:ally:treaty %gx /(scot %p our.bowl)/treaty/(scot %da now.bowl)/allies/noun)
      ?>  ?=(%ini -.allies)
      init.allies
    ::
    ++  treaties
      |=  [=ship]
      =/  treaties  .^(update:treaty:treaty %gx /(scot %p our.bowl)/treaty/(scot %da now.bowl)/treaties/(scot %p ship)/noun)
      ?>  ?=(%ini -.treaties)
      init.treaties
    ::
    --
  ++  helpers
    |%
    ++  update-paths
      |=  [path=space-path:spaces-store]
      ?.  =(space.path %our)
        [/update ~]
      [/updates /bazaar/(scot %p ship.path)/(scot %tas space.path) ~]
    ::
    ++  init-catalog
      |=  [charges=(map desk charge:docket)]
      =/  hidden     `(set desk)`(silt ~['realm' 'wallet' 'courier' 'garden'])
      ~&  >  [hidden]
      ^-  catalog:store
      %-  ~(rep by charges)
        |:  [[=desk =charge:docket] acc=`catalog:store`~]
        ?:  (~(has in hidden) desk)  acc
        (~(put by acc) desk [%urbit docket.charge ~ %installed])
    ::
    ++  gen-bare-app
      |=  [=ship =desk]
      =/  bare-docket
        [
          %1
          title=desk
          info=''
          color=`@ux`'0'
          href=[%site /(scot %tas desk)]
          image=~
          version=[major=0 minor=0 patch=0]
          website=''
          license=''
        ]
      =/  new-app=urbit-app:store    [docket=bare-docket host=(some ship) install-status=%started]
      new-app
    ::
    ++  skim-installed
      |=  [=app-id:store =app:store]
      ?:  =(%urbit -.app)
        ?>  ?=(%urbit -.app)
        =(%installed install-status.app)
      %.y  ::  if not urbit app, is installed
    ::
    ++  we-host
      |=  [path=space-path:spaces-store]
      ?:  =('our' space.path)  
        %.n
      =(our.bowl ship.path)
    ::
    ++  filter-space-data
      |=  [path=space-path:spaces-store]
      =/  stall=stall:store       (~(got by stalls.state) path)
      =/  suite-apps              ~(val by suite.stall)
      =/  recommended-apps        ~(tap in ~(key by recommended.stall))
      =/  catalog-apps            (weld suite-apps recommended-apps)
      =/  catalog=(list [app-id:store =app:store])
        %+  turn  catalog-apps
        |=  [=app-id:store]
        [app-id (~(got by catalog.state) app-id)]
      [catalog=(malt catalog) stall=stall]
    ::
    ++  is-system-app
      |=  [=app-id:store]
      ^-  ?
      ?:  ?|  =(app-id %courier)
              =(app-id %realm)
              =(app-id %garden)
          ==
      %.y  %.n
    --
  --
::
++  visas
  |%
  ++  reaction 
    |=  [rct=reaction:vstore]
    ^-  (quip card _state)
    |^
    ?+  -.rct         `state
      %kicked         (on-member-kicked +.rct)
    ==
    ++  on-member-kicked
      |=  [path=space-path:spaces-store =ship]
      ^-  (quip card _state)
      =/  update-path    /bazaar/(scot %p ship.path)/(scot %tas space.path)
      ?.  (is-host:core ship.path) 
        ?:  =(our.bowl ship)      ::  we were kicked
          =.  stalls.state        (~(del by stalls.state) path)
          =.  docks.state         (~(del by docks.state) path)
          :_  state 
          [%pass update-path %agent [our.bowl %bazaar] %leave ~]~
        ::  another member was kicked
        `state
      =/  stall               (~(got by stalls.state) path)
      =/  cleaned-recs=[=recommended:store]        
        %-  ~(rep by recommended.stall)  ::  remove all recommendations from kicked
          |=  [app=[=app-id:store =member-set:store] result=[=recommended:store]]
          =/  rec-members      (~(del in member-set.app) ship)
          =/  recommeded-map   
            ?:  =(~(wyt in rec-members) 0)
              (~(del by recommended.result) app-id.app)
            (~(put by recommended.result) [app-id.app rec-members])
          =.  recommended.result    recommeded-map 
          [recommended.result]
      ::
      =.  recommended.stall   recommended.cleaned-recs
      =.  stalls.state        (~(put by stalls.state) [path stall])
      :_  state
      :~
        [%give %fact [update-path /updates ~] bazaar-reaction+!>([%stall-update path stall])]
        [%give %kick ~[update-path] (some ship)]
      ==
    --
  --
++  spaces
  |%
  ++  reaction 
    |=  [rct=reaction:spaces-store]
    ^-  (quip card _state)
    |^
    ?+  -.rct         `state
      %add            (on-add +.rct)
      %remove         (on-remove +.rct)
      %remote-space   (on-remote-space +.rct)
    ==
    ::
    ++  on-add
      |=  [space=space:spaces-store members=members:membership-store]
      ^-  (quip card _state)
      ~&  >  ['%bazarr spaces-reaction on-add']
      =.  stalls.state        (~(put by stalls.state) [path.space [suite=~ recommended=~]])
      =.  docks.state         (~(put by docks.state) [path.space [~]])
      `state
    ::
    ++  on-remove
      |=  [path=space-path:spaces-store]
      ^-  (quip card _state)
      ~&  >  ['%bazarr spaces-reaction on-remove']
      =.  stalls.state        (~(del by stalls.state) path)
      =.  docks.state         (~(del by docks.state) path)
      `state
    ::
    ++  on-remote-space   ::  when we join a new space
      |=  [path=space-path:spaces-store =space:spaces-store =members:membership-store]
      ^-  (quip card _state)
      ~&  >  ['%bazarr spaces-reaction on-remote-space']
      ?:  =(our.bowl ship.path)  `state
      =/  recs=(list card)
        %+  turn  ~(tap in recommendations.state)
          |=  [=app-id:store]
          =/  app  (~(got by catalog.state) app-id)
        [%pass / %agent [ship.path %bazaar] %poke bazaar-interaction+!>([%member-recommend path app-id app])]
      =/  watch-path    [/bazaar/(scot %p ship.path)/(scot %tas space.path)]
      :_  state
      %+  weld  recs
      ^-  (list card)
      :~  
        [%pass watch-path %agent [ship.path %bazaar] %watch watch-path]
      ==
    ::
    --
  --
::
++  treaty-update
  |=  [upd=update:treaty:treaty]
  ^-  (quip card _state)
  |^  
  ?+  -.upd    `state
    %add       (on-add +.upd)
    :: %del       (on-del +.upd)
  ==
  ::
  ++  on-add
    |=  [=treaty:treaty]
    ^-  (quip card _state)
    :: ~&  >>  "{<dap.bowl>}: treaty-update [on-add] => {<[treaty]>}"
    =|  app=app:store
    :: =.  app            [%urbit docket.treaty `ship.treaty %treaty]
    :: =.  catalog.state  (~(put by catalog.state) desk.treaty app)
    ~&  >  app
    ::  do we have a pending installation request for this ship/desk?
    =/  installation  (~(get by pending-installs.state) ship.treaty)
    ?~  installation  ::  if there is no pending-install, ignore
      `state
    ::  trigger docker install
    :_  state
    :~  
      [%pass /docket-install %agent [our.bowl %docket] %poke docket-install+!>([ship.treaty desk.treaty])]
    == 
  ::
  :: ++  on-del
  ::   |=  [=ship =desk]
  ::   ^-  (quip card _state)
  ::   =/  app       (~(get by catalog.state) desk)
  ::   ?~  app       `state
  ::   =/  app       u.app
  ::   ?+  -.app     `state
  ::     ::
  ::     %urbit
  ::       ?:  ?&  =(install-status.app %treaty)
  ::               =((need host.app) ship)
  ::           ==
  ::         =.  catalog.state  (~(del by catalog.state) ship)
  ::         `state
  ::       `state
  ::   ==
  --
::
++  ally-update
  |=  [upd=update:ally:treaty]
  ^-  (quip card _state)
  |^
  ?+  -.upd       `state
    %new          (on-new +.upd)
    %add          (on-add +.upd)
    %del          (on-del +.upd)
  ==
  ::
  ++  on-new
    |=  [=ship =alliance:treaty]
    ^-  (quip card _state)
    `state
  ::
  ++  on-add
    |=  [=ship]
    ^-  (quip card _state)
    :: =/  =update:treaty:treaty  .^(update:treaty:treaty %gx /(scot %p our.bowl)/treaty/(scot %da now.bowl)/treaties/(scot %p ship)/noun)
    `state
  ::
  ++  on-del
    |=  [=ship]
    ^-  (quip card _state)
    `state
  --
::  charge arms
++  ch
  |%
  ++  on
    |=  upd=charge-update:docket
    ^-  (quip card _state)
    ?+  -.upd         `state
      %add-charge     (add:ch:core +.upd)
      %del-charge     (rem:ch:core +.upd)
    ==
  ::
  ++  add
    |=  [=desk =charge:docket]
    ^-  (quip card _state) 
    ?-  -.chad.charge  
      %install  ::  app install started
        =/  app  (~(get by catalog.state) desk)
        =/  app=app:store  ?~  app  [%urbit docket.charge ~ %started]
          ?>  ?=(%urbit -.u.app)
          =.  install-status.u.app    %started
          =.  docket.u.app            docket.charge
          u.app
        ?>  ?=(%urbit -.app)
        =.  docket.app                docket.charge
        =.  catalog.state             (~(put by catalog.state) desk app)
        :_  state
        [%give %fact [/updates ~] bazaar-reaction+!>([%app-install-update desk +.app])]~
      ::
      %hung  ::  app install failed
        =/  app  (~(get by catalog.state) desk)
        =/  app  ?~  app  [%urbit docket.charge ~ %failed]
          ?>  ?=(%urbit -.u.app)
          =.  install-status.u.app  %failed
          =.  docket.u.app  docket.charge
          u.app
        ?>  ?=(%urbit -.app)
        =.  catalog.state  (~(put by catalog.state) desk app)
        :_  state
        [%give %fact [/updates ~] bazaar-reaction+!>([%app-install-update desk +.app])]~
      ::
      %suspend  ::  app install paused
        =/  app  (~(get by catalog.state) desk)
        =/  app  ?~  app  [%urbit docket.charge ~ %suspended]
          ?>  ?=(%urbit -.u.app)
          =.  install-status.u.app  %suspended
          =.  docket.u.app  docket.charge
          u.app
        ?>  ?=(%urbit -.app)
        =.  catalog.state  (~(put by catalog.state) desk app)
        :_  state
        [%give %fact [/updates ~] bazaar-reaction+!>([%app-install-update desk +.app])]~
      ::
      %glob  ::  app install is complete
        =/  app  (~(get by catalog.state) desk)
        =/  app  ?~  app  [%urbit docket.charge ~ %installed]
          ?>  ?=(%urbit -.u.app)
          =.  install-status.u.app  %installed
          =.  docket.u.app  docket.charge
          u.app
        ?>  ?=(%urbit -.app)
        =.  catalog.state  (~(put by catalog.state) desk app)
        :_  state
        [%give %fact [/updates ~] bazaar-reaction+!>([%app-install-update desk +.app])]~
      ::
      %site  ::  app install is complete
        =/  app  (~(get by catalog.state) desk)
        =/  app  ?~  app  [%urbit docket.charge ~ %installed]
          ?>  ?=(%urbit -.u.app)
          =.  install-status.u.app  %installed
          =.  docket.u.app  docket.charge
          u.app
        ?>  ?=(%urbit -.app)
        =.  catalog.state  (~(put by catalog.state) desk app)
        :_  state
        [%give %fact [/updates ~] bazaar-reaction+!>([%app-install-update desk +.app])]~
      
    ==
  ::
  ++  rem
    |=  [=desk]
    ^-  (quip card _state)
    ::  TODO check if installed
    ~&  >>  "{<dap.bowl>}: charge-update [del-charge] received. {<desk>}"
    =/  app  (~(get by catalog.state) desk)
    ?~  app  `state
    ?>  ?=(%urbit -.u.app)
    =.  install-status.u.app  %uninstalled
    =.  catalog.state  (~(put by catalog.state) desk u.app)
    :_  state
    [%give %fact [/updates ~] bazaar-reaction+!>([%app-install-update desk +.u.app])]~
  --
::
::  $security. member/permission checks
::
++  security
  |%
  ++  check-member
    |=  [path=space-path:spaces-store =ship]
    ^-  ?
    =/  member   .^(view:membership-store %gx /(scot %p our.bowl)/spaces/(scot %da now.bowl)/(scot %p ship.path)/(scot %tas space.path)/is-member/(scot %p ship)/noun)
    ?>  ?=(%is-member -.member)
    is-member.member
  ::
  ++  check-admin
    |=  [path=space-path:spaces-store =ship]
    ^-  ?
    =/  member   .^(view:membership-store %gx /(scot %p our.bowl)/spaces/(scot %da now.bowl)/(scot %p ship.path)/(scot %tas space.path)/member/(scot %p ship)/noun)
    ?>  ?=(%member -.member)
    (~(has in roles.member.member) %admin)
  ::
  --
++  is-host
  |=  [=ship]
  =(our.bowl ship)
::
--