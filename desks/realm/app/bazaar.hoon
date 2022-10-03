::
::  %bazaar [realm]:
::
::  A store for metadata on app dockets and installs.
::
::
/-  store=bazaar, docket, spaces-store
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
        =my:store
        =app-catalog:store
        space-apps=space-apps-lite:store
        :: vips are ships hosting apps for install
        =sites:store
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
  :: %-  (slog leaf+"{<[apps]>}" ~)
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
  :: =.  tags.sieve.app-lite                 (~(put in tags.sieve.app-lite) 690)
  =/  apps                                (~(put by apps) id.app-lite app-lite)

  =|  =native-app:store
  =.  title.native-app                    'Relic Browser'
  =.  color.native-app                    '#92D4F9'
  =.  icon.native-app                     'AppIconCompass'
  =/  catalog                             (~(put by catalog) id.app-lite [%0 [%native native-app]])

  ::  configure settings
  =|  =app-lite:store
  =.  id.app-lite                         %os-settings
  =.  ranks.sieve.app-lite                [0 0 0]
  :: =.  tags.sieve.app-lite                 (~(put in tags.sieve.app-lite) %installed)
  =/  apps                                (~(put by apps) id.app-lite app-lite)

  =|  =native-app:store
  =.  title.native-app                    'Settings'
  =.  color.native-app                    '#ACBCCB'
  =.  icon.native-app                     'AppIconSettings'
  =/  catalog                             (~(put by catalog) id.app-lite [%0 [%native native-app]])

  :: ~&  >  "on-init..."
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
  :: ~&  >>  "{<dap.bowl>}: {<[mark vase]>}"
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
      :: ~&  >>  "{<dap.bowl>}: [on-watch]. {<src.bowl>} subscribing to our..."
      ::  only host agent should get our updates
      ?>  (is-host:core src.bowl)
      `state
    ::
    [%updates ~]
      ~&  >>  "{<dap.bowl>}: [on-watch]. {<src.bowl>} subscribing to updates..."
      ::  only host should get all updates
      ?>  (is-host:core src.bowl)
      =/  apps  initial:apps:core
      :: (bazaar:send-reaction:core [%initial space-apps.state] [/updates ~])
      (bazaar:send-reaction:core [%initial apps my.state] [/updates ~] ~)
    ::
    [%bazaar @ @ ~]
      :: The space level watch subscription
      =/  host        `@p`(slav %p i.t.path)
      =/  space-pth   `@t`i.t.t.path
      ~&  >>  "{<dap.bowl>}: [on-watch]. {<src.bowl>} subscribing to {<(spat /(scot %p host)/(scot %tas space-pth))>}..."
      :: https://developers.urbit.org/guides/core/app-school/8-subscriptions#incoming-subscriptions
      ::  recommends crash on permission check or other failure
      ?>  (check-member:security:core [host space-pth] src.bowl)
      =/  pth         [host space-pth]
      =/  paths       [/bazaar/(scot %p our.bowl)/(scot %tas space-pth) ~]
      =/  apps        (space-initial:apps:core pth)
      =/  entry       (~(get by space-apps.state) pth)
      =/  sorts       ?~(entry *sorts:store sorts.u.entry)
      =/  sites        sites:core
      ~&  >>  "{<dap.bowl>}: {<sites>}"
      (bazaar:send-reaction:core [%space-apps pth apps sorts sites] paths ~)
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
        :: %installed
        :: =/  apps  (view:apps:core [ship space-pth] (some %installed))
        :: ?~  apps  ``json+!>([%a ~]) :: empty array
        :: ``bazaar-view+!>([%apps u.apps])
      ==

    ::
    ::  list of [ship desk]. can be used to resolve app installation locations.
    ::  ~/scry/bazaar/directories/[desk].json
    ::
    [%x %sites @ ~]
      :: ``json+!>([%a ~])
      :: ?:  ?|  =(~ space-vips.state)
      ::         =(0 (lent ~(tap in space-vips.state)))
      ::     ==
      ::     =/  dirs=json
      ::     %-  pairs:enjs:format
      ::     :~  [%vips [%a `(list json)`~]]  ==
      ::     ``json+!>(dirs)
      =/  app-name   `@t`i.t.path
      =/  sites
      :: %-  ~(rep in space-vips.state)
      :: |=  [[path=spaces-path:store vips=(set [ship desk])] acc=(set [ship desk])]
      %+  skim  ~(tap in sites.state)
      |=  [=ship =desk]
      =(desk app-name)

      :: =/  dirs=(list [=ship =desk])
      :: %-  skim
      :: :-  directories.state
      :: |=  [[=ship =desk]]
      :: =(desk app-name)
      ``bazaar-view+!>([%sites (silt sites)])
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
                  (bazaar-reaction:core !<(=reaction:store q.cage.sign))
                [cards this]
            ==
        ==
      ::
    ::  only our will sub to this
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
    =/  entry            (~(got by app-catalog.state) app-id)
    =/  apps            (~(got by space-apps.state) path)
    =/  app-lite             (~(got by index.apps) app-id)
    =.  tags.sieve.app-lite     (~(put in tags.sieve.app-lite) %pinned)
    =/  rank  ?~(rank (count-apps index.apps %pinned) u.rank)
    =.  pinned.ranks.sieve.app-lite   rank
    =.  index.apps  (pin index.apps app-lite)
    =.  pinned.sorts.apps     (sort-apps (extract-apps index.apps %pinned) %pinned %asc)
    =/  paths  [/updates /bazaar/(scot %p ship.path)/(scot %tas space.path) ~]
    :: ~&  >  "add-pin..."
    =.  space-apps.state  (~(put by space-apps.state) path apps)
    (bazaar:send-reaction [%pin path [app-id sieve.app-lite entry] pinned.sorts.apps] paths ~)
  ::
  ++  rem-pin
    |=  [path=space-path:spaces-store =app-id:store]
    ^-  (quip card _state)
    =/  entry            (~(got by app-catalog.state) app-id)
    =/  apps  (~(got by space-apps.state) path)
    =/  app-lite   (~(got by index.apps) app-id)
    =.  tags.sieve.app-lite  (~(del in tags.sieve.app-lite) %pinned)
    =.  index.apps  (unpin index.apps app-lite)
    =.  pinned.sorts.apps     (sort-apps (extract-apps index.apps %pinned) %pinned %asc)
    :: ~&  >  "rem-pin..."
    =.  space-apps.state  (~(put by space-apps.state) path apps)
    =/  paths  [/updates /bazaar/(scot %p ship.path)/(scot %tas space.path) ~]
    (bazaar:send-reaction [%unpin path [app-id sieve.app-lite entry] pinned.sorts.apps] paths ~)
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
    =.  index.apps          (~(uni by index.apps) index.updated-apps)
    =.  pinned.sorts.apps   order
    :: ~&  >  "set-pin-order..."
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
    ::  if this action is being performed on a remote ship (not the host/admin ship), poke
    ::    the space host to ensure "source of truth" and subscribers properly synched
    ::  track apps we've recommended to prevent multiple recommendations per ship
    =.  recommendations.my.state  (~(put in recommendations.my.state) app-id)
    ?.  =(our.bowl ship.path)
      ~&  >>  "{<dap.bowl>}: recommend received. forwarding to space host {<ship.path>}..."
      :_  state
      :~  [%pass / %agent [ship.path %bazaar] %poke bazaar-action+!>([%recommend path app-id])]
          [%give %fact [/updates]~ bazaar-reaction+!>([%my-recommendations recommendations.my.state])]
      ==
    =/  entry                     (~(got by app-catalog.state) app-id)
    =.  recommended.entry         (add recommended.entry 1)
    =.  app-catalog.state         (~(put by app-catalog.state) app-id entry)
    =/  apps                        (~(got by space-apps.state) path)
    =/  app-lite                         (~(got by index.apps) app-id)
    =.  tags.sieve.app-lite                (~(put in tags.sieve.app-lite) %recommended)
    =.  recommended.ranks.sieve.app-lite   (add recommended.ranks.sieve.app-lite 1)
    =.  index.apps                        (~(put by index.apps) app-id app-lite)
    =.  recommended.sorts.apps     (sort-apps (extract-apps index.apps %recommended) %recommended %desc)
    =.  space-apps.state  (~(put by space-apps.state) path apps)
    =/  paths  [/updates /bazaar/(scot %p ship.path)/(scot %tas space.path) ~]
    :_  state
    :~  [%give %fact [/updates]~ bazaar-reaction+!>([%my-recommendations recommendations.my.state])]
        [%give %fact paths bazaar-reaction+!>([%recommend path [app-id sieve.app-lite entry] recommended.sorts.apps])]
    ==
    :: (bazaar:send-reaction [%recommend path [app-id sieve.app-lite entry] recommended.sorts.apps] paths ~)
  ::
  ++  rem-rec
    |=  [path=space-path:spaces-store =app-id:store]
    ^-  (quip card _state)
    ::  track apps we've recommended to prevent multiple recommendations per ship
    =.  recommendations.my.state  (~(del in recommendations.my.state) app-id)
    ?.  =(our.bowl ship.path)
      ~&  >>  "{<dap.bowl>}: unrecommend received. forwarding to space host {<ship.path>}..."
      :_  state
      :~  [%pass / %agent [ship.path %bazaar] %poke bazaar-action+!>([%unrecommend path app-id])]
          [%give %fact [/updates]~ bazaar-reaction+!>([%my-recommendations recommendations.my.state])]
      ==
    =/  entry                    (~(got by app-catalog.state) app-id)
    =.  recommended.entry        ?:((gth recommended.entry 0) (sub recommended.entry 1) 0)
    =.  app-catalog.state        (~(put by app-catalog.state) app-id entry)
    =/  apps  (~(got by space-apps.state) path)
    =/  app-lite   (~(got by index.apps) app-id)
    ::  sub to below 0 will crash the agent. ensure gth value before subtracting
    =.  recommended.ranks.sieve.app-lite
      ?:  (gth recommended.ranks.sieve.app-lite 0)
        (sub recommended.ranks.sieve.app-lite 1)  %0
    ::  only remove recommended tag (relative to space) if updated recommended count is 0
    =.  tags.sieve.app-lite
      ?:  =(recommended.ranks.sieve.app-lite 0)
        (~(del in tags.sieve.app-lite) %recommended)
      tags.sieve.app-lite
    =.  index.apps  (~(put by index.apps) app-id app-lite)
    =.  recommended.sorts.apps     (sort-apps (extract-apps index.apps %recommended) %recommended %desc)
    =.  space-apps.state  (~(put by space-apps.state) path apps)
    =/  paths  [/updates /bazaar/(scot %p ship.path)/(scot %tas space.path) ~]
    :_  state
    :~  [%give %fact [/updates]~ bazaar-reaction+!>([%my-recommendations recommendations.my.state])]
        [%give %fact paths bazaar-reaction+!>([%unrecommend path [app-id sieve.app-lite entry] recommended.sorts.apps])]
    ==
  :: (bazaar:send-reaction [%unrecommend path [app-id sieve.app-lite entry] recommended.sorts.apps] paths ~)
  ::
  ++  add-ste
    |=  [path=space-path:spaces-store =app-id:store rank=@ud]
    ^-  (quip card _state)
    :: ~&  >>  "{<dap.bowl>}: suite-add => {<[path app-id rank]>}"
    =/  paths  [/updates /bazaar/(scot %p ship.path)/(scot %tas space.path) ~]
    :: ~&  >>  "{<dap.bowl>}: sending reaction {<[path app-id rank]>}"
    =/  entry            (~(got by app-catalog.state) app-id)
    =/  apps                    (~(got by space-apps.state) path)
    =.  index.apps                    (remove-at-pos index.apps rank)
    =|  sieve=sieve:store
    =.  tags.sieve               (~(put in tags.sieve) %suite)
    :: =.  tags.sieve               (~(put in tags.sieve) %installed)
    =.  suite.ranks.sieve        rank
    =.  index.apps                    (~(put by index.apps) app-id [app-id sieve])
    =.  suite.sorts.apps     (sort-apps (extract-apps index.apps %suite) %suite %asc)
    :: ~&  >  "add-ste..."
    =.  space-apps.state              (~(put by space-apps.state) path apps)
    :: ~&  >>  "{<dap.bowl>}: suite-add {<[path [app-id sieve app]]>}"
    (bazaar:send-reaction [%suite-add path [app-id sieve entry] suite.sorts.apps] paths ~)
  ::
  ++  rem-ste
    |=  [path=space-path:spaces-store =app-id:store]
    ^-  (quip card _state)
    =/  entry            (~(got by app-catalog.state) app-id)
    =/  apps                (~(got by space-apps.state) path)
    =/  app-lite                 (~(got by index.apps) app-id)
    =.  tags.sieve.app-lite        (~(del in tags.sieve.app-lite) %suite)
    =.  index.apps                (~(put by index.apps) app-id app-lite)
    =.  suite.sorts.apps     (sort-apps (extract-apps index.apps %suite) %suite %asc)
    :: ~&  >  "rem-ste..."
    =.  space-apps.state    (~(put by space-apps.state) path apps)
    =/  paths  [/updates /bazaar/(scot %p ship.path)/(scot %tas space.path) ~]
    (bazaar:send-reaction [%suite-remove path [app-id sieve.app-lite entry] suite.sorts.apps] paths ~)
  ::
  ++  install-app
    |=  [=ship =desk]
    ^-  (quip card _state)
    :: ~&  >  "{<dap.bowl>}: install-app {<[ship desk]>}"
    =/  allies=update:ally:treaty  .^(update:ally:treaty %gx /(scot %p our.bowl)/treaty/(scot %da now.bowl)/allies/noun)
    :: ~&  >  "{<dap.bowl>}: install-app {<[allies]>}"
    ::  is the ship already an ally? if not, we'll have to add them as an ally
    ::   then once alliance is completed, trigger docket to install
    ?>  ?=(%ini -.allies)
    ?.  (~(has by init.allies) ship)
      :: %-  (slog leaf+"{<ship>} not an ally. adding {<ship>} as ally..." ~)
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
      :: %-  (slog leaf+"adding {<[app-id updated-app]>} to apps..." ~)
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
    :: ?~  apps  acc
    :: ~&  >  "{<dap.bowl>}: sending {<space-path>}..."
    (~(put by acc) space-path [?~(apps ~ u.apps) sorts])
  ::
  ++  space-initial
    |=  =space-path:spaces-store
    ^-  app-index-full:store
    =/  apps  (~(got by space-apps.state) space-path)
    %-  ~(rep by index.apps)
    |:  [[=app-id:store =app-lite:store] acc=`app-index-full:store`~]
    ?:  (is-system-app app-id)  acc
    =/  entry  (~(got by app-catalog.state) app-id)
    =|  app-full=app-full:store
    =.  id.app-full                 app-id
    =.  sieve.app-full              sieve.app-lite
    =.  entry.app-full              entry
    =.  recommended.entry.app-full  *@ud
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
      ?:  (is-system-app app-id)
        :: ~&  >>  "{<dap.bowl>}: is-system-app %.y"
        acc
      :: skip if filter is neither %all nor the app tagged with tag
      ?.  ?|  =(tag ~)
              ?&  !=(tag ~)
                  (~(has in tags.sieve.app-lite) (need tag))
              ==
          ==  acc
      :: =/  charge  (~(get by charges.state) app-id)

      =/  entry  (~(get by app-catalog.state) app-id)
      =|  app-full=app-full:store
      =.  id.app-full        app-id
      =.  sieve.app-full     sieve.app-lite
      ?~  entry
        ~&  >>>  "{<dap.bowl>}: app {<app-id>} not found."
        =.  entry.app-full     [%0 [%missing ~]]
        (~(put by acc) app-id app-full)
      :: =.  tags.sieve.app-full  (~(put in tags.sieve.app-full) %installed)
      =.  entry.app-full      u.entry
      (~(put by acc) app-id app-full)
    ?~(result ~ (some result))
  ::
  ++  is-system-app
    |=  [=app-id:store]
    ^-  ?
    ::
    ::  per Trent's request (https://github.com/holium/realm/pull/148)
    ::   "We should filter out the %courier, %realm, and %system apps from
    ::      the app list since they don't do anything and are really backends."
    ?:  ?|  =(app-id %courier)
            =(app-id %realm)
            =(app-id %garden)
        ==
      %.y  %.n
  ::
  ++  catalog
    |=  [charges=(map desk charge:docket)]
    ^-  app-catalog:store
    %-  ~(rep by charges)
    |:  [[=desk =charge:docket] acc=`app-catalog:store`~]
    (~(put by acc) desk [%0 [%urbit docket.charge %.y]])
  ::
  ++  index
    |=  [charges=(map desk charge:docket)]
    ^-  app-index-lite:store
    %-  ~(rep by charges)
    |=  [[=desk =charge:docket] acc=app-index-lite:store]
      =|  app=app-lite:store
      =.  id.app          desk
      :: =.  ship.app  our.bowl
      :: =.  tags.sieve.app    (~(put in tags.sieve.app) %installed)
      =.  ranks.sieve.app   [0 0 0]
      (~(put by acc) desk app)
  ::
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
    %my-recommendations  `state
  ==
  ::
  ++  on-initial
    |=  [=space-apps-full:store =my:store]
    ^-  (quip card _state)
    `state
  ::
  ::  this reaction comes in as a result of accepting an invitation
  ::   to a space and then subscribing to the space-path
  ++  on-space-apps
    |=  [=space-path:spaces-store =app-index-full:store =sorts:store sites=(set [=ship =desk])]
    ^-  (quip card _state)
    ::  get all of 'our' installed apps on this ship, and compare it to the list of
    ::   space apps to determine the installation status of the app
    =/  =charge-update:docket  .^(charge-update:docket %gx /(scot %p our.bowl)/docket/(scot %da now.bowl)/charges/noun)
    ?>  ?=([%initial *] charge-update)
    :: only if this reaction originated remotely should we attempt to process it
    ?:  =(our.bowl src.bowl)  `state
    =/  result=[=app-index-full:store =app-index-lite:store]
    %-  ~(rep by app-index-full)
    |=  [[=app-id:store =app-full:store] acc=[=app-index-full:store =app-index-lite:store]]
    ::  is this app installed?
    =/  app-full
    ?+  -.app.entry.app-full  app-full
       ::
       %urbit
        =.  installed.app.entry.app-full   (~(has by initial.charge-update) app-id)
        app-full
    ==
    =/  app-index-full         (~(put by app-index-full.acc) app-id app-full)
    =.  app-catalog.state      (~(put by app-catalog.state) app-id entry.app-full)
    =.  app-index-lite.acc     (~(put by app-index-lite.acc) app-id [app-id sieve.app-full])
    acc
    :: ~&  >  "on-space-apps..."
    =.  space-apps.state    (~(put by space-apps.state) space-path [app-index-lite.result sorts])
    =.  sites.state         sites
    :: =.  app-catalog.state   (~(gas by app-catalog.state) ~(tap by app-catalog.result))
    :: :_  state(app-catalog (~(gas by app-catalog.state) ~(tap by app-catalog.result)))
    :: notify the UI of that we've accepted an invite to a new space and there
    ::   are apps available in this new space
    (bazaar:send-reaction:core [%space-apps space-path app-index-full sorts sites] [/updates ~] ~)
  ::
  ++  on-pin
    |=  [path=space-path:spaces-store =app-full:store ord=(list app-id:store)]
    ^-  (quip card _state)
    ~&  >  "{<dap.bowl>}: bazaar-reaction [pin] => {<[path app-full ord]>}"
    :: only if this reaction originated remotely should we attempt to process it
    ?:  =(our.bowl src.bowl)    `state
    =/  app-id                  id.app-full
    =/  app-full                (update-status app-full)
    =.  app-catalog.state       (~(put by app-catalog.state) id.app-full entry.app-full)
    =/  apps                    (~(get by space-apps.state) path)
    =/  apps                    ?~(apps [index=*app-index-lite:store sorts=*sorts:store] u.apps)
    =/  app                     (~(get by index.apps) id.app-full)
    =/  app                     ?~(app [id=id.app-full sieve=*sieve:store] u.app)
    =.  sieve.app               sieve.app-full
    :: =/  app                     (update-installed-status app)
    =/  index                   (~(put by index.apps) id.app app)
    =.  pinned.sorts.apps        ord
    =.  space-apps.state        (~(put by space-apps.state) path [index sorts.apps])
    =/  paths                   [/updates ~]
    (bazaar:send-reaction [%pin path app-full ord] paths ~)
  ::
  ++  on-unpin
    |=  [path=space-path:spaces-store =app-full:store ord=(list app-id:store)]
    ^-  (quip card _state)
    ~&  >  "{<dap.bowl>}: bazaar-reaction [unpin] => {<[path app-full ord]>}"
    :: only if this reaction originated remotely should we attempt to process it
    ?:  =(our.bowl src.bowl)    `state
    =/  app-id                  id.app-full
    =/  app-full                (update-status app-full)
    =.  app-catalog.state       (~(put by app-catalog.state) id.app-full entry.app-full)
    =/  apps                    (~(get by space-apps.state) path)
    =/  apps                    ?~(apps [index=*app-index-lite:store sorts=*sorts:store] u.apps)
    =/  app                     (~(get by index.apps) id.app-full)
    =/  app                     ?~(app [id=id.app-full sieve=*sieve:store] u.app)
    =.  sieve.app               sieve.app-full
    :: =/  app                     (update-installed-status app)
    =/  index                   (~(put by index.apps) id.app app)
    =.  pinned.sorts.apps        ord
    =.  space-apps.state        (~(put by space-apps.state) path [index sorts.apps])
    =/  paths                   [/updates ~]
    (bazaar:send-reaction [%unpin path app-full ord] paths ~)
  ::
  ++  on-set-pin-order
    |=  [path=space-path:spaces-store ord=(list app-id:store)]
    ^-  (quip card _state)
    ~&  >  "{<dap.bowl>}: bazaar-reaction [set-pin-order] => {<[path ord]>}"
    :: only if this reaction originated remotely should we attempt to process it
    ?:  =(our.bowl src.bowl)  `state
    =/  apps                    (~(get by space-apps.state) path)
    =/  apps                    ?~(apps [index=*app-index-lite:store sorts=*sorts:store] u.apps)
    =.  pinned.sorts.apps    ord
    =.  space-apps.state     (~(put by space-apps.state) path [index.apps sorts.apps])
    =/  paths                [/updates /our ~]
    (bazaar:send-reaction [%set-pin-order path ord] paths ~)
  ::
  ++  on-rec
    |=  [path=space-path:spaces-store =app-full:store ord=(list app-id:store)]
    ^-  (quip card _state)
    ~&  >  "{<dap.bowl>}: bazaar-reaction [recommended] => {<[path app-full]>}"
    :: only if this reaction originated remotely should we attempt to process it
    ?:  =(our.bowl src.bowl)    `state
    =/  app-id                  id.app-full
    =/  app-full                (update-status app-full)
    =.  app-catalog.state       (~(put by app-catalog.state) id.app-full entry.app-full)
    =/  apps                    (~(get by space-apps.state) path)
    =/  apps                    ?~(apps [index=*app-index-lite:store sorts=*sorts:store] u.apps)
    =/  app                     (~(get by index.apps) id.app-full)
    =/  app                     ?~(app [id=id.app-full sieve=*sieve:store] u.app)
    =.  sieve.app               sieve.app-full
    :: =/  app                     (update-installed-status app)
    =/  index                   (~(put by index.apps) id.app app)
    =.  recommended.sorts.apps        ord
    =.  space-apps.state        (~(put by space-apps.state) path [index sorts.apps])
    =/  paths                   [/updates ~]
    (bazaar:send-reaction [%recommend path app-full ord] paths ~)
  ::
  ++  on-unrec
    |=  [path=space-path:spaces-store =app-full:store ord=(list app-id:store)]
    ^-  (quip card _state)
    ~&  >  "{<dap.bowl>}: bazaar-reaction [unrecommended] => {<[path app-full]>}"
    :: only if this reaction originated remotely should we attempt to process it
    ?:  =(our.bowl src.bowl)    `state
    =/  app-id                  id.app-full
    =/  app-full                (update-status app-full)
    =.  app-catalog.state       (~(put by app-catalog.state) id.app-full entry.app-full)
    =/  apps                    (~(get by space-apps.state) path)
    =/  apps                    ?~(apps [index=*app-index-lite:store sorts=*sorts:store] u.apps)
    =/  app                     (~(get by index.apps) id.app-full)
    =/  app                     ?~(app [id=id.app-full sieve=*sieve:store] u.app)
    =.  sieve.app               sieve.app-full
    :: =/  app                     (update-installed-status app)
    =/  index                   (~(put by index.apps) id.app app)
    =.  recommended.sorts.apps        ord
    =.  space-apps.state        (~(put by space-apps.state) path [index sorts.apps])
    =/  paths                   [/updates ~]
    (bazaar:send-reaction [%unrecommend path app-full ord] paths ~)
  ::
  ++  on-suite-add
    |=  [path=space-path:spaces-store =app-full:store ord=(list app-id:store)]
    ^-  (quip card _state)
    ~&  >  "{<dap.bowl>}: bazaar-reaction [on-suite-add] => {<[path app-full ord our.bowl src.bowl]>}"
    :: only if this reaction originated remotely should we attempt to process it
    ?:  =(our.bowl src.bowl)    `state
    =/  app-id                  id.app-full
    =/  app-full                (update-status app-full)
    =.  app-catalog.state       (~(put by app-catalog.state) id.app-full entry.app-full)
    =/  apps                    (~(get by space-apps.state) path)
    =/  apps                    ?~(apps [index=*app-index-lite:store sorts=*sorts:store] u.apps)
    =/  app                     (~(get by index.apps) id.app-full)
    =/  app                     ?~(app [id=id.app-full sieve=*sieve:store] u.app)
    =.  sieve.app               sieve.app-full
    =/  index                   (~(put by index.apps) id.app app)
    =.  suite.sorts.apps        ord
    =.  space-apps.state        (~(put by space-apps.state) path [index sorts.apps])
    =/  paths                   [/updates ~]
    (bazaar:send-reaction [%suite-add path app-full ord] paths ~)
  ::
  ++  on-suite-rem
    |=  [path=space-path:spaces-store =app-full:store ord=(list app-id:store)]
    ^-  (quip card _state)
    ~&  >  "{<dap.bowl>}: bazaar-reaction [on-suite-rem] => {<[path app-full]>}"
    :: only if this reaction originated remotely should we attempt to process it
    ?:  =(our.bowl src.bowl)    `state
    =/  app-id                  id.app-full
    =/  app-full                (update-status app-full)
    =.  app-catalog.state       (~(put by app-catalog.state) id.app-full entry.app-full)
    =/  apps                    (~(get by space-apps.state) path)
    =/  apps                    ?~(apps [index=*app-index-lite:store sorts=*sorts:store] u.apps)
    =/  app                     (~(get by index.apps) id.app-full)
    =/  app                     ?~(app [id=id.app-full sieve=*sieve:store] u.app)
    =.  sieve.app               sieve.app-full
    :: =/  app                     (update-installed-status app)
    =/  index                   (~(put by index.apps) id.app app)
    =.  suite.sorts.apps        ord
    =.  space-apps.state        (~(put by space-apps.state) path [index sorts.apps])
    =/  paths                   [/updates ~]
    (bazaar:send-reaction [%suite-remove path app-full ord] paths ~)
  ::
  ++  on-set-suite-order
    |=  [path=space-path:spaces-store ord=(list app-id:store)]
    ^-  (quip card _state)
    ~&  >  "{<dap.bowl>}: bazaar-reaction [set-suite-order] => {<[path ord]>}"
    :: only if this reaction originated remotely should we attempt to process it
    ?:  =(our.bowl src.bowl)  `state
    =/  apps                    (~(get by space-apps.state) path)
    =/  apps                    ?~(apps [index=*app-index-lite:store sorts=*sorts:store] u.apps)
    =.  suite.sorts.apps     ord
    =.  space-apps.state     (~(put by space-apps.state) path [index.apps sorts.apps])
    =/  paths                [/updates /our ~]
    (bazaar:send-reaction [%set-suite-order path ord] paths ~)
  --
::
++  update-status
  |=  [=app-full:store]
  ^-  app-full:store
  ?.  =(%urbit -.app.entry.app-full)  app-full
  =/  =charge-update:docket  .^(charge-update:docket %gx /(scot %p our.bowl)/docket/(scot %da now.bowl)/charges/noun)
  ?>  ?=([%initial *] charge-update)
  ?>  ?=(%urbit -.app.entry.app-full)
  =.  installed.app.entry.app-full  (~(has by initial.charge-update) id.app-full)
  app-full
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

::
++  sites
  ^-  (set [ship desk])
  =/  allies=update:ally:treaty  .^(update:ally:treaty %gx /(scot %p our.bowl)/treaty/(scot %da now.bowl)/allies/noun)
  ?>  ?=(%ini -.allies)
  %-  ~(rep by init.allies)
  |=  [[=ship =alliance:alliance:treaty] acc=(set [=ship =desk])]
  (~(uni in acc) alliance)

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
    :: ~&  >>  "{<dap.bowl>}: treaty-update [on-initial] => {<init>}"
    :: %glob  (bazaar:send-reaction:core [%initial-treaties desk [%urbit docket.charge]] [/updates ~])
    `state
  ::
  ++  on-add
    |=  [=treaty:treaty]
    ^-  (quip card _state)
    :: ~&  >>  "{<dap.bowl>}: treaty-update [on-add] => {<[treaty]>}"
    ::  do we have a pending installation request for this ship/desk?
    =/  installation  (~(get by installations.state) ship.treaty)
    ?~  installation
      (bazaar:send-reaction:core [%treaty-added [ship.treaty desk.treaty] docket.treaty] [/updates ~] ~)
    ::
    :: ~&  >>  "{<dap.bowl>}: [on-new] => testing {<u.installation>} = {<desk.treaty>}..."
    ?.  =(u.installation desk.treaty)
      (bazaar:send-reaction:core [%treaty-added [ship.treaty desk.treaty] docket.treaty] [/updates ~] ~)
    :: ~&  >>  "{<dap.bowl>}: [on-new] => triggering install {<[ship.treaty desk.treaty]>}..."
    =/  install-poke  [%pass /docket-install %agent [our.bowl %docket] %poke docket-install+!>([ship.treaty desk.treaty])]~
    ::  trigger docker install
    :: :_  state
    (bazaar:send-reaction:core [%treaty-added [ship.treaty desk.treaty] docket.treaty] [/updates ~] install-poke)
  ::
  ++  on-del
    |=  [=ship =desk]
    ^-  (quip card _state)
    :: ~&  >>  "{<dap.bowl>}: treaty-update [on-del] => {<[ship desk]>}"
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
    :: ~&  >>  "{<dap.bowl>}: ally-update [on-initial] => {<init>}"
    `state
  ::
  ++  on-new
    |=  [=ship =alliance:treaty]
    ^-  (quip card _state)
    :: ~&  >>  "{<dap.bowl>}: ally-update [on-new] => {<[ship alliance]>}"
    :: (bazaar:send-reaction:core [%new-ally-added [ship.treaty desk.treaty] [%urbit docket.charge]] [/updates ~])
    `state
  ::
  ++  on-add
    |=  [=ship]
    ^-  (quip card _state)
    :: =/  =update:treaty:treaty  .^(update:treaty:treaty %gx /(scot %p our.bowl)/treaty/(scot %da now.bowl)/treaties/(scot %p ship)/noun)
    :: ~&  >>  "{<dap.bowl>}: ally-update [on-add] => {<[ship]>}"
    `state
  ::
  ++  on-del
    |=  [=ship]
    ^-  (quip card _state)
    :: ~&  >>  "{<dap.bowl>}: ally-update [on-del] => {<[ship]>}"
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
    :: ~&  >>  "{<dap.bowl>}: charge-update [initial] received. {<initial>}"
    `state
  ::
  ++  add
    |=  [=desk =charge:docket]
    ^-  (quip card _state)
    :: ~&  >>  "{<dap.bowl>}: charge-update [add-charge] received. {<desk>}, {<charge>}"
    :: only if done (head is %glob). see garden/sur/docket.hoon for more details
    ?+  -.chad.charge  `state
      %glob
        ::  once fully installed, remove the installation entry from state
        :: ~&  >>  "{<dap.bowl>}: charge-update [add-charge] {<desk>}, {<charge>}. app fully installed. adding to bazaar catalog..."
        =/  entry  (~(get by app-catalog.state) desk)
        =/  entry  ?~  entry  [%0 [%urbit docket.charge %.y]]
          ?>  ?=(%urbit -.app.u.entry)
          =.  installed.app.u.entry  %.y
          =.  docket.app.u.entry  docket.charge
          u.entry
        =.  app-catalog.state  (~(put by app-catalog.state) desk entry)
        ?.  ?=(%glob -.href.docket.charge)
         (bazaar:send-reaction:core [%app-installed desk [%urbit docket.charge %.y]] [/updates ~] ~)
        =/  loc  location.glob-reference.href.docket.charge
        ?.  ?=(%ames -.loc)
          (bazaar:send-reaction:core [%app-installed desk [%urbit docket.charge %.y]] [/updates ~] ~)
        =/  app-ship      ship.loc
        =/  installation  (~(get by installations.state) app-ship)
        ?~  installation
          (bazaar:send-reaction:core [%app-installed desk [%urbit docket.charge %.y]] [/updates ~] ~)
        =.  installations.state  (~(del by installations.state) app-ship)
        (bazaar:send-reaction:core [%app-installed desk [%urbit docket.charge %.y]] [/updates ~] ~)
    ==
  ::
  ++  rem
    |=  [=desk]
    ^-  (quip card _state)
    ~&  >>  "{<dap.bowl>}: charge-update [del-charge] received. {<desk>}"
    =/  entry  (~(get by app-catalog.state) desk)
    ?~  entry  `state
    ?>  ?=(%urbit -.app.u.entry)
    =.  installed.app.u.entry  %.n
    =.  app-catalog.state  (~(put by app-catalog.state) desk u.entry)
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
    %remote-space   (on-remote-space +.rct)
  ==
  ::
  ++  on-initial
    |=  [spaces=spaces:spaces-store =membership:membership-store]
    ^-  (quip card _state)
    ::  sets the initial spaces maps properly
    =/  spaces-map=space-apps-lite:store
    %-  ~(rep by spaces)
      |=  [[path=space-path:spaces-store =space:spaces-store] acc=(map space-path:spaces-store [index=app-index-lite:store =sorts:store])]
    ?:  =(space.path 'our')  acc
      (~(put by acc) path.space [*app-index-lite:store *sorts:store])
    =/  subscriptions=(list card)
    %-  ~(rep by spaces)
      |=  [[path=space-path:spaces-store =space:spaces-store] acc=(list card)]
        ?:  =(space.path 'our')  acc
        =/  watch-path    [/bazaar/(scot %p ship.path)/(scot %tas space.path)]
        %-  (slog leaf+"{<dap.bowl>}: subscribing to {<watch-path>}..." ~)
        (snoc acc [%pass watch-path %agent [ship.path %bazaar] %watch watch-path])
    :: %-  (slog leaf+"{<dap.bowl>}: spaces [initial] reaction processed. leaving channel and resubscribing to %our wire..." ~)
    :: =/  rejoin-our=(list card)
    ::   :~  [%pass /spaces %agent [our.bowl %spaces] %leave ~]
    ::       [%pass /spaces %agent [our.bowl %spaces] %watch /updates]
    ::   ==
    =.  space-apps.state    (~(uni by spaces-map) space-apps.state)
    :: [(weld subscriptions rejoin-our) state]
    `state
  ::
    ++  skim-our
      |=  [path=space-path:spaces-store =space:spaces-store]
      ?:  =(space.path 'our')  %.n
      %.y
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
    =.  space-apps.state      (~(del by space-apps.state) path)
    ~&  >  ['%bazaar spaces on remove' path]
    :_  state
    ~[[%pass /bazaar/(scot %p ship.path)/(scot %tas space.path) %agent [ship.path %bazaar] %leave ~]]
    :: [%pass /bazaar/(scot %p ship.path)/(scot %tas space.path) %agent [ship.path %bazaar] %leave ~]
    :: `state(space-apps (~(del by space-apps.state) path)) :: , membership (~(del by membership.state) path))
  ::
  ++  on-remote-space
    |=  [path=space-path:spaces-store space=space:spaces-store =members:membership-store]
    ^-  (quip card _state)
    ::  no need to subscribe to our own ship's bazaar. we're already getting all updates
    ?:  =(our.bowl ship.path)  `state
    %-  (slog leaf+"{<dap.bowl>}: on-space-initial:spaces-reaction => subscribing to bazaar @ {<path>}..." ~)
    =/  watch-path    [/bazaar/(scot %p ship.path)/(scot %tas space.path)]
    :_  state
    :~  [%pass watch-path %agent [ship.path %bazaar] %watch watch-path]
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
    ~&  >  ['bazaar check-member' our.bowl ship]
    ^-  ?
    =/  member   .^(view:membership-store %gx /(scot %p our.bowl)/spaces/(scot %da now.bowl)/(scot %p ship.path)/(scot %tas space.path)/is-member/(scot %p ship)/noun)
    ?>  ?=(%is-member -.member)
    is-member.member
  --
::
::
++  is-host
  |=  [=ship]
  =(our.bowl ship)
--