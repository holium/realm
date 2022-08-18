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
/-  store=passports, contact-store, spaces, invite, membership-store=membership, hark=hark-store, resource
/+  dbug, default-agent, resource, lib=passports, inv-lib=invite
^-  agent:gall
::
=>
  |%
  +$  card  card:agent:gall
  +$  versioned-state
      $%  state-0
      ==
  +$  state-0
    $:  %0
        =contacts:store
        membership=districts:store
        invitations=invitations:invite
        allowed-groups=(set resource)
        allowed-ships=(set ship)
        is-public=_|
    ==
  --
=|  state-0
=*  state  -
:: ^-  agent:gall
=<
  %-  agent:dbug
  |_  =bowl:gall
  +*  this  .
      def   ~(. (default-agent this %.n) bowl)
      core   ~(. +> [bowl ~])
  ::
  ++  on-init  :: on-init:def
    ^-  (quip card _this)
    ::  set initial state
    =/  our-member
      [
        roles=(silt `(list role:membership-store)`~[%owner %admin])
        alias=''
        status=%host
      ]
    =/  our-members  (malt `(list (pair ship passport:store))`~[[our.bowl our-member]])
    =/  initial-mem   `districts:store`(malt `(list (pair space-path:spaces passports:store))`~[[[~fes 'our'] our-members]])
    =.  membership.state          initial-mem
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
      :: %passports-action  (act:core !<(action:store vase))
      %invite-action     (inv-act:core !<(action:invite vase))
    ==
    [cards this]
  ::
  ++  on-leave  on-leave:def
  ::
  ++  on-watch
    |=  =path
    ^-  (quip card _this)
    =/  cards=(list card)
      ?+    path      (on-watch:def path)
        ::
          [%all ~]
        ::  only host should get all updates
        ?>  =(our.bowl src.bowl)
        (members:send-reaction [%all membership.state] [/all ~])
        ::
          [%members @ @ ~]
        ::  space level watch subscription
        =/  host        `@p`(slav %p i.t.path)
        =/  space-pth   `@t`i.t.t.path
        ::  only host should get all updates
        ?>  (check-member:core [host space-pth] src.bowl)     ::  only members should subscribe
        =/  passports       (~(got by membership.state) [host space-pth])
        (members:send-reaction [%members [host space-pth] passports] [/members/(scot %p host)/(scot %tas space-pth) ~])
      ==
    [cards this]
  ::
  ++  on-peek
    |=  =path
    ^-  (unit (unit cage))
    ?+    path  (on-peek:def path)
    ::
    ::  ~/scry/passports/~zod/our/members.json
      [%x @ @ %members ~]
        =/  host        `@p`(slav %p i.t.path)
        =/  space-pth   `@t`i.t.t.path
        =/  passports   (~(got by membership.state) [host space-pth])
        :: ?~  passports      ``json+!>(~)
        ``passports-view+!>([%members passports])
    ::
    ::  ~/scry/passports/~zod/our/members/~dev.json
      [%x @ @ %members @ ~]
        =/  host        `@p`(slav %p i.t.path)
        =/  space-pth   `@t`i.t.t.path
        =/  patp        `@p`(slav %p i.t.t.t.t.path)
        =/  passports   (~(got by membership.state) [host space-pth])
        =/  member      (~(got by passports) patp)
        :: ?~  member      ``json+!>(~)
        ``passports-view+!>([%member member])
    ::
    ::  ~/scry/passports/~zod/our/is-member/~fes.json
      [%x @ @ %is-member @ ~]
        =/  host        `@p`(slav %p i.t.path)
        =/  space-pth   `@t`i.t.t.path
        =/  patp        `@p`(slav %p i.t.t.t.t.path)
        =/  passports   (~(got by membership.state) [host space-pth])
        =/  is-member   (~(has by passports) patp)
        ``passports-view+!>([%is-member is-member])
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
          :: %kick
          ::   ~&  >  "{<dap.bowl>}: spaces kicked us, resubscribing..."
          ::   :_  this
          ::   :~  [%pass /spaces %agent [our.bowl %spaces] %watch /updates]
          ::   ==
      ::
          %fact
            ?+    p.cage.sign     (on-agent:def wire sign)
                %spaces-reaction
                  =/  rct  !<(=reaction:spaces q.cage.sign)
                  =^  cards  state
                  ?-  -.rct :: (on-agent:def wire sign)
                    %initial  (on-spaces-initial:core rct)
                    %add      (on-spaces-add:core rct)
                    %replace  (on-spaces-replace:core rct)
                    %remove   (on-spaces-remove:core rct)
                    %space    (on-spaces-sub:core rct)
                    %member-added  `state
                  ==
                  [cards this]
            ==
        ==
      ::
      [%passports ~]
        ?+    -.sign  (on-agent:def wire sign)
          %watch-ack
            ?~  p.sign  `this
            ~&  >>>  "{<dap.bowl>}: passports subscription failed"
            `this
      ::
          %kick
            ~&  >  "{<dap.bowl>}: passports kicked us, resubscribing..."
            :: ~&  >  [sign]
            :_  this
            :~  [%pass /passports %agent [our.bowl %spaces] %watch /all]
            ==
      ::
          %fact
            ?+    p.cage.sign  (on-agent:def wire sign)
                %invite-reaction
                =^  cards  state
                  (invite-reaction:core !<(=reaction:invite q.cage.sign))
                [cards this]

                %passports-reaction
                =^  cards  state
                  (passports-reaction:core !<(=reaction:store q.cage.sign))
                [cards this]
            ==
        ==
    ==
  ::
  ++  on-arvo  on-arvo:def
  ::
  ++  on-fail   on-fail:def
  --
::
|_  [=bowl:gall cards=(list card)]
::
++  core  .
++  this  .
::
::
::  $handle-add: add a new person to the person store, while
::    also adding a new space entry to track ship/role relationships
:: ++  handle-add
::   |=  [path=space-path:spaces =ship =payload:store]
::   ^-  (quip card _state)
::   =/  passports  (~(get by membership) path)
::   ?~  passports
::     ~&  >>  "{<dap.bowl>}: handle-add - {<path>} not found"
::     `state
::   ?:  (~(has by u.passports) ship)
::     ~&  >>>  "{<dap.bowl>}: handle-add - {<ship>} already exists"
::     `state
::   `state
::   ::  if needed, add a create method; otherwise the statement below
::   ::    will construct a civ object w/ defaults based on types
::   :: =|  passport=passport:store
::   :: ::  update the civ instance with values from the attributes
::   :: =/  passport  (update-passport passport payload)
::   :: ::  put updated civ back in civs map
::   :: =/  passports  (~(put by u.passports) ship passport)
::   :: =/  notify=action:hark  (notify path /invite (crip " issued you a passport to the {<`@t`(scot %tas space.path)>} space in Realm."))
::   :: :: :_  state(people (~(put by people) ship *person:store), membership (~(put by membership) path passports))
::   :: :~  [%give %fact [/all ~] %passports-reaction !>([%add path ship *person:store passport])]
::   ::     [%pass / %agent [our.bowl %hark-store] %poke hark-action+!>(notify)]
::   :: ==
:: ::
:: ::
:: ::
:: ::  $handle-remove: remove all person artifacts across all stores
:: ::    this differs from %kick which only removes a person from a space
:: ++  handle-remove
::   |=  [path=space-path:spaces =ship]
::   ^-  (quip card _state)
::   =/  passports  (~(get by membership) path)
::   ?~  passports
::     ~&  >>  "{<dap.bowl>}: handle-remove - {<path>} not found"
::     `state
::   =/  passports  (~(del by u.passports) ship)
::   `state(people (~(del by people) ship), membership (~(put by membership) path passports))
:: ::
:: ::  $handle-edit: modify a person attribute.
:: ::    note that $alias values are space specific; therefore, editing
:: ::    the alias changes the membership store and not people store
:: ++  handle-edit
::   |=  [path=space-path:spaces =ship =payload:store]
::   ^-  (quip card _state)
::   =/  passports  (~(get by membership) path)
::   ?~  passports
::     ~&  >>  "{<dap.bowl>}: handle-edit - {<path>} not found"
::     `state
::   =/  passport  (~(get by u.passports) ship)
::   ?~  passport
::     ~&  >>>  "{<dap.bowl>}: handle-edit - {<ship>} not found"
::     `state
::   ::  update existing civ based on attributes
::   =/  passport  (update-passport u.passport payload)
::   ::  put updated civ back in civs map
::   =/  passports  (~(put by u.passports) ship passport)
::   `state(membership (~(put by membership) path passports))
:: ::
:: ::  $update-civ: update the civilian based on the updated attributes (fields)
:: ++  update-passport
::   |=  [=passport:store =payload:store]
::   ^-  passport:store
::   %-  ~(rep in payload)
::   :: |=  [attribute=edit-field:store rslt=civ:store]
::   |:  [=mod:store acc=`passport:store`passport]
::   ?-  -.mod
::     %alias         acc(alias alias.mod)
::     %add-roles     acc(roles (~(gas in roles.passport) ~(tap in roles.mod)))
::     %remove-roles  acc(roles (~(dif in roles.passport) roles.mod))
::   ==
:: ::
:: ::  $handle-ping: %ping pokes come in from UI to indicate user is
:: ::    actively using Realm. we record the timestamp of this ping and
:: ::    then forward (reaction) our status to all subscribers
:: ::
:: ++  handle-ping
::   |=  [msg=(unit @t)]
::   ^-  (quip card _state)
::   `state
::   :: =/  per  (~(get by people.state) our.bowl)
::   :: ?~  per  `state
::   :: =.  last-known-active.u.per  (some now.bowl)
::   :: :_  state(people (~(put by people.state) our.bowl u.per))
::   :: :~  [%give %fact [/all ~] %passports-reaction !>([%pong our.bowl now.bowl])]
::   :: ==
:: ::
::
++  make-invitations
  |=  [path=space-path:spaces =members:membership-store =space:spaces]
  ^-  (list card)
  ::  loop thru each member, and build a list of invitations/pokes (acc)
  =.  members       (~(del by members) our.bowl)
  %-  ~(rep by members)
    |=  [[=ship =member:membership-store] acc=(list card)]
    =/  role          (snag 0 ~(tap in roles.member))
    =/  new-invite    (new-invite:inv-lib path src.bowl ship role space '' now.bowl)
    =/  invitation    [%invited path new-invite]
    %+  snoc  acc
    [%pass / %agent [ship dap.bowl] %poke invite-action+!>([%invited path new-invite])]
::
++  inv-act
  |=  [act=action:invite]
  ^-  (quip card _state)
  |^
  ?-  -.act
    %send-invite    (handle-send +.act)
    %invited        (handle-invited +.act)
    %accept-invite  (handle-accept +.act)
    %stamped        (handle-stamped +.act)
    %kick-member    (handle-kicked +.act)
  ==
  ::
  ++  handle-send     ::  MEMBER | HOST
    |=  [path=space-path:spaces =ship =role:membership-store message=@t]
    ^-  (quip card _state)
    ?>  (check-member:core path src.bowl)                                     ::  only members should invite
    =/  space-scry                .^(view:spaces %gx /(scot %p our.bowl)/spaces/(scot %da now.bowl)/(scot %p ship.path)/(scot %tas space.path)/noun)
    ?>  ?=(%space -.space-scry)
    =/  new-invite                (new-invite:inv-lib path src.bowl ship role space.space-scry message now.bowl)
    ?.  (is-host:core ship.path)                                              ::  Check if we should relay to host
      ::
      ::  MEMBER
      ::
      =.  outgoing.invitations.state  (set-outgoing path ship new-invite)     ::  We are not the host, but still set our outgoing
      :_  state
      :~  [%pass / %agent [ship.path dap.bowl] %poke invite-action+!>(act)]   ::  Send invite request to host
      ==
    ::
    ::  HOST
    ?>  =(our.bowl src.bowl)        ::  Dont invite yourself
    =/  passports                   (~(gut by membership.state) path `passports:store`[~])
    =/  new-member
      [
        roles=(silt `(list role:membership-store)`~[role])
        alias=''
        status=%invited
      ]
    =.  passports                   (~(put by passports) [ship new-member])
    =.  membership.state            (~(put by membership.state) [path passports])
    =.  outgoing.invitations.state  (set-outgoing:core path ship new-invite)
    =/  watch-paths                 [/all /members/(scot %p ship.path)/(scot %tas space.path) ~]
    :_  state
    :~  [%pass / %agent [ship dap.bowl] %poke invite-action+!>([%invited path new-invite])]     ::  Send invite request to invited
        [%give %fact watch-paths invite-reaction+!>([%invite-sent path ship new-invite new-member])]            ::  Notify watchers
    ==
  ::
  ::  handles the case when an invite is received
  ++  handle-invited    ::  MEMBER
    |=  [path=space-path:spaces =invite:invite]
    ^-  (quip card _state)
    =.  incoming.invitations.state    (~(put by incoming.invitations.state) [path invite])
    =/  notify=action:hark            (notify path /invite (crip " issued you a invite to join {<`@t`(scot %tas name.invite)>} in Realm."))
    :_  state
    :~  [%pass / %agent [our.bowl %hark-store] %poke hark-action+!>(notify)]                  ::  send notification to ship
    ==
  ::
  ++  handle-accept     ::  MEMBER | HOST
    |=  [path=space-path:spaces]
    ^-  (quip card _state)
    ?.  (is-host:core ship.path)
      ::
      ::  MEMBER
      ::  If we are invited we will send the invite action to the host
      :_  state
      :~  [%pass / %agent [ship.path %passports] %poke invite-action+!>(act)]
      ==
    ::
    ::  HOST
    ::
    =/  accepter                    src.bowl
    =/  passes                      (~(gut by membership.state) path `passports:store`[~])
    =/  upd-mem                     (~(got by passes) accepter)
    =.  status.upd-mem              %joined
    =.  passes                      (~(put by passes) [accepter upd-mem])
    =.  membership.state            (~(put by membership.state) [path passes])
    =/  space-invites               (~(got by outgoing.invitations.state) path)
    =.  space-invites               (~(del by space-invites) accepter)
    =.  outgoing.invitations.state  (~(put by outgoing.invitations.state) [path space-invites])
    =/  watch-paths                 [/all /members/(scot %p ship.path)/(scot %tas space.path) ~]
    :_  state
    :~  [%pass / %agent [accepter %passports] %poke invite-action+!>([%stamped path])]              :: Send space to invitee
        [%give %fact watch-paths invite-reaction+!>([%invite-accepted path accepter upd-mem])]      ::  Notify watchers
    ==
  ::
  ++  handle-stamped    :: MEMBER
    |=  [path=space-path:spaces]
    ^-  (quip card _state)
    =.  incoming.invitations.state  (~(del by incoming.invitations.state) path)
    :_  state
    ::  watch the spaces and passports path once invite flow is complete
    :~
      [%pass /passports %agent [ship.path %passports] %watch /members/(scot %p ship.path)/(scot %tas space.path)]
      :: [%pass /spaces/(scot %p ship.path)/(scot %tas space.path) %agent [ship.path %spaces] %watch /spaces/(scot %p ship.path)/(scot %tas space.path)]
      [%pass / %agent [our.bowl %spaces] %poke spaces-action+!>([%join path src.bowl])]
    ==
  ::
  ++  handle-kicked     ::  MEMBER | HOST
    |=  [path=space-path:spaces =ship]
    ^-  (quip card _state)
    ?>  (has-auth:core path src.bowl %admin)
    ?.  (is-host:core ship.path)
      ::
      ::  MEMBER
      ::
      ::  If we are kicking someone else we will send the invite action to the host
      :_  state
      [%pass /passports %agent [ship.path dap.bowl] %poke invite-action+!>(act)]~
    ::
    ::  HOST
    ::
    =/  membs                   (~(got by membership.state) path)
    =.  membs                   (~(del by membs) ship)
    =.  membership.state        (~(put by membership.state) [path membs])
    :_  state
    =/  watch-path              /members/(scot %p ship.path)/(scot %tas space.path)
    :~  [%give %fact [watch-path /all ~] invite-reaction+!>([%kicked path ship])]
        [%give %kick ~[/members/(scot %p ship.path)/(scot %tas space.path)] (some ship)]
        [%pass /spaces %agent [ship %spaces] %poke spaces-action+!>([%kicked path ship])]
    ==
  ::
  --
++  passports-reaction
  |=  [rct=reaction:store]
  ^-  (quip card _state)
  |^
  ?-  -.rct
    %all            (on-all +.rct)
    %members         (on-members +.rct)
  ==
  ::
  ++  on-all
    |=  [=districts:store]
    ^-  (quip card _state)
    `state
  ::
  ++  on-members
    |=  [path=space-path:spaces =passports:store]
    ^-  (quip card _state)
    =.  membership.state      (~(put by membership.state) [path passports])
    `state
  ::
  --
::
++  invite-reaction
  |=  [rct=reaction:invite]
  ^-  (quip card _state)
  |^
  ?-  -.rct
    %invite-sent        (on-sent +.rct)
    %invite-accepted    (on-accepted +.rct)
    %kicked             (on-kicked +.rct)
  ==
  ::
  ++  on-sent
    |=  [path=space-path:spaces =ship =invite:invite =passport:store]
    ^-  (quip card _state)
    =/  passes                      (~(gut by membership.state) path `passports:store`[~])
    =.  passes                      (~(put by passes) [ship [roles=(silt `(list role:membership-store)`~[role.invite]) alias='' status=%invited]])
    =.  membership.state            (~(put by membership.state) [path passes])
    `state
  ::
  ++  on-accepted
    |=  [path=space-path:spaces =ship =passport:store]
    ^-  (quip card _state)
    =/  passes                      (~(gut by membership.state) path `passports:store`[~])
    =.  passes                      (~(put by passes) [ship passport])
    =.  membership.state            (~(put by membership.state) [path passes])
    `state
  ::
  ++  on-kicked
    |=  [path=space-path:spaces =ship]
    ^-  (quip card _state)
    `state
  ::
  --
::
++  set-outgoing
  |=  [path=space-path:spaces =ship inv=invite:invite]
  =/  space-invites               (~(gut by outgoing.invitations.state) path `space-invitations:invite`[~])
  =.  space-invites               (~(put by space-invites) [ship inv])
  (~(put by outgoing.invitations.state) [path space-invites])
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
  |=  [rct=reaction:spaces]
  ^-  (quip card _state)
  ?>  ?=(%initial -.rct)
  `state
::
++  on-spaces-add
  |=  [rct=reaction:spaces]
  ^-  (quip card _state)
  ?>  ?=(%add -.rct)
  =/  passports=(map ship passport:store)  (to-passports members.rct)
  =.  membership.state      (~(put by membership) path.space.rct passports)
  :_  state
  %+  weld  (make-invitations path.space.rct members.rct space.rct)
  (members:send-reaction [%members path.space.rct passports] [/members/(scot %p ship.path.space.rct)/(scot %tas space.path.space.rct) ~])
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
  |=  [rct=reaction:spaces]
  ^-  (quip card _state)
  ?>  ?=(%replace -.rct)
  `state
::
++  on-spaces-remove
  |=  [rct=reaction:spaces]
  ^-  (quip card _state)
  ?>  ?=(%remove -.rct)
  `state(membership (~(del by membership) path.rct))
::
++  on-spaces-sub
  |=  [rct=reaction:spaces]
  ^-  (quip card _state)
  ?>  ?=(%space -.rct)
  ~&  >  ['spaces subbed']
  `state
::
++  send-reaction
  |%
  ++  friends
    |=  [rct=reaction:store paths=(list path)]
    ^-  (list card)
    [%give %fact paths passports-reaction+!>(rct)]~
  ::
  ++  members
    |=  [rct=reaction:store paths=(list path)]
    ^-  (list card)
    [%give %fact paths passports-reaction+!>(rct)]~
  --
::
++  check-member
  |=  [path=space-path:spaces =ship]
  ^-  ?
  =/  passports   (~(got by membership.state) path)
  (~(has by passports) ship)
::
++  is-host
  |=  [=ship]
  =(our.bowl ship)
::
++  has-auth
  |=  [=space-path:spaces =ship =role:membership-store]
  =/  member        (~(got by (~(got by membership.state) space-path)) ship)
  (~(has in roles.member) role)
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