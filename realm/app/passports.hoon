::  people [realm]:
::
::  People management within Realm
::
::    ## Scry paths
::
::    /x/spaces/[ship]/[space]/people.hoon
::      All people in a given realm space
::
::    ## Subscription paths
::
::    /people:
::      A stream of the current updates to the state, sending the initial state
::      upon subscribe.
::
::    ##  Pokes
::
::    %people-action:
::      add, edit, replace, and remove people
::
::    ##  Watches
::      listens for %spaces /updates. handles %spaces synch'ing thru
::      %initial reaction.  handles other reactions generated by %spaces
::       agent when adding spaces are changing people permissions
::
::
/-  store=passports, contact-store, spaces, membership-store=membership, hark=hark-store, resource
/+  dbug, default-agent, resource, lib=passports
|%
+$  card  card:agent:gall
+$  versioned-state
    $%  state-0
    ==
+$  state-0
  $:  %0
      =districts:store
      :: =passports:store
      =people:store
      =contacts:store
      allowed-groups=(set resource)
      allowed-ships=(set ship)
      is-public=_|
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
  ++  on-init  :: on-init:def
    ^-  (quip card _this)
    :_  this
    ::  %watch: get the initial contact list and watch for updates
    :~  ::  [%pass /contacts %agent [our.bowl %contact-store] %watch /all]
        :: watch spaces to get notifications when people related areas
        ::   of spaces change (e.g. create, edit, remove)
        [%pass /spaces %agent [our.bowl %spaces] %watch /updates]
    ==
  ::
  ++  on-save  ::on-save:def
    ^-  vase
    !>(state)
  ::
  ++  on-load  ::on-load:def
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
      %passports-action  (act:core !<(action:store vase))
    ==
    [cards this]
  ::
  ++  on-leave  on-leave:def
  ::
  ++  on-watch  on-watch:def
  ::
  ++  on-peek
    |=  =path
    ^-  (unit (unit cage))
    ?+    path  (on-peek:def path)
    ::
    ::  ~/scry/people/~zod/our/passports.json
    ::
      [%x @ @ %passports ~]
        =/  =ship       (slav %p i.t.path)
        =/  space-pth   `@t`i.t.t.path
        ~&  >>  "{<ship>}, {<space-pth>}"
        =/  passports   (~(get by districts.state) [ship space-pth])
        ?~  passports      ``json+!>(~)
        ``json+!>((view:enjs:lib [%passports u.passports]))

    ::
    ::  ~/scry/people/~zod/our/people.json
    ::
      [%x @ @ ~]
        =/  =ship       (slav %p i.t.path)
        =/  space-pth   `@t`i.t.t.path
        ``json+!>((view:enjs:lib [%people people.state]))
    ==
  ::
  ++  on-agent
    |=  [=wire =sign:agent:gall]
    ^-  (quip card _this)
    =/  wirepath  `path`wire
    ?+    wire  (on-agent:def wire sign)
      :: handle updates coming in from contact store
      [%contacts ~]
        ?+    -.sign  (on-agent:def wire sign)
          %watch-ack
            ?~  p.sign  `this
            ~&  >>>  "{<dap.bowl>}: contact-store subscription failed"
            `this
      ::
          %kick
            ~&  >  "{<dap.bowl>}: contact-store kicked us, resubscribing..."
            :_  this
            :~  [%pass /contacts %agent [our.bowl %contact-store] %watch /all]
            ==
      ::
          %fact
            ?+    p.cage.sign  (on-agent:def wire sign)
                %contact-update-0
                  =/  action  !<(=update:contact-store q.cage.sign)
                  ?+  -.action  (on-agent:def wire sign)
                    ::  initial update is sent when first subscribing to the contact store.
                    ::    this action includes all of this ship's contacts. take this opportunity
                    ::    to retrieve the full contact list
                    ::
                    %initial
                      =^  cards  state
                        (on-contacts-initial:core action)
                      [cards this]
                    ::
                    %edit
                      =^  cards  state
                        (on-contact-edit:core action)
                      [cards this]
                    ::
                    %set-public
                      =^  cards  state
                        (on-contact-set-public:core action)
                      [cards this]
                    ::
                    %disallow
                      =^  cards  state
                        (on-contact-disallow:core action)
                      [cards this]
                    ::
                    %allow
                      =^  cards  state
                        (on-contact-allow:core action)
                      [cards this]
                  ==
            ==
        ==

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
            ?+    p.cage.sign     (on-agent:def wire sign)
                %spaces-reaction
                  =/  rct  !<(=spaces-reaction:spaces q.cage.sign)
                  =^  cards  state
                  ?-  -.rct :: (on-agent:def wire sign)
                    %initial  (on-spaces-initial:core rct)
                    %add      (on-spaces-add:core rct)
                    %replace  (on-spaces-replace:core rct)
                    %remove   (on-spaces-remove:core rct)
                  ==
                  [cards this]
                ::
                %invite-reaction
                  =/  rct  !<(=invite-reaction:spaces q.cage.sign)
                  =^  cards  state
                  ?-  -.rct
                    %invite-sent      (handle-sent:on-invite-reaction +.rct)
                    %invite-accepted  (handle-accepted:on-invite-reaction +.rct)
                  ==
                  [cards this]
            ==
        ==
    ==
  ::
  ++  on-arvo  on-arvo:def
  ::
  ++  on-fail   on-fail:def
  --
|_  [=bowl:gall cards=(list card)]
::
++  core  .
::  invite (watch) handling
++  inv
  |%
  ++  on
    |=  [=invite-reaction:sp-sur]
    ^-  (quip card _state)
    ::  only handle reactions this agent
    ::  is interested in ignore all other reactions
    ?+  -.invite-reaction  `state
      %invite-accepted  (acc +.invite-reaction)
    ==
  ::
  ::  $acc:  on invite-accepted, began watching
  ++  acc
    |=  [path=space-path:sp-sur =space:sp-sur]
    :_  state
    :~  [%pass /spaces/(scot %tas space.path) %agent [our.bowl dap.bowl] %watch /updates]
    ==
  --
::
++  act
  |=  =action:store
  ^-  (quip card _state)
  ?-  -.action
    %add         (handle-add +.action)
    %remove      (handle-remove +.action)
    %edit        (handle-edit +.action)
    %ping        (handle-ping +.action)
  ==
::
::  $handle-add: add a new person to the person store, while
::    also adding a new space entry to track ship/role relationships
++  handle-add
  |=  [path=space-path:spaces =ship =payload:store]
  ^-  (quip card _state)
  =/  passports  (~(get by districts) path)
  ?~  passports
    ~&  >>  "{<dap.bowl>}: handle-add - {<path>} not found"
    `state
  ?:  (~(has by u.passports) ship)
    ~&  >>>  "{<dap.bowl>}: handle-add - {<ship>} already exists"
    `state
  ::  if needed, add a create method; otherwise the statement below
  ::    will construct a passport object w/ defaults based on types
  =|  passport=passport:store
  ::  update the passport instance with values from the attributes
  =/  passport  (update-passport passport payload)
  ::  put updated passport back in passports map
  =/  passports  (~(put by u.passports) ship passport)
  =/  notify=action:hark  (notify path /invite (crip " issued you a passport to the {<`@t`(scot %tas space.path)>} space in Realm."))
  :_  state(people (~(put by people) ship *person:store), districts (~(put by districts) path passports))
  :~  [%give %fact [/updates ~] %passports-reaction !>([%add path ship *person:store passport])]
      [%pass / %agent [our.bowl %hark-store] %poke hark-action+!>(notify)]
  ==
::
::  $handle-remove: remove all person artifacts across all stores
::    this differs from %kick which only removes a person from a space
++  handle-remove
  |=  [path=space-path:spaces =ship]
  ^-  (quip card _state)
  =/  passports  (~(get by districts) path)
  ?~  passports
    ~&  >>  "{<dap.bowl>}: handle-remove - {<path>} not found"
    `state
  =/  passports  (~(del by u.passports) ship)
  `state(people (~(del by people) ship), districts (~(put by districts) path passports))
::
::  $handle-edit: modify a person attribute.
::    note that $alias values are space specific; therefore, editing
::    the alias changes the membership store and not people store
++  handle-edit
  |=  [path=space-path:spaces =ship =payload:store]
  ^-  (quip card _state)
  =/  passports  (~(get by districts) path)
  ?~  passports
    ~&  >>  "{<dap.bowl>}: handle-edit - {<path>} not found"
    `state
  =/  passport  (~(get by u.passports) ship)
  ?~  passport
    ~&  >>>  "{<dap.bowl>}: handle-edit - {<ship>} not found"
    `state
  ::  update existing civ based on attributes
  =/  passport  (update-passport u.passport payload)
  ::  put updated civ back in civs map
  =/  passports  (~(put by u.passports) ship passport)
  `state(districts (~(put by districts) path passports))
::
::  $update-civ: update the civilian based on the updated attributes (fields)
++  update-passport
|=  [=passport:store =payload:store]
^-  passport:store
%-  ~(rep in payload)
:: |=  [attribute=edit-field:store rslt=civ:store]
|:  [=mod:store acc=`passport:store`passport]
?-  -.mod
  %alias         acc(alias alias.mod)
  %add-roles     acc(roles (~(gas in roles.passport) ~(tap in roles.mod)))
  %remove-roles  acc(roles (~(dif in roles.passport) roles.mod))
==
::
::  $handle-ping: %ping pokes come in from UI to indicate user is
::    actively using Realm. we record the timestamp of this ping and
::    then forward (reaction) our status to all subscribers
::
++  handle-ping
  |=  [msg=(unit @t)]
  ^-  (quip card _state)
  =/  per  (~(get by people.state) our.bowl)
  ?~  per  `state
  =.  last-known-active.u.per  (some now.bowl)
  :_  state(people (~(put by people.state) our.bowl u.per))
  :~  [%give %fact [/updates ~] %passports-reaction !>([%pong our.bowl now.bowl])]
  ==
::
++  on-invite-reaction
  |%
  ::
  ++  handle-sent
    |=  [path=space-path:spaces =invite:spaces]
    ^-  (quip card _state)
    ~&  >  [path invite]
    `state
  ::
  ++  handle-accepted
    |=  [path=space-path:spaces =ship =member:membership-store]
    ^-  (quip card _state)
    ~&  >  [path ship member]
    `state
  ::
  --
::
::  $on-contacts-initial: imports initial contact list
::    from %contact-store when the agent starts
::
++  on-contacts-initial
  |=  [=update:contact-store]
  ?>  ?=(%initial -.update)
  ::  stuff all contacts under the %contact key in state
  `state(contacts (~(gas by contacts.state) ~(tap by rolodex.update)))
::
++  on-contact-edit
  |=  [=update:contact-store]
  ?>  ?=(%edit -.update)
  =/  edit  edit-field.update
  =/  person  (~(got by contacts.state) ship.update)
  =/  updated-person
  ?-  -.edit
    %nickname  person(nickname nickname.edit)
    %bio       person(bio bio.edit)
    %status    person(status status.edit)
    %color     person(color color.edit)
    %avatar    person(avatar avatar.edit)
    %cover     person(cover cover.edit)
  ::
      %add-group
    person(groups (~(put in groups.person) resource.edit))
  ::
      %remove-group
    person(groups (~(del in groups.person) resource.edit))
  ==
  `state(contacts (~(put by contacts.state) ship.update updated-person))
::
++  on-contact-set-public
  |=  [=update:contact-store]
  ?>  ?=(%set-public -.update)
  ::  realm's is-public flag is sync'd with the contact app's public flag
  `state(is-public public.update)
::
++  on-contact-disallow
  |=  [=update:contact-store]
  ?>  ?=(%disallow -.update)
  ::  beings management is sync'd with contact apps beings management
  =/  =beings:contact-store  +.update
  ?-  -.beings
    %group  `state(allowed-groups (~(del in allowed-groups) resource.beings))
    %ships  `state(allowed-ships (~(dif in allowed-ships) ships.beings))
  ==
::
++  on-contact-allow
  |=  [=update:contact-store]
  ?>  ?=(%allow -.update)
  ::  beings management is sync'd with contact apps beings management
  =/  =beings:contact-store  +.update
  ?-  -.beings
    %group  `state(allowed-groups (~(put in allowed-groups) resource.beings))
    %ships  `state(allowed-ships (~(uni in allowed-ships) ships.beings))
  ==
::
++  on-spaces-initial
  |=  [rct=spaces-reaction:spaces]
  ^-  (quip card _state)
  ?>  ?=(%initial -.rct)
  =/  districts
  %-  ~(rep by membership.rct)
  |=  [[path=space-path:spaces =members:membership-store] acc=districts:store]
  =/  passes  (to-passports members)
  (~(put by acc) path passes)
  `state(districts districts)
::
++  on-spaces-add
  |=  [rct=spaces-reaction:spaces]
  ^-  (quip card _state)
  ?>  ?=(%add -.rct)
  =/  passports=(map ship passport:store)  (to-passports members.rct)
  `state(districts (~(put by districts) path.space.rct passports))
::
++  to-passports
  |=  =members:membership-store
  ^-  passports:store
  %-  ~(rep by members)
  |=  [[=ship =member:membership-store] passports=(map ship passport:store)]
  =|  passport=passport:store
  =.  alias.passport  ''
  =.  roles.passport    roles.member
  =.  status.passport   status.member
  (~(put by passports) ship passport)
::
++  on-spaces-replace
  |=  [rct=spaces-reaction:spaces]
  ^-  (quip card _state)
  ?>  ?=(%replace -.rct)
  `state
::
++  on-spaces-remove
  |=  [rct=spaces-reaction:spaces]
  ^-  (quip card _state)
  ?>  ?=(%remove -.rct)
  `state(districts (~(del by districts) path.rct))
::
++  notify
  |=  [pth=space-path:spaces slug=path msg=cord]
  ^-  action:hark
  :+  %add-note  `bin:hark`[/ [%realm /spaces/(scot %p ship.pth)]]
  :*  [ship/ship.pth text/msg ~]
      ~
      now.bowl
      /
      %-  weld
      :-  /spaces/(scot %p ship.pth)/(scot %tas space.pth)
      slug
  ==
--