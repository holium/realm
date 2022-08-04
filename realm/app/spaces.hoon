/-  store=spaces, membership-store=membership, invite-store=invite, hark=hark-store
/+  default-agent, verb, dbug, agentio, lib=spaces, inv-lib=invite
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
        spaces=spaces:store
        membership=membership:membership-store
        invitations=invitations:invite-store
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
      io    ~(. agentio bowl)
  ::
  ++  on-init
    ^-  (quip card _this)
    =/  our-name  `@t`(scot %p our.bowl)
    =/  our-space  (create-space:lib our.bowl 'our' [name=our-name %our %private '' '#000000' %home] now.bowl)
    =/  initial-spaces  `spaces:store`(~(put by spaces.state) [path:our-space our-space])
    =/  our-member
      [
        roles=(silt `(list role:membership-store)`~[%owner %admin])
        status=%host
      ]
    =/  our-members  (malt `(list (pair ship member:membership-store))`~[[our.bowl our-member]])
    =/  initial-auth   `membership:membership-store`(malt `(list (pair space-path:store members:membership-store))`~[[path:our-space our-members]])
    ~&  >  '%spaces initialized'
    =.  state  [%0 spaces=initial-spaces membership=initial-auth invitations=[outgoing=[~] incoming=[~]]]
    :-  ~  this
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
    :: ?>  (team:title our.bowl src.bowl) :: is our ship or moon
    |^
    =^  cards  state
    ?+  mark  (on-poke:def mark vase)
      ::
      ::  %space actions
      ::
      ::  Usage:
      ::    :spaces &space [%add 'other-life' %group]
      ::    :spaces &space [%update [~fes 'other-life'] [%name name="The Other Life"]]
      ::
      %spaces-action    (on-spaces-action:core !<(action:store vase))
      %invite-action    (on-invite-action:core !<(action:invite-store vase) mark vase)
    ==
    [cards this]
    --
  ++  on-peek
    |=  =path
    ^-  (unit (unit cage))
    ?+    path  (on-peek:def path)
      ::
      ::  ~/scry/spaces.json
        [%x ~]                ``noun+!>((view:enjs:lib [%spaces spaces.state]))
      ::
      ::  ~/scry/spaces/invitations.json
        [%x %invitations ~]   ``noun+!>((view:enjs:inv-lib [%invitations invitations.state]))
      ::
      ::  ~/scry/spaces/~fes/our.json
        [%x @ @ ~]
      =/  =ship       (slav %p i.t.path)
      =/  space-pth   `@t`i.t.t.path
      =/  space       (~(got by spaces.state) [ship space-pth])
      =/  members      (~(got by membership.state) [ship space-pth])
      ``noun+!>((view:enjs:lib [%space [ship space-pth] space members]))
      ::
      ::  ~/scry/spaces/~fes/our/members.json
        [%x @ @ %members ~]
      ~&  >  [i.t.path]
      =/  =ship       (slav %p i.t.path)
      =/  space-pth   `@t`i.t.t.path
      =/  members      (~(got by membership.state) [ship space-pth])
      ``noun+!>((view:enjs:lib [%members members]))
      ::
    ==
  ::
  ++  on-watch
    |=  =path
    ^-  (quip card _this)
    =/  cards=(list card)
      ?+    path      (on-watch:def path)
          [%updates ~]  
        ::  only host should get all updates
        ?>  (is-host:core src.bowl)
        (spaces:send-reaction [%initial spaces.state membership.state] [/updates ~])
        ::
          [%our ~]                      
          ::  only host should get our updates
        ?>  (is-host:core src.bowl)
        [~]
        ::
          [%spaces @ @ ~]
          :: The space level watch subscription
        =/  host        `@p`(slav %p i.t.path)
        =/  space-pth   `@t`i.t.t.path
        ~&  >  [i.t.path host space-pth src.bowl]
        ?>  (check-member:core [host space-pth] src.bowl)     ::  only members should subscribe
        =/  space        (~(got by spaces.state) [host space-pth])
        =/  members      (~(got by membership.state) [host space-pth])
        (member:send-reaction [%space [host space-pth] space members] [/spaces/(scot %p host)/(scot %tas space-pth) ~])
      ==
    [cards this]
  ::
  ++  on-agent   ::on-agent:def
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
          %fact
            ?+    p.cage.sign     (on-agent:def wire sign)
                %spaces-reaction
                  =/  rct  !<(=reaction:store q.cage.sign)
                  =^  cards  state
                  ?-  -.rct
                    %initial  (on-initial:spaces-reaction:core rct)
                    %add      (on-add:spaces-reaction:core rct)
                    %replace  (on-replace:spaces-reaction:core rct)
                    %remove   (on-remove:spaces-reaction:core rct)
                    %space    (on-space-initial:spaces-reaction:core rct)
                  ==
                  [cards this]
                ::
                %invite-reaction
                  =/  rct  !<(=reaction:invite-store q.cage.sign)
                  =^  cards  state
                  ?-  -.rct
                    %invite-sent      (on-sent:invite-reaction +.rct)
                    %invite-accepted  (on-accepted:invite-reaction +.rct)
                    %kicked           (on-kicked:invite-reaction:core rct)
                  ==
                  [cards this]
            ==
        ==
    ==
  ++  on-arvo   |=([wire sign-arvo] !!)
  ++  on-fail   |=([term tang] `..on-init)
  ++  on-leave  |=(path `..on-init)
  --
::
|_  [=bowl:gall cards=(list card)]
::
++  core  .
++  io    .
++  this  .
::
++  on-spaces-action
  |=  [act=action:store]
  ^-  (quip card _state)
  |^
  ?-  -.act
    %add            (handle-add +.act)
    %update         (handle-update +.act)
    %remove         (handle-remove +.act)
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
    =/  host-members          (~(put by members) [our.bowl [roles=(silt `(list role:membership-store)`~[%owner %admin]) status=%host]])
    =.  membership.state      (~(put by membership.state) [path.new-space host-members])
    ::  return updated state and a combination of invitations (pokes)
    ::   to new members and gifts to any existing/current subscribers (weld)
    :_  state
    %+  weld  (make-invitations path.new-space members)
    (spaces:send-reaction [%add new-space host-members] [/updates /our ~])
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
    =/  watch-paths           [/updates /our /spaces/(scot %p ship.path)/(scot %tas space.path) ~]              
    :-  (spaces:send-reaction [%replace updated] watch-paths)
    state(spaces (~(put by spaces.state) path updated))
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
    =/  deleted             (~(got by spaces.state) path)
    =.  spaces.state        (~(del by spaces.state) path.deleted)
    =.  membership.state    (~(del by membership.state) path.deleted)
    =/  watch-paths         [/updates /our /spaces/(scot %p ship.path)/(scot %tas space.path) ~]              
    :-  (spaces:send-reaction [%remove path] watch-paths)
    state
  ::
  ::  $make-invitations: helper to generate a list of invitations
  ::   (invite-action pokes) for the given space and members
  ++  make-invitations
    |=  [path=space-path:store =members:membership-store]
    ^-  (list card)
    ::  loop thru each member, and build a list of invitations/pokes (acc)
    %-  ~(rep by members)
      |=  [[=ship =member:membership-store] acc=(list card)]
      ::  can there be more than one role per member, or do we just
      ::   keep it simple and worry about 'main' role (role at index 0)
      =/  role  (snag 0 ~(tap in roles.member))
      =/  invitation  [%send-invite path ship role]
      %+  snoc  acc
      [%pass / %agent [ship %spaces] %poke invite-action+!>(invitation)]
  --
::
++  spaces-reaction
  |%
  ::
  ++  on-initial
    |=  [rct=reaction:store]
    ^-  (quip card _state)
    ?>  ?=(%initial -.rct)
    `state
  ::
  ++  on-add
    |=  [rct=reaction:store]
    ^-  (quip card _state)
    ?>  ?=(%add -.rct)
    `state
  ::
  ++  on-replace
    |=  [rct=reaction:store]
    ^-  (quip card _state)
    ?>  ?=(%replace -.rct)
    `state(spaces (~(put by spaces.state) path.space.rct space.rct))
  ::
  ++  on-remove
    |=  [rct=reaction:store]
    ^-  (quip card _state)
    ?>  ?=(%remove -.rct)
    =.  spaces.state          (~(del by spaces.state) path.rct)
    =.  membership.state      (~(del by membership.state) path.rct)
    `state
  ::
  ++  on-space-initial
    |=  [rct=reaction:store]
    ^-  (quip card _state)
    ?>  ?=(%space -.rct)
    =.  spaces.state          (~(put by spaces.state) [path.rct space.rct])
    =.  membership.state      (~(put by membership.state) [path.rct members.rct])
    `state
  ::
  --
::
++  on-invite-action
  |=  [act=action:invite-store mark vase]
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
    |=  [path=space-path:store =ship =role:membership-store message=@t]
    ^-  (quip card _state)
    :: TODO check if we have permission to invite
    ?>  (check-member:core path src.bowl)     ::  only members should invite
    =/  space                       (~(got by spaces.state) path)
    =/  new-invite                  (new-invite:inv-lib path src.bowl ship role space message now.bowl)
    ?.  (is-host:core ship.path)                                              ::  Check if we should relay to host
      =.  outgoing.invitations.state  (set-outgoing path ship new-invite)     ::  We are not the host, but still set our outgoing
      :_  state                                                                                 
      :~  [%pass / %agent [ship.path dap.bowl] %poke invite-action+!>(act)]   ::  Send invite request to host
      ==
    ::  We are host
    =/  members                     (~(put by (~(got by membership.state) path)) [ship [roles=(silt `(list role:membership-store)`~[role]) status=%invited]])
    =.  membership.state            (~(put by membership.state) [path members])
    =.  outgoing.invitations.state  (set-outgoing path ship new-invite)
    =/  watch-paths                 [/updates /our /spaces/(scot %p ship.path)/(scot %tas space.path) ~]              
    :_  state
    :~  [%pass / %agent [ship dap.bowl] %poke invite-action+!>([%invited path new-invite])]     ::  Send invite request to host
        [%give %fact watch-paths invite-reaction+!>([%invite-sent path new-invite])]            ::  Notify watchers
    ==
    ::
    ++  set-outgoing
      |=  [path=space-path:store =ship =invite:invite-store]
      =/  space-invites               (~(gut by outgoing.invitations.state) path `space-invitations:invite-store`[~])
      =.  space-invites               (~(put by space-invites) [ship invite])
      (~(put by outgoing.invitations.state) [path space-invites])
  ::
  ::  handles the case when an invite is received
  ++  handle-invited  
    |=  [path=space-path:store =invite:invite-store]
    ^-  (quip card _state)
    =.  incoming.invitations.state    (~(put by incoming.invitations.state) [path invite])
    =/  notify=action:hark            (notify src.bowl path /invite (crip " issued you a invite to join {<`@t`(scot %tas name.invite)>} in Realm."))
    :_  state
    :~  [%pass / %agent [our.bowl %hark-store] %poke hark-action+!>(notify)]                  ::  send notification to ship
    ==
  ::
  ++  handle-accept
    |=  [path=space-path:store]
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
    |=  [path=space-path:store]
    ^-  (quip card _state)
    =.  incoming.invitations.state  (~(del by incoming.invitations.state) path)
    =/  watch-path              /spaces/(scot %p ship.path)/(scot %tas space.path)                   
    :_  state
    [%pass /spaces %agent [ship.path %spaces] %watch watch-path]~
  ::
  ++  handle-kicked
    |=  [path=space-path:store =ship]
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
::
++  invite-reaction
  |%
  ::
  ++  on-sent
    |=  [path=space-path:store =ship =role:membership-store]
    ^-  (quip card _state)
    ~&  >  [path ship role]
    =/  members                     (~(put by (~(got by membership.state) path)) [ship [roles=(silt `(list role:membership-store)`~[role]) status=%invited]])
    =.  membership.state            (~(put by membership.state) [path members])
    `state
  ::
  ++  on-accepted
    |=  [path=space-path:store =ship =member:membership-store]
    ^-  (quip card _state)
    ~&  >  [path]
    =/  members                     (~(put by (~(got by membership.state) path)) [ship member])
    =.  membership.state            (~(put by membership.state) [path members])
    `state
  ::
  ++  on-kicked
    |=  [rct=reaction:invite-store]
    ^-  (quip card _state)
    ?>  ?=(%kicked -.rct)
    ?.  =(our.bowl ship.+.rct)    
        :: we weren't kicked, but someone else was
       `state
    =.  spaces.state          (~(del by spaces.state) path.rct)
    =.  membership.state      (~(del by membership.state) path.rct)
    `state
  ::
  --
::
++  send-reaction
  |%
  ++  member
    |=  [rct=reaction:store paths=(list path)]
    ^-  (list card)      
    [%give %fact paths spaces-reaction+!>(rct)]~
  ::
  ++  invite
    |=  [rct=reaction:invite-store]
    ^-  (list card)
    =/  paths=(list path)
      [/updates /our ~]
    [%give %fact paths invite-reaction+!>(rct)]~
  ::
  ++  spaces
    |=  [rct=reaction:store paths=(list path)]
    ^-  (list card)
    [%give %fact paths spaces-reaction+!>(rct)]~
  ::
  --
::
++  has-auth
  |=  [=space-path:store =ship =role:membership-store]
  =/  member        (~(got by (~(got by membership.state) space-path)) ship)
  (~(has in roles.member) role)
::
++  check-member
  |=  [=space-path:store =ship]
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
++  notify
  |=  [from=ship pth=space-path:store slug=path msg=cord]
  ^-  action:hark
  :+  %add-note  `bin:hark`[/invites [%realm /spaces/(scot %p ship.pth)]]
  :*  [ship/ship.pth text/msg ~]
      ~
      now.bowl
      /
      %-  weld
      :-  /spaces/(scot %p ship.pth)/(scot %tas space.pth)
      slug
  ==
--