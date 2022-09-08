/-  store=spaces, membership-store=membership, invite-store=visas, hark=hark-store,
      passports-store=passports
/+  default-agent, verb, dbug, agentio, lib=spaces, inv-lib=visas, grp=groups
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
    =/  our-name  `@t`(scot %p our.bowl)
    =/  our-space  (create-space:lib our.bowl 'our' [name=our-name %our %private '' '#000000' %home] now.bowl)
    =/  initial-spaces  `spaces:store`(~(put by spaces.state) [path:our-space our-space])
    ~&  >  '%spaces initialized'
    =.  state  [%0 spaces=initial-spaces]
    :_  this
    :~  [%pass /passports %agent [our.bowl %passports] %watch /all]
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
      %spaces-action    (spaces-action:core !<(action:store vase))
    ==
    [cards this]
    --
  ++  on-peek
    |=  =path
    ^-  (unit (unit cage))
    ?+    path  (on-peek:def path)
      ::
      ::  ~/scry/spaces/all.json
        [%x %all ~]    ``spaces-view+!>([%spaces spaces.state])
      ::
      ::  ~/scry/spaces/groups.json
        [%x %groups ~]
      =/  groups   (our-groups:grp our.bowl now.bowl)
      :: ~&  >  [groups]
      ``groups-view+!>([%groups groups])
      :: ::
      :: ::
      ::  ~/scry/spaces/~fes/our.json
        [%x @ @ ~]
      =/  =ship       `@p`(slav %p i.t.path)
      =/  space-pth   `@t`i.t.t.path
      =/  space       (~(got by spaces.state) [ship space-pth])
      ``spaces-view+!>([%space space])
    ==
  ::
  ++  on-watch
    |=  =path
    ^-  (quip card _this)
    =/  cards=(list card)
      ?+    path      (on-watch:def path)
          [%updates ~]
        ::  only host should get all updates
        ?>  =(our.bowl src.bowl)
        (spaces:send-reaction [%initial spaces.state] [/updates ~])
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
        :: ~&  >  [i.t.path host space-pth src.bowl]
        :: ?>  (check-member:core [host space-pth] src.bowl)     ::  only members should subscribe
        =/  space        (~(got by spaces.state) [host space-pth])
        (member:send-reaction [%new-space [host space-pth] space] [/spaces/(scot %p host)/(scot %tas space-pth) ~])
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
            ?+    p.cage.sign  (on-agent:def wire sign)
                %spaces-reaction
              =^  cards  state
                (spaces-reaction:core !<(=reaction:store q.cage.sign))
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
            :_  this
            :~  [%pass /passports %agent [our.bowl %passports] %watch /all]
            ==
      ::
          %fact
            ?+    p.cage.sign     (on-agent:def wire sign)
            ::
                %passports-reaction
              =^  cards  state
                (passports-reaction:core !<(=reaction:passports-store q.cage.sign))
              [cards this]
            ::
                %visa-reaction
              =^  cards  state
                (visa-reaction:core !<(=reaction:invite-store q.cage.sign))
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
++  this  .
::
++  spaces-action
  |=  [act=action:store]
  ^-  (quip card _state)
  |^
  ?-  -.act
    %add            (handle-add +.act)
    %update         (handle-update +.act)
    %remove         (handle-remove +.act)
    %join           (handle-joined +.act)
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
    =.  members               (~(put by members) [our.bowl [roles=(silt `(list role:membership-store)`~[%owner %admin]) status=%host]])
    ::  return updated state and a combination of invitations (pokes)
    ::   to new members and gifts to any existing/current subscribers (weld)
    :_  state
    (spaces:send-reaction [%add new-space members] [/updates /our ~])
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
    =.  spaces.state          (~(put by spaces.state) path updated)
    :_  state
    (spaces:send-reaction [%replace updated] watch-paths)
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
    =/  watch-paths         [/updates /our /spaces/(scot %p ship.path)/(scot %tas space.path) ~]
    :_  state
    (spaces:send-reaction [%remove path] watch-paths)
  ::
  ++  handle-kicked
    |=  [path=space-path:store =ship]
    ^-  (quip card _state)
    ?:  =(our.bowl ship)  :: we are kicked
      =.  spaces.state        (~(del by spaces.state) path)
      =/  watch-path          /spaces/(scot %p ship.path)/(scot %tas space.path)
      :_  state
      :~  [%give %fact [/updates /our ~] spaces-reaction+!>([%remove path])]  ::  notify our watches
      ==
    `state
  ::
  ++  handle-joined
    |=  [path=space-path:store =ship]
    ^-  (quip card _state)
    :_  state
    :~  [%pass /spaces %agent [ship.path dap.bowl] %watch /spaces/(scot %p ship.path)/(scot %tas space.path)]
    ==
  ::
  --
::
++  spaces-reaction
  |=  [rct=reaction:store]
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
    `state
  ::
  ++  on-new-space
    |=  [path=space-path:store space=space:store]
    ^-  (quip card _state)
    =.  spaces.state          (~(put by spaces.state) [path space])
    :_  state
    (spaces:send-reaction [%new-space path space] [/updates ~])
  ::
  --
::
++  visa-reaction
  |=  [rct=reaction:invite-store]
  ^-  (quip card _state)
  |^
  ?-  -.rct
    %invite-sent
      ~&  >  "{<dap.bowl>}: visa-reaction [invite-sent] => {<rct>}"
      `state
    %invite-accepted    (on-accepted +.rct)
    %kicked             (on-kicked +.rct)
  ==
  ::
  ++  on-kicked
    |=  [path=space-path:store =ship]
    ^-  (quip card _state)
    ~&  >  "{<dap.bowl>}: visa-reaction [kicked] => {<rct>}"
    ?:  (is-host:core ship.path) ::  we are the host, so will kick the member from spaces
      :_  state
      [%give %kick ~[/spaces/(scot %p ship.path)/(scot %tas space.path)] (some ship)]~
    ::  we are not host or kicked, so no change
    `state
  :: ::
  ++  on-accepted
    |=  [path=space-path:store =ship =passport:passports-store]
    ^-  (quip card _state)
    ~&  >  "{<dap.bowl>}: visa-reaction [invite-accepted] => {<rct>}"
    `state
  ::
  --
:: ::
++  passports-reaction
  |=  [rct=reaction:passports-store]
  ^-  (quip card _state)
  |^
  ?-  -.rct
    %all            (on-all +.rct)
    %members        (on-members +.rct)
  ==
  ::
  ++  on-all
    |=  [=districts:passports-store]
    ^-  (quip card _state)
    `state
  :: ::
  ++  on-members
    |=  [path=space-path:store =passports:passports-store]
    ^-  (quip card _state)
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
  ++  spaces
    |=  [rct=reaction:store paths=(list path)]
    ^-  (list card)
    [%give %fact paths spaces-reaction+!>(rct)]~
  ::
  --
::
++  has-auth
  |=  [path=space-path:store =ship =role:membership-store]
  ::  TODO scry passports
  :: ~&  >  [path ship role]
  =/  member   .^(view:passports-store %gx /(scot %p our.bowl)/passports/(scot %da now.bowl)/(scot %p ship.path)/(scot %tas space.path)/members/(scot %p ship)/noun)
  ?>  ?=(%member -.member)
  :: ~&  >  [member]
  ::
  ::
  :: =/  member        (~(got by (~(got by membership.state) space-path)) ship)
  :: (~(has in roles.member) role)
  %.y
::
++  check-member
  |=  [path=space-path:store =ship]
  ^-  ?
  =/  member   .^(view:passports-store %gx /(scot %p our.bowl)/passports/(scot %da now.bowl)/(scot %p ship.path)/(scot %tas space.path)/is-member/(scot %p ship)/noun)
  ?>  ?=(%is-member -.member)
  :: ~&  >  ['is member' is-member.member]
  is-member.member
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