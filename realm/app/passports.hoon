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
|%
+$  card  card:agent:gall
+$  versioned-state
    $%  state-0
    ==
+$  state-0
  $:  %0
      :: =passports:store
      =people:store
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
    :: =.  state.invitations       [outgoing=[[~] ~] incoming=[~]]
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
          [%members ~]  
        ::  only host should get all updates
        ?>  =(our.bowl src.bowl)
        (members:send-reaction [%members membership.state] [/members ~])
      ==
    [cards this]
  ::
  ++  on-peek
    |=  =path
    ^-  (unit (unit cage))
    ?+    path  (on-peek:def path)
    ::
    ::  ~/scry/passports/~zod/our/passports.json
      [%x @ @ %passports ~]
        =/  =ship       (slav %p i.t.path)
        =/  space-pth   `@t`i.t.t.path
        ~&  >>  "{<ship>}, {<space-pth>}"
        =/  passports   (~(get by membership.state) [ship space-pth])
        ?~  passports      ``json+!>(~)
        ``noun+!>((view:enjs:lib [%passports u.passports]))
    ::
    ::  ~/scry/passports/~zod/our/is-member/~fes
      :: [%x @ @ %is-member @ ~]
      ::   =/  =ship       (slav %p i.t.path)
      ::   =/  space-pth   `@t`i.t.t.path
      ::   =/  patp        (slav %p i.t.t.t.t.path)
      ::   ~&  >>  "{<ship>}, {<space-pth>}, {patp}"
      ::   =/  passports   (~(get by membership.state) [ship space-pth])
      ::   =/  is-member   (~(has by passports) patp)
      ::   ``noun+!>(is-member)

    ::
    ::  ~/scry/passports/~zod/our/people.json
      [%x @ @ ~]
        =/  =ship       (slav %p i.t.path)
        =/  space-pth   `@t`i.t.t.path
        ``noun+!>((view:enjs:lib [%people people.state]))
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
                  =/  rct  !<(=reaction:spaces q.cage.sign)
                  =^  cards  state
                  ?-  -.rct :: (on-agent:def wire sign)
                    %initial  (on-spaces-initial:core rct)
                    %add      (on-spaces-add:core rct)
                    %replace  (on-spaces-replace:core rct)
                    %remove   (on-spaces-remove:core rct)
                    %space    (on-spaces-sub:core rct)
                  ==
                  [cards this]
                ::
                :: %invite-reaction
                ::   =/  rct  !<(=reaction:invite q.cage.sign)
                ::   =^  cards  state
                ::   ?-  -.rct
                ::     %invite-sent      (on-sent:invite-reaction +.rct)
                ::     %invite-accepted  (on-accepted:invite-reaction +.rct)
                ::     %kicked           (on-kicked:invite-reaction +.rct)
                ::   ==
                ::   [cards this]
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
::
++  act
  |=  =action:store
  ^-  (quip card _state)
  ?-  -.action
    %add            (handle-add +.action)
    %remove         (handle-remove +.action)
    %edit           (handle-edit +.action)
    %ping           (handle-ping +.action)
  ==
::
::  $handle-add: add a new person to the person store, while
::    also adding a new space entry to track ship/role relationships
++  handle-add
  |=  [path=space-path:spaces =ship =payload:store]
  ^-  (quip card _state)
  =/  passports  (~(get by membership) path)
  ?~  passports
    ~&  >>  "{<dap.bowl>}: handle-add - {<path>} not found"
    `state
  ?:  (~(has by u.passports) ship)
    ~&  >>>  "{<dap.bowl>}: handle-add - {<ship>} already exists"
    `state
  ::  if needed, add a create method; otherwise the statement below
  ::    will construct a civ object w/ defaults based on types
  =|  passport=passport:store
  ::  update the civ instance with values from the attributes
  =/  passport  (update-passport passport payload)
  ::  put updated civ back in civs map
  =/  passports  (~(put by u.passports) ship passport)
  =/  notify=action:hark  (notify path /invite (crip " issued you a passport to the {<`@t`(scot %tas space.path)>} space in Realm."))
  :_  state(people (~(put by people) ship *person:store), membership (~(put by membership) path passports))
  :~  [%give %fact [/updates ~] %passports-reaction !>([%add path ship *person:store passport])]
      [%pass / %agent [our.bowl %hark-store] %poke hark-action+!>(notify)]
  ==
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
::
::  $handle-remove: remove all person artifacts across all stores
::    this differs from %kick which only removes a person from a space
++  handle-remove
  |=  [path=space-path:spaces =ship]
  ^-  (quip card _state)
  =/  passports  (~(get by membership) path)
  ?~  passports
    ~&  >>  "{<dap.bowl>}: handle-remove - {<path>} not found"
    `state
  =/  passports  (~(del by u.passports) ship)
  `state(people (~(del by people) ship), membership (~(put by membership) path passports))
::
::  $handle-edit: modify a person attribute.
::    note that $alias values are space specific; therefore, editing
::    the alias changes the membership store and not people store
++  handle-edit
  |=  [path=space-path:spaces =ship =payload:store]
  ^-  (quip card _state)
  =/  passports  (~(get by membership) path)
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
  `state(membership (~(put by membership) path passports))
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
  ++  handle-send
    |=  [path=space-path:spaces =ship =role:membership-store message=@t]
    ^-  (quip card _state)
    :: TODO check if we have permission to invite
    ?>  (check-member:core path src.bowl)     ::  only members should invite
    :: =/  space                       (~(got by spaces.state) path)
    =/  space  .^(space:spaces %gx /(scot %p our.bowl)/spaces/(scot %da now.bowl)/[path]/noun)
    =/  new-invite                  (new-invite:inv-lib path src.bowl ship role space message now.bowl)
    ::  TODO scry spaces metadata
    ?.  (is-host:core ship.path)                                              ::  Check if we should relay to host
      =.  outgoing.invitations.state  (set-outgoing path ship new-invite)     ::  We are not the host, but still set our outgoing
      :_  state                                                                                 
      :~  [%pass / %agent [ship.path dap.bowl] %poke invite-action+!>(act)]   ::  Send invite request to host
      ==
    ::  We are host
    =/  members                     (~(put by (~(got by membership.state) path)) [ship [roles=(silt `(list role:membership-store)`~[role]) alias='' status=%invited]])
    =.  membership.state            (~(put by membership.state) [path members])
    =.  outgoing.invitations.state  (set-outgoing:core path ship new-invite)
    =/  watch-paths                 [/updates /our /spaces/(scot %p ship.path)/(scot %tas space.path) ~]              
    :_  state
    :~  [%pass / %agent [ship dap.bowl] %poke invite-action+!>([%invited path new-invite])]     ::  Send invite request to invited
        [%give %fact watch-paths invite-reaction+!>([%invite-sent path ship new-invite])]            ::  Notify watchers
    ==
    ::
    :: ++  set-outgoing
    ::   |=  [path=space-path:spaces =ship =invite:invite]
    ::   =/  space-invites               (~(gut by outgoing.invitations.state) path `space-invitations:invite`[~])
    ::   =.  space-invites               (~(put by space-invites) [ship invite])
    ::   (~(put by outgoing.invitations.state) [path space-invites])
  ::
  ::  handles the case when an invite is received
  ++  handle-invited  
    |=  [path=space-path:spaces =invite:invite]
    ^-  (quip card _state)
    =.  incoming.invitations.state    (~(put by incoming.invitations.state) [path invite])
    =/  notify=action:hark            (notify path /invite (crip " issued you a invite to join {<`@t`(scot %tas name.invite)>} in Realm."))
    :_  state
    :~  [%pass / %agent [our.bowl %hark-store] %poke hark-action+!>(notify)]                  ::  send notification to ship
    ==
  ::
  ++  handle-accept
    |=  [path=space-path:spaces]
    ^-  (quip card _state)
    ?.  (is-host:core ship.path) 
      ::  If we are invited we will send the invite action to the host
      :_  state
      :~  [%pass / %agent [ship.path dap.bowl] %poke invite-action+!>(act)]
      ==
    =/  accepter                    src.bowl
    =/  membs                       (~(got by membership.state) path)
    =/  upd-mem                     (~(got by membs) accepter)
    =.  status.upd-mem              %joined
    =.  membs                       (~(put by membs) [accepter upd-mem])
    =.  membership.state            (~(put by membership.state) [path membs])
    =/  space-invites               (~(got by outgoing.invitations.state) path)
    =.  space-invites               (~(del by space-invites) accepter)
    =.  outgoing.invitations.state  (~(put by outgoing.invitations.state) [path space-invites])
    =/  watch-paths                 [/updates /our /spaces/(scot %p ship.path)/(scot %tas space.path) ~]              
    :_  state
    :~  [%pass / %agent [accepter dap.bowl] %poke invite-action+!>([%stamped path])]  :: Send space to invitee
        [%give %fact watch-paths invite-reaction+!>([%invite-accepted path accepter upd-mem])]      ::  Notify watchers
    ==
  ::
  ++  handle-stamped
    |=  [path=space-path:spaces]
    ^-  (quip card _state)
    =.  incoming.invitations.state  (~(del by incoming.invitations.state) path)
    =/  watch-path              /spaces/(scot %p ship.path)/(scot %tas space.path)                   
    :_  state
    [%pass /spaces %agent [ship.path %spaces] %watch watch-path]~
  ::
  ++  handle-kicked
    |=  [path=space-path:spaces =ship]
    ^-  (quip card _state)
    ?>  (has-auth:core path src.bowl %admin)
    ?.  (is-host:core ship.path) 
      ::  If we are invited we will send the invite action to the host
      :_  state
      :~  [%pass / %agent [ship.path dap.bowl] %poke invite-action+!>(act)]
      ==
    =/  membs                   (~(got by membership.state) path)
    =.  membs                   (~(del by membs) ship)
    =.  membership.state        (~(put by membership.state) [path membs])
    :_  state
    =/  watch-path              /spaces/(scot %p ship.path)/(scot %tas space.path)                   
    :~  [%give %fact [watch-path ~] invite-reaction+!>([%kicked path ship])]
        [%give %kick ~[watch-path] (some ship)]
    ==
  ::
  --

++  invite-reaction
  |%
  ::
  ++  on-sent
    |=  [path=space-path:spaces =ship =invite:invite]
    ^-  (quip card _state)
    ~&  >  [path ship invite]
    :: =/  members                     (~(put by (~(got by membership.state) path)) [ship [roles=(silt `(list role:membership-store)`~[role.invite]) status=%invited]])
    :: =.  membership.state            (~(put by membership.state) [path members])
    `state
  ::
  ++  on-accepted
    |=  [path=space-path:spaces =ship =member:membership-store]
    ^-  (quip card _state)
    ~&  >  [path]
    :: =/  members                     (~(put by (~(got by membership.state) path)) [ship member])
    :: =.  membership.state            (~(put by membership.state) [path members])
    `state
  ::
  ++  on-kicked
    |=  [rct=reaction:invite]
    ^-  (quip card _state)
    ?>  ?=(%kicked -.rct)
    ?.  =(our.bowl ship.+.rct)    
        :: we weren't kicked, but someone else was
       `state
    :: =.  spaces.state          (~(del by spaces.state) path.rct)
    :: =.  membership.state      (~(del by membership.state) path.rct)
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
  :: =/  spaces
  :: %-  ~(rep by spaces.rct)
  :: |=  [[path=space-path:spaces =space:spaces] acc=membership:store]
  :: =/  passes  (to-passports members)
  :: (~(put by acc) path passes)
  `state
  :: `state(membership membership)
::
++  on-spaces-add
  |=  [rct=reaction:spaces]
  ^-  (quip card _state)
  ?>  ?=(%add -.rct)
  =/  passports=(map ship passport:store)  (to-passports members.rct)
  `state(membership (~(put by membership) path.space.rct passports))
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
  |=  [=space-path:spaces =ship]
  ^-  ?
  =/  members   (~(got by membership.state) space-path)
  ?.  (~(has by members) ship)
      %.n
  %.y
::
++  is-host
  |=  [=ship]
  =(our.bowl ship)
::
++  has-auth
  |=  [=space-path:spaces =ship =role:membership-store]
  ::  TODO scry passports
  ::  
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