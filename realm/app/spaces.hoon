/-  store=spaces, membership-store=membership, hark=hark-store
/+  default-agent, verb, dbug, agentio, lib=spaces, inv-lib=invite
^-  agent:gall
::
::  %spaces [realm]:
::
::  A store for Realm space metadata and management.
::
::  Should watch and sync data with the %group-store under /landscape.
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
        invitations=invitations:store
        our-invites=our-invites:store
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
    =/  our-members  (malt `(list (pair ship roles:membership-store))`~[[our.bowl (silt `(list role:membership-store)`~[%owner %admin])]])
    =/  initial-auth   `membership:membership-store`(malt `(list (pair space-path:store members:membership-store))`~[[path:our-space our-members]])
    ~&  >  '%spaces initialized'
    =.  state  [%0 spaces=initial-spaces membership=initial-auth invitations=[~] our-invites=[~]]
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
    :: ~&  >  [mark vase]
    ?+  mark  (on-poke:def mark vase)
      ::
      ::  %space actions
      ::
      ::  Usage:
      ::    :spaces &space [%add 'other-life' %group]
      ::    :spaces &space [%update [~fes 'other-life'] [%name name="The Other Life"]]
      ::
      %spaces-action    (spaces-action:core !<(action:store vase))
      %invite-action    (invite-lib:core !<(invite-action:store vase) mark vase)
    ==
    [cards this]
    --
  ++  on-peek
    |=  =path
    ^-  (unit (unit cage))
    ?+    path  (on-peek:def path)
    ::
    ::  ~/scry/spaces.json
    ::
      [%x ~]                ``noun+!>((view:enjs:lib [%spaces spaces.state]))
    ::
    ::  ~/scry/spaces/invitations.json
    ::
      [%x %invitations ~]   ``invite-view+!>((invite-view:enjs:lib [%invitations our-invites.state]))

    ::
    ::  ~/scry/spaces/~fes/our.json
    ::
      [%x %village @ @ ~]
    =/  =ship       (slav %p i.t.t.path)
    =/  space-pth   `@t`i.t.t.t.path
    =/  space       (~(got by spaces.state) [ship space-pth])
    ``noun+!>((view:enjs:lib [%space space]))
    ==
  ::
  ++  on-watch
    :: TODO expand this logic for invites and spaces
    |=  =path
    ^-  (quip card _this)
    =/  cards=(list card)
      ?+  path      (on-watch:def path)
        [%updates ~]      (spaces:send-reaction:core [%initial spaces.state membership.state])
        [%response ~]     ~
      ::
      ==
    [cards this]
  ::
  ++  on-agent  ::  on-agent:def
    |=  [=wire =sign:agent:gall]
    ^-  (quip card _this)
    =/  wirepath  `path`wire
    ?+    wire  (on-agent:def wire sign)
      [%invite ~]
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
            ?+  p.cage.sign  (on-agent:def wire sign)
              %invite-reaction 
                =/  rct  !<(invite-reaction:store q.cage.sign)
                =^  cards  state
                ?-  -.rct 
                    %invite-sent      (handle-sent:on-invite-reaction +.rct)
                    %invite-accepted  (handle-accepted:on-invite-reaction +.rct)
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
++  on-invite-reaction
  |%
  ::
  ++  handle-sent
    |=  [path=space-path:store =invite:store]
    ^-  (quip card _state)
    ~&  >  [path invite]
    `state
  :: 
  ++  handle-accepted
    |=  [path=space-path:store =space:store]
    ^-  (quip card _state)
    ~&  >  [path space]
    `state
  ::
  --
::
++  spaces-action
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
    =/  new-space  (create-space:lib our.bowl slug payload now.bowl)
    =.  members    (~(put by members) [our.bowl (silt `(list role:membership-store)`~[%owner %admin])])
    ?:  (~(has by spaces.state) path.new-space)   :: checks if the path exists
      [~ state]
    =.  spaces.state          (~(put by spaces.state) [path.new-space new-space])
    =.  membership.state      (~(put by membership.state) [path.new-space members])
    ::  TODO invite all members in member map here
    :: %-  ~(urn by (~(got by membership.state) path.new-space))
    ::     |=  [=ship =role:membershsip]
    ::     (handle-send:invite-lib [%send-invite path.new-space ship role])
    ::     :: ==
    :-  (spaces:send-reaction [%add new-space members])
    state
  ::
  ++  handle-update
    |=  [path=space-path:store edit-payload=edit-payload:store]
    ^-  (quip card _state)
    ?>  (has-auth:core path src.bowl %admin)
    =/  old                   (~(got by spaces.state) path)
    =/  updated               `space:store`(edit-space old edit-payload)
    ?:  =(old updated)        :: if the old type equals new
        [~ state]             :: return state unchange
    =.  updated-at.updated    now.bowl
    :-  (spaces:send-reaction [%replace updated])
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
    :-  (spaces:send-reaction [%remove path])
    state
  ::
  --
::
++  invite-lib
  |=  [act=invite-action:store mark vase]
  ^-  (quip card _state)
  |^
  ?-  -.act
    %send-invite    (handle-send +.act)
    %invited        (handle-invited +.act)
    %accept-invite  (handle-accept +.act)
    :: %joined         (handle-joined +.act)
  ==
  ++  handle-send
    |=  [path=space-path:store =ship =role:membership-store]
    ^-  (quip card _state)
    :: ?>  (team:title our.bowl src.bowl)
    :: TODO check if we have permission to invite
    ?.  =(our.bowl ship.path)                                                 ::  If we are the host
      :: ----- TODO                                                           ::  Add new invitee to member list
      :_  state                                                               ::  return state
      :~  [%pass / %agent [ship.path dap.bowl] %poke invite-action+!>(act)]   ::  Send the invite
          ::  TODO update members of new invitee
      ==
    ::  we are a member or admin
    =/  space                 (~(got by spaces.state) path)
    =/  new-invite            (new-invite:inv-lib path src.bowl ship role space now.bowl)
    =/  space-invites         (~(gut by invitations.state) path `space-invitations:store`[~])
    =.  space-invites         (~(put by space-invites) [ship new-invite])  
    =.  invitations.state     (~(put by invitations.state) [path space-invites])
    :_  state
    :~  [%pass / %agent [ship dap.bowl] %poke invite-action+!>([%invited path new-invite])]   ::  send invite to ship
        :: (invite:send-reaction [%invite-sent path new-invite])
    ==
    :: :_  ~
    :: :*  %pass  /
    ::     %agent  [ship dap.bowl]  %poke
    ::     invite-action+!>([%invited path new-invite])
      :: :*  %pass / %agent
      ::       ~[ship dap.bowl]
      ::       %poke
      ::       [invite-action+!>([%invited path new-invite])]
            :: [%booth-store-response !>([%response-proposal ship bth-name new-proposal])]
     :: ==
    
    :: state
  ::
  ++  handle-invited
    |=  [path=space-path:store =invite:store]
    ^-  (quip card _state)
    ~&  >  [src.bowl path 'has invited you']
    =.  our-invites.state     (~(put by our-invites.state) [path invite])
    =/  notify=action:hark    (notify src.bowl path /invite (crip " issued you a invite to join {<`@t`(scot %tas name.invite)>} in Realm."))
    :_  state
    :~  [%pass / %agent [our.bowl %hark-store] %poke hark-action+!>(notify)]                  ::  send notification to ship
    ==
  ::
  ++  handle-accept
    |=  [path=space-path:store]
    ^-  (quip card _state)
    ?:  =(our.bowl ship.path)                                   ::  If we are the host
      ~&  >  [src.bowl path 'accepted']
      =/  space                 (~(got by spaces.state) path)   ::  Get the space
      :_  state 
      (invite:send-reaction [%invite-accepted path space])      ::  Send space to invitee
    ::  If we are invited, not host
    ~&  >  [src.bowl path 'send accept']
    =.  our-invites.state     (~(del by our-invites.state) path)
    :: =.  our-invites.state     (~(del by our-invites.state) path)
    :_  state
    [%pass / %agent [ship.path dap.bowl] %poke %invite-action !>(act)]~
  ::
  :: ++  handle-joined
  ::   |=  [path=space-path:store]
  ::   ^-  (quip card _state)
  ::   =.  our-invites.state     (~(del by our-invites.state) path)
  ::   :_  state
  ::   [%pass / %agent [ship.path dap.bowl] %poke %invite-action !>(act)]~
  ::
  --
::
:: ++  send-action
::   |%
::   ++  invite
::     |=  [dest=ship act=invite-action:store]
::     ^-  (list card)
::     [%pass / %agent [dest dap.bowl] %poke invite-action+!>(act)]~
  ::
  :: ++  spaces
  :: --
++  send-reaction
  |%
  ++  invite
    |=  [rct=invite-reaction:store]
    ^-  (list card)
    =/  paths=(list path)
      [/updates /response ~]
    [%give %fact paths invite-reaction+!>(rct)]~
  ::
  ++  spaces
    |=  [rct=spaces-reaction:store]
    ^-  (list card)
    =/  paths=(list path)
      [/updates /response ~]
    [%give %fact paths spaces-reaction+!>(rct)]~
  ::
  --
:: ++  send-invite-reaction
::   |=  [rct=invite-reaction:store]
::   ^-  (list card)
::   =/  paths=(list path)
::     [/updates /response ~]
::   [%give %fact paths %invite-reaction !>(+.rct)]~
:: ::
:: ++  send-invite-reaction
::   |=  [rct=invite-reaction:store]
::   ^-  (list card)
::   =/  paths=(list path)
::     [/updates /response ~]
::   [%give %fact paths %invite-reaction !>(+.rct)]~
::
:: ++  poke-peer
::   |=  [=reaction:store]
::   ^-  (list card)
::   =/  paths=(list path)
::     [/updates /response ~]
::   [%give %fact paths %spaces-reaction !>(reaction)]~
:: ::
++  send-view
  |=  [=reaction:store]
  ^-  (list card)
  =/  paths=(list path)
    [/updates ~]
  [%give %fact paths %spaces-view !>(reaction)]~
::
++  has-auth
  |=  [=space-path:store =ship =role:membership-store]
  (~(has in (~(got by (~(got by membership.state) space-path)) ship)) role)
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