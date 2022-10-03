/-  store=spaces-store
/-  membership-store=membership
/-  vstore=visas
/-  hark=hark-store
/-  passports
/+  default-agent, verb, dbug, agentio, lib=spaces, visa-lib=visas, grp=groups
^-  agent:gall
::
::  %spaces [realm]:
::    A store for Realm space metadata and management.
::    Should watch and sync data with the %group-store under /landscape.
::
=>
  |%
  +$  card  card:agent:gall
  +$  versioned-state
      $%  state-0
      ==
  +$  state-0
    $:  %0
        =spaces:store
        =invitations:vstore
        =membership:membership-store
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
      core  ~(. +> [bowl ~])
  ::
  ++  on-init
    ^-  (quip card _this)
    =/  our-name                `@t`(scot %p our.bowl)
    =/  our-space               (create-space:lib our.bowl 'our' [name=our-name %our %private '' '#000000' %home] now.bowl)
    =/  our-member              [roles=(silt `(list role:membership-store)`~[%owner %admin]) alias='' status=%host]
    =/  our-members             (malt `(list (pair ship passport:passports))`~[[our.bowl our-member]])
    =/  initial-membs           `membership:membership-store`(malt `(list (pair space-path:store members:membership-store))`~[[path.our-space our-members]])
    =/  initial-spaces          `spaces:store`(~(put by spaces.state) [path:our-space our-space])
    =.  state                   [%0 spaces=initial-spaces invitations=[incoming=~ outgoing=~] membership=initial-membs]
    `this
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
    |^
    =^  cards  state
    ?+  mark                    (on-poke:def mark vase)
      %spaces-action            (action:spaces:core !<(action:store vase))
      %visa-action              (action:visas:core !<(action:vstore vase))
    ==
    [cards this]
    --
  ::
  ++  on-peek
    |=  =path
    ^-  (unit (unit cage))
    ?+    path                  (on-peek:def path)
        [%x %all ~]     
      ``spaces-view+!>([%spaces spaces.state])
      ::
        [%x %groups ~]
      =/  groups                (our-groups:grp our.bowl now.bowl)
      ``groups-view+!>([%groups groups])
      ::
        [%x @ @ ~]
      =/  =ship                 `@p`(slav %p i.t.path)
      =/  space-pth             `@t`i.t.t.path
      =/  space                 (~(got by spaces.state) [ship space-pth])
      ``spaces-view+!>([%space space])
      ::
        [%x %visas ~]
      ``visa-view+!>([%incoming incoming.invitations.state])
      ::
      ::   [%x @ @ %members ~]     ::  ~/scry/spaces/~zod/our/members.json
      :: =/  host                  `@p`(slav %p i.t.path)
      :: =/  space-pth             `@t`i.t.t.path
      :: =/  passports             (~(got by membership.state) [host space-pth])
      :: ``passports-view+!>([%members passports])
      ::
      ::   [%x @ @ %members @ ~]   ::  ~/scry/passports/~zod/our/members/~dev.json
      :: =/  host                  `@p`(slav %p i.t.path)
      :: =/  space-pth             `@t`i.t.t.path
      :: =/  patp                  `@p`(slav %p i.t.t.t.t.path)
      :: =/  passports             (~(get by membership.state) [host space-pth])
      :: =/  member                (~(get by (need passports)) patp)
      :: ?~  member                ``passports-view+!>([%member (silt ~[~])])
      :: `passports-view+!>([%member (need member)])
      :: ::
      ::   [%x @ @ %is-member @ ~] ::  ~/scry/passports/~zod/our/is-member/~fes.json
      :: =/  host                  `@p`(slav %p i.t.path)
      :: =/  space-pth             `@t`i.t.t.path
      :: =/  patp                  `@p`(slav %p i.t.t.t.t.path)
      :: =/  passports             (~(get by membership.state) [host space-pth])
      :: ?~  passports             ``passports-view+!>([%is-member %.n])
      :: =/  is-member             (~(has by (need passports)) patp)
      :: ``passports-view+!>([%is-member is-member])
      ::
    ==
  ::
  ++  on-watch
    |=  =path
    ^-  (quip card _this)
    =/  cards=(list card)
      ?+    path                      (on-watch:def path)
          [%updates ~]         
        ?>  =(our.bowl src.bowl)      ::  only host should get all updates
        (give:spaces:core [%initial spaces.state] [/updates ~])
        ::
          [%spaces @ @ ~]  :: The space level watch subscription
        =/  host                `@p`(slav %p i.t.path)
        =/  space-pth           `@t`i.t.t.path
        ?>  (check-member:core [host space-pth] src.bowl)     ::  only members should subscribe
        =/  space               (~(got by spaces.state) [host space-pth])
        =/  members             (~(got by membership.state) [host space-pth])
        (give:spaces:core [%joined-space [host space-pth] space members] [/spaces/(scot %p host)/(scot %tas space-pth) ~])
        ::
      ==
    [cards this]
  ::
  ++  on-agent
    |=  [=wire =sign:agent:gall]
    ^-  (quip card _this)
    =/  wirepath  `path`wire
    ?+    wire  (on-agent:def wire sign)
      [%updates ~]
        ?+    -.sign  (on-agent:def wire sign)
          %watch-ack
            ?~  p.sign  `this
            ~&  >>>  "{<dap.bowl>}: spaces subscription failed"
            `this
          %kick
            ~&  >  "{<dap.bowl>}: spaces kicked us, resubscribing..."
            :_  this
            :~  [%pass /updates %agent [our.bowl %spaces] %watch /updates]
            ==
          %fact
            ?+    p.cage.sign  (on-agent:def wire sign)
                %spaces-reaction
              =^  cards  state
                (reaction:spaces:core !<(=reaction:store q.cage.sign))
              [cards this]
                %visa-reaction
              =^  cards  state
                (reaction:visas:core !<(=reaction:vstore q.cage.sign))
              [cards this]
            ==
        ==
      [%spaces @ @ ~]  ::  only members will subscribe on this wire
        ?+    -.sign            (on-agent:def wire sign)
          %watch-ack
            ?~  p.sign  `this
            ~&  >>>  "{<dap.bowl>}: spaces subscription failed"
            `this
          %kick
            =/  =ship           `@p`(slav %p i.t.wire)
            =/  space-pth       `@t`i.t.t.wire
            ~&  >  "{<dap.bowl>}: spaces kicked us, resubscribing... {<ship>} {<space-pth>}"
            =/  watch-path      [/spaces/(scot %p ship)/(scot %tas space-pth)]
            :_  this
            :~  [%pass watch-path %agent [ship %spaces] %watch watch-path]
            ==
          %fact
            ?+    p.cage.sign   (on-agent:def wire sign)
                %spaces-reaction
              =^  cards  state
                (reaction:spaces:core !<(=reaction:store q.cage.sign))
              [cards this]
                %visa-reaction
              =^  cards  state
                (reaction:visas:core !<(=reaction:vstore q.cage.sign))
              [cards this]
            ==
        ==

    ==
  ++  on-arvo   |=([wire sign-arvo] !!)
  ::
  ++  on-fail
    |=  [=term =tang]
    ^-  (quip card _this)
    %-  (slog leaf+"error in {<dap.bowl>}" >term< tang)
    `this
  ::
  ++  on-leave  |=(path `..on-init)
  --
::
|_  [=bowl:gall cards=(list card)]
::
++  core  .
++  spaces
  |%
  ++  action
    |=  [act=action:store]
    ^-  (quip card _state)
    |^
    ?-  -.act
      %add            (handle-add +.act)
      %update         (handle-update +.act)
      %remove         (handle-remove +.act)
      %join           (handle-joined +.act)
      %leave          (handle-leave +.act)
      %kicked         (handle-kicked +.act)
    ==
    ::
    ++  handle-add
      |=  [slug=@t payload=add-payload:store members=members:membership-store]
      ^-  (quip card _state)
      ?>  (team:title our.bowl src.bowl)
      =/  new-space             (create-space:lib our.bowl slug payload now.bowl)
      ?:  (~(has by spaces.state) path.new-space)   :: checks if the path exists
        [~ state]
      =.  spaces.state          (~(put by spaces.state) [path.new-space new-space])
      ::  we need to set a host + member value and exclude the host from make-invitations
      =.  members               (~(put by members) [our.bowl [roles=(silt `(list role:membership-store)`~[%owner %admin]) alias='' status=%host]])
      =.  membership.state      (~(put by membership.state) [path.new-space members])
      =/  visa-cards            (initial-visas:helpers path.new-space members new-space)
      :: =.  outgoing.invitations.state  (set-outgoing:helpers:visas path ship new-visa)

      ::  return updated state and a combination of invitations (pokes)
      ::   to new members and gifts to any existing/current subscribers (weld)
      :_  state
      %+  weld   visa-cards
      (give [%add new-space members] [/updates ~])
    ::
    ++  handle-update
      |=  [path=space-path:store edit-payload=edit-payload:store]
      ^-  (quip card _state)
      ?>  (has-auth:core path src.bowl %admin)
      =/  old                   (~(got by spaces.state) path)
      =/  updated               `space:store`(edit-space old edit-payload)
      ?:  =(old updated)        :: if the old type equals new
          [~ state]             :: return state unchanged
      =.  updated-at.updated    now.bowl
      =/  watch-paths           [/updates /spaces/(scot %p ship.path)/(scot %tas space.path) ~]
      =.  spaces.state          (~(put by spaces.state) path updated)
      :_  state
      (give [%replace updated] watch-paths)
      ::
      ++  edit-space
        |=  [=space:store edit=edit-payload:store]
        ^-  space:store
        ?-  -.edit
          %name       space(name name.edit)
          %picture    space(picture picture.edit)
          %color      space(color color.edit)
          %theme      space(theme theme.edit)
        ==
    ::
    ++  handle-remove
      |=  [path=space-path:store]
      ^-  (quip card _state)
      ?>  (has-auth:core path src.bowl %owner)
      ?:  =('our' space.path) :: we cannot delete our space
        [~ state]
      =.  spaces.state                (~(del by spaces.state) path)
      =.  membership.state            (~(del by membership.state) path)
      =.  outgoing.invitations.state  (~(del by outgoing.invitations.state) path)
      =/  watch-paths                 [/updates /spaces/(scot %p ship.path)/(scot %tas space.path) ~]
      ::  TODO kick all outgoing invitations
      :_  state  
      :~  
        [%give %fact watch-paths spaces-reaction+!>([%remove path])]
      ==
    ::
    ++  handle-joined
      |=  [path=space-path:store =ship]
      ^-  (quip card _state)
      =/  watch-path            [/spaces/(scot %p ship.path)/(scot %tas space.path)]
      :_  state
      :~  [%pass watch-path %agent [ship.path dap.bowl] %watch watch-path]
      ==
    ::
    ++  handle-leave
      |=  [path=space-path:store]
      ^-  (quip card _state)
      ?.  (is-host:core ship.path)
        (member-handle-leave path)
      (host-handle-leave path src.bowl)
      ::
      ++  member-handle-leave
        |=  [path=space-path:store]
        =.  spaces.state          (~(del by spaces.state) path)
        =.  membership.state      (~(del by membership.state) path)
        =/  has-incoming          (~(get by incoming.invitations.state) path)
        =/  watch-path            [/spaces/(scot %p ship.path)/(scot %tas space.path)]
        =/  cards
          :~
            [%pass / %agent [ship.path dap.bowl] %poke spaces-action+!>([%leave path])]
            [%give %fact [/updates ~] spaces-reaction+!>([%remove path])]
            [%pass watch-path %agent [our.bowl %spaces] %leave ~]
          ==
        ?~  has-incoming  
          :_  state   
          cards
        =.  incoming.invitations.state    (~(del by incoming.invitations.state) path)
        :_  state
        cards
      ::
      ++  host-handle-leave
        |=  [path=space-path:store =ship]
        =/  membs                   (~(got by membership.state) path)
        =.  membs                   (~(del by membs) ship)
        =.  membership.state        (~(put by membership.state) [path membs])
        :_  state
        :~
          [%give %fact [/updates ~] visa-reaction+!>([%kicked path ship])]
        ==

    ::
    ++  handle-kicked
      |=  [path=space-path:store =ship]
      ^-  (quip card _state)
      ?:  =(our.bowl ship)  :: we are kicked
        =.  spaces.state        (~(del by spaces.state) path)
        =.  membership.state    (~(del by membership.state) path)
        =/  watch-paths         [/updates ~]
        :_  state
        (give [%remove path] watch-paths)  ::  notify our watches
      `state
    ::
    --
  ++  reaction
    |=  [rct=reaction:store]
    ^-  (quip card _state)
    |^
    ?-  -.rct
      %initial        (on-initial +.rct)
      %add            (on-add +.rct)
      %replace        (on-replace +.rct)
      %remove         (on-remove +.rct)
      %joined-space   (on-joined-space +.rct)
      %members        `state
    ==
    ::
    ++  on-initial
      |=  [spaces=spaces:store]
      ^-  (quip card _state)
      `state
    ::
    ++  on-add
      |=  [space=space:store members=members:membership-store]
      ^-  (quip card _state)
      `state
    ::
    ++  on-replace
      |=  [space=space:store]
      ^-  (quip card _state)
      `state(spaces (~(put by spaces.state) path.space space))
    ::
    ++  on-remove
      |=  [path=space-path:store]
      ^-  (quip card _state)
      =.  spaces.state          (~(del by spaces.state) path)
      ~&  >  ['on remove space' path]
      ?.  (is-host:core ship.path)
        (member-on-remove path)
      (host-on-remove path)
      ::
      ++  member-on-remove 
        |=  [path=space-path:store]
        =/  has-incoming                    (~(get by incoming.invitations.state) path)
        ?~  has-incoming                    ::  we dont have an invitation, so we are a member, simply remove
          `state(membership (~(del by membership.state) path))
        =.  membership.state                (~(del by membership.state) path)
        =.  incoming.invitations.state      (~(del by incoming.invitations.state) path)
        =/  watch-paths                     [/updates ~]
        :_  state
        :~
          [%pass /spaces/(scot %p ship.path)/(scot %tas space.path) %agent [our.bowl %spaces] %leave ~]
          [%give %fact watch-paths spaces-reaction+!>([%remove path])]
        ==
      ::
      ++  host-on-remove
        |=  [path=space-path:store]
        =/  members                       (~(got by membership.state) path)
        =.  members                       (~(del by members) our.bowl)
        =.  membership.state              (~(del by membership.state) path)
        =.  outgoing.invitations.state    (~(del by outgoing.invitations.state) path)
        =/  watch-path                    [/spaces/(scot %p ship.path)/(scot %tas space.path) ~]
        :_  state
        %-  ~(rep by members)
          |=  [[=ship =member:membership-store] acc=(list card)]
          %+  weld  %+  snoc  acc
          [%give %kick watch-path (some ship)]
          :: [%pass /spaces %agent [ship %spaces] %poke visa-action+!>([%kicked path ship])]
        (give [%remove path] watch-path)
      :: `state
    ::
    ++  on-joined-space
      |=  [path=space-path:store =space:store =members:membership-store]
      ^-  (quip card _state)
      =.  spaces.state          (~(put by spaces.state) [path space])
      =.  membership.state      (~(put by membership.state) [path members])
      :_  state
      (give [%joined-space path space members] [/updates ~])
    ::
    --
  ++  give
    |=  [rct=reaction:store paths=(list path)]
    ^-  (list card)
    [%give %fact paths spaces-reaction+!>(rct)]~
  ++  helpers
    |%
    ++  initial-visas
      |=  [path=space-path:store =members:membership-store =space:store]
      ^-  (list card)
      ::  loop thru each member, and build a list of invitations/pokes (acc)
      =.  members                       (~(del by members) our.bowl)
      %-  ~(rep by members)
        |=  [[=ship =member:membership-store] acc=(list card)]
        =/  role                        (snag 0 ~(tap in roles.member))
        =/  new-visa                    (new-visa:visa-lib path src.bowl ship role space '' now.bowl)
        %+  snoc  acc
        [%pass / %agent [ship dap.bowl] %poke visa-action+!>([%invited path new-visa])]
    ::
    --
  --
++  visas
  |%
  ++  action
    |=  [act=action:vstore]
    ^-  (quip card _state)
    |^
    ?-  -.act
      %send-invite          (handle-send +.act)
      %invited              (handle-invited +.act)
      %accept-invite        (handle-accept +.act)
      %decline-invite       (handle-decline +.act)
      %stamped              (handle-stamped +.act)
      %kick-member          (handle-kicked +.act)
    ==
    ::
    ++  handle-send  ::  Sends an invite to a ship
      |=  [path=space-path:store =ship =role:membership-store message=@t]
      ^-  (quip card _state)
      ?>  (check-member:core path src.bowl) ::  only members should invite
      =/  space                (~(got by spaces.state) path)
      =/  new-visa             (new-visa:visa-lib path src.bowl ship role space message now.bowl)
      ?.  (is-host:core ship.path)
        (member-handle-send path ship new-visa)
      (host-handle-send path ship role new-visa)
      ::  
      ++  member-handle-send 
        |=  [path=space-path:store =ship new-visa=invite:vstore]
        =.  outgoing.invitations.state  (set-outgoing:helpers path ship new-visa)     ::  We are not the host, but still set our outgoing
        :_  state
        :~  [%pass / %agent [ship.path dap.bowl] %poke visa-action+!>(act)]   ::  Send invite request to host
        ==
      ::
      ++  host-handle-send
        |=  [path=space-path:store =ship =role:membership-store new-visa=invite:vstore]
        ?>  =(our.bowl src.bowl)        ::  Dont invite yourself
        =/  passports                   (~(gut by membership.state) path `passports:passports`[~])
        =/  new-member
          [
            roles=(silt `(list role:membership-store)`~[role])
            alias=''
            status=%invited
          ]
        =.  passports                   (~(put by passports) [ship new-member])
        =.  membership.state            (~(put by membership.state) [path passports])
        =.  outgoing.invitations.state  (set-outgoing:helpers path ship new-visa)
        =/  watch-paths                 [/updates /spaces/(scot %p ship.path)/(scot %tas space.path) ~]
        :_  state
        :~  [%pass / %agent [ship dap.bowl] %poke visa-action+!>([%invited path new-visa])]             ::  Send invite request to invited
            [%give %fact watch-paths visa-reaction+!>([%invite-sent path ship new-visa new-member])]    ::  Notify watchers
        ==
    ::
    ++  handle-invited
      ::  when an invite is received
      ::  type: member
      |=  [path=space-path:store =invite:vstore]
      ^-  (quip card _state)
      =.  incoming.invitations.state    (~(put by incoming.invitations.state) [path invite])
      =/  notify=action:hark            (notify path /invite (crip " issued you a invite to join {<`@t`(scot %tas name.invite)>} in Realm."))
      :_  state
      :~  [%pass / %agent [our.bowl %hark-store] %poke hark-action+!>(notify)]                      ::  send notification to ship
          [%give %fact [/updates ~] visa-reaction+!>([%invite-received path invite])]                    
      ==
    ::
    ++  handle-accept     ::  MEMBER | HOST
      |=  [path=space-path:store]
      ^-  (quip card _state)
      ?.  (is-host:core ship.path)
        (member-handle-accept path)
      (host-handle-accept path)
      ::
      ++  member-handle-accept
        |=  [path=space-path:store]
        :_  state
        :~  [%pass / %agent [ship.path %spaces] %poke visa-action+!>(act)]
        ==
      ::
      ++  host-handle-accept
        |=  [path=space-path:store]
        =/  accepter                    src.bowl
        =/  members                     (~(gut by membership.state) path `members:membership-store`[~])
        =/  upd-mem                     (~(got by members) accepter)
        =.  status.upd-mem              %joined
        =.  members                     (~(put by members) [accepter upd-mem])
        =.  membership.state            (~(put by membership.state) [path members])
        ~&  >  ['handle-accept (got invitations)' invitations.state]
        =/  space-invites               (~(get by outgoing.invitations.state) path)
        =/  member-path                 /spaces/(scot %p ship.path)/(scot %tas space.path)
        =/  watch-paths                 [/updates member-path ~]
        =/  reactions                   
          :~  [%pass / %agent [accepter %spaces] %poke visa-action+!>([%stamped path])]       ::  Send space to invitee
              [%pass / %agent [our.bowl %contact-push-hook] %poke contact-share+!>([%share accepter])]  ::  share our contact
              [%give %fact watch-paths visa-reaction+!>([%invite-accepted path accepter upd-mem])]      ::  Notify watchers
          ==
        ?~  space-invites
          ~&  >>  ['no space-invites']
        :: ?@  space-invites
        ::   ::  if there is an outgoing
          :_  state
          reactions
        ::  else we will still send reactions
        =/  invites               (need space-invites)
        ~&  >>  ['remove from outgoing' invites accepter]
        =.  invites               (~(del by invites) accepter)
        =.  outgoing.invitations.state  (~(put by outgoing.invitations.state) [path invites])
        :_  state
        reactions
    ::
    ++  handle-decline     ::  MEMBER | HOST
      |=  [path=space-path:store]
      ^-  (quip card _state)
      ?.  (is-host:core ship.path)
        ::
        ::  MEMBER
        ::  If we are invited we will send the invite action to the host
        =.  incoming.invitations.state    (~(del by incoming.invitations.state) path)
        =/  watch-path                    /spaces/(scot %p ship.path)/(scot %tas space.path)
        :_  state
        :~  [%pass watch-path %agent [ship.path %spaces] %poke visa-action+!>(act)]
            [%give %fact [/updates ~] visa-reaction+!>([%invite-removed path])]  
        ==
      ::
      ::  HOST
      ::
      =/  decliner                    src.bowl
      =/  membs                       (~(got by membership.state) path)
      =.  membs                       (~(del by membs) decliner)
      =.  membership.state            (~(put by membership.state) [path membs])
      =/  space-invites               (~(got by outgoing.invitations.state) path)
      =.  space-invites               (~(del by space-invites) decliner)
      =.  outgoing.invitations.state  (~(put by outgoing.invitations.state) [path space-invites])
      :_  state
      :~  [%give %fact [/updates ~] visa-reaction+!>([%kicked path decliner])]
      ==
    ::
    ++  handle-stamped    :: MEMBER
      |=  [path=space-path:store]
      ^-  (quip card _state)
      =.  incoming.invitations.state  (~(del by incoming.invitations.state) path)
      =/  watch-path                  [/spaces/(scot %p ship.path)/(scot %tas space.path)]
      :_  state
      ::  watch the spaces and passports path once invite flow is complete
      :~
        [%pass watch-path %agent [ship.path %spaces] %watch watch-path]
        [%pass / %agent [our.bowl %spaces] %poke spaces-action+!>([%join path src.bowl])]
        [%give %fact [/updates ~] visa-reaction+!>([%invite-removed path])]                   ::  we want to remove the invite after accepted
      ==
    ::
    ++  handle-kicked     ::  MEMBER | HOST
      |=  [path=space-path:store =ship]
      ^-  (quip card _state)
      ?>  (has-auth:core path src.bowl %admin)
      ?.  (is-host:core ship.path)                      ::  Check if we should relay to host
        (handle-kicked-member path)                     ::  We are the member  
      (handle-kicked-host path ship)                    ::  We are the host
      ::
      ++  handle-kicked-member
        |=  [path=space-path:store]
        :_  state
        [%pass / %agent [ship.path dap.bowl] %poke visa-action+!>(act)]~
      ::
      ++  handle-kicked-host
        |=  [path=space-path:store =ship]
        =/  membs                   (~(got by membership.state) path)
        =.  membs                   (~(del by membs) ship)
        =.  membership.state        (~(put by membership.state) [path membs])
        =/  watch-path              /spaces/(scot %p ship.path)/(scot %tas space.path)
        :_  state
        :~  [%give %fact [watch-path /updates ~] visa-reaction+!>([%kicked path ship])]
            ::  kick from all core agents
            [%give %kick ~[/bazaar/(scot %p ship.path)/(scot %tas space.path)] (some ship)]
            [%give %kick ~[/spaces/(scot %p ship.path)/(scot %tas space.path)] (some ship)]
        ==
      :: ?.  (is-host:core ship.path)
      ::   ::
      ::   ::  MEMBER
      ::   ::
      ::   ::  If we are kicking someone else we will send the visa action to the host
      ::   :_  state
      ::   [%pass /passports %agent [ship.path dap.bowl] %poke visa-action+!>(act)]~
      ::
      ::  HOST
      ::
      :: =/  membs                   (~(got by membership.state) path)
      :: =.  membs                   (~(del by membs) ship)
      :: =.  membership.state        (~(put by membership.state) [path membs])
      :: =/  watch-path              /spaces/(scot %p ship.path)/(scot %tas space.path)
      :: :_  state
      :: :~  [%give %fact [watch-path /updates ~] visa-reaction+!>([%kicked path ship])]
      ::     ::  kick from all core agents
      ::     [%give %kick ~[/bazaar/(scot %p ship.path)/(scot %tas space.path)] (some ship)]
      ::     [%give %kick ~[/spaces/(scot %p ship.path)/(scot %tas space.path)] (some ship)]
      ::     [%pass /spaces %agent [ship %spaces] %poke spaces-action+!>([%kicked path ship])]
      :: ==
    ::
    --
  ++  reaction
    |=  [rct=reaction:vstore]
    ^-  (quip card _state)
    |^
    ?-  -.rct
      %invite-sent        (on-sent +.rct)
      %invite-received    `state
      %invite-removed     `state
      %invite-accepted    (on-accepted +.rct)
      %kicked             (on-kicked +.rct)
    ==
    ::
    ++  on-sent
      |=  [path=space-path:store =ship =invite:vstore =member:membership-store]
      ^-  (quip card _state)
      =/  passes                      (~(gut by membership.state) path `members:membership-store`[~])
      =.  passes                      (~(put by passes) [ship [roles=(silt `(list role:membership-store)`~[role.invite]) alias='' status=%invited]])
      =.  membership.state            (~(put by membership.state) [path passes])
      `state
    ::
    ++  on-accepted
      |=  [path=space-path:store =ship =member:membership-store]
      ^-  (quip card _state)
      =/  passes                      (~(gut by membership.state) path `members:membership-store`[~])
      =.  passes                      (~(put by passes) [ship member])
      =.  membership.state            (~(put by membership.state) [path passes])
      `state
    ::
    ++  on-kicked
      |=  [path=space-path:store =ship]
      ^-  (quip card _state)
      ?:  =(our.bowl ship.path)
        =.  incoming.invitations.state  (~(del by incoming.invitations.state) path)
        :_  state
        [%pass /spaces/(scot %p ship.path)/(scot %tas space.path) %agent [ship.path %spaces] %leave ~]~
      ::  someone else was kicked
      `state
    ::
    --
  ++  give
    |=  [rct=reaction:vstore paths=(list path)]
    ^-  (list card)
    [%give %fact paths visa-reaction+!>(rct)]~
  ++  helpers
    |%
    ++  set-outgoing
      |=  [path=space-path:store =ship inv=invite:vstore]
      =/  space-invites               (~(gut by outgoing.invitations.state) path `space-invitations:vstore`[~])
      =.  space-invites               (~(put by space-invites) [ship inv])
      (~(put by outgoing.invitations.state) [path space-invites])
    ::
    --
  --
::
::
++  has-auth
  |=  [path=space-path:store =ship =role:membership-store]
  ^-  ?
  =/  member        (~(got by (~(got by membership.state) path)) ship)
  (~(has in roles.member) role)
::
++  check-member
  |=  [path=space-path:store =ship]
  ^-  ?
  =/  members   (~(get by membership.state) path)
  ?~  members
    %.n
  (~(has by (need members)) ship)
::
++  is-host
  |=  [=ship]
  =(our.bowl ship)
::
++  notify
  |=  [pth=space-path:store slug=path msg=cord]
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