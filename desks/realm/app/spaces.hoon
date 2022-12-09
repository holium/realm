::
::  %spaces [realm]:
::
::  a store for realm space metadata and members visas
::
::
/-  hark=hark-store
/-  store=spaces-store
/-  v-store=visas
/-  m-store=membership
/+  lib=spaces, visa-lib=visas, grp=groups
/+  default-agent, verb, dbug, agentio
::
|%
+$  card     card:agent:gall
+$  rolist   (list role:m-store)
+$  s-act    action:store
+$  s-react  reaction:store
+$  v-act    action:v-store
+$  v-react  reaction:v-store
::
+$  versioned-state  $%(state-0)
+$  state-0
  $:  %0
      =spaces:store
      =invitations:v-store
      =membership:m-store
  ==
--
::
=|  state-0
=*  state  -
::
%+  verb  &
%-  agent:dbug
::
^-  agent:gall
=<
  |_  =bowl:gall
  +*  this  .
      def   ~(. (default-agent this %|) bowl)
      core  ~(. +> bowl ~)
  ::
  ++  on-init
    ^-  (quip card _this)
    =^  cards  state  abet:init:core
    [cards this]
  ::
  ++  on-save
    ^-  vase
    !>(state)
  ::
  ++  on-load
    |=  ole=vase
    ^-  (quip card _this)
    =^  cards  state  abet:(load:core ole)
    [cards this]
  ::
  ++  on-poke
    |=  cag=cage
    ^-  (quip card _this)
    =^  cards  state  abet:(poke:core cag)
    [cards this]
  ::
  ++  on-peek
    |=  pat=path
    ^-  (unit (unit cage))
    (peek:core pat)
  ::
  ++  on-watch
    |=  pat=path
    ^-  (quip card _this)
    =^  cards  state  abet:(peer:core pat)
    [cards this]
  ::
  ++  on-agent
    |=  [wir=wire sig=sign:agent:gall]
    ^-  (quip card _this)
    =^  cards  state  abet:(dude:core wir sig)
    [cards this]
  ::
  ++  on-arvo   on-arvo:def
  ++  on-fail   on-fail:def
  ++  on-leave  on-leave:def
  --
::
|_  [bol=bowl:gall dek=(list card)]
+*  core  .
::
++  is-host  |=(p=@p =(our.bol ship))
++  emit     |=(=card core(dek [card dek]))
++  emil     |=(lac=(list card) core(dek (welp lac dek)))
++  abet     ^-((quip card _state) [(flop dek) state])
::
++  init
  ^+  core
  =;  [us=members:m-store ours=space:store]
    %=    core
      spaces.state      (~(put by *spaces:store) path.ours ours)
      membership.state  (~(put by *membership:m-store) path.ours us)
    ==
  :-  (my [our.bol [(sy `rolist`~[%owner %admin]) '' %host]]~)
  %-  create-space:lib
  :+  our.bol  'our'  :_  now.bol
  [(scot %p our.bol) '' %our %private '' '#000000' %home]
::
++  load
  |=  ole=vase
  ^+  core
  :: ::  prod
  :: =/  old  !<(versioned-state ole)
  :: ?>  ?=(%0 -.old)
  :: core(state old)
  ::  test
  ?^  old=(mole |.(!<(state-0 ole)))
    core(state u.old)
  %-  emil:init
  %+  turn  ~(tap in ~(key by wex.bol))
  |=([w=wire s=@p t=@tas] [%pass w %agent [s t] %leave ~])
::
++  poke
  |=  [mar=mark vaz=vase]
  ^+  core
  ?+    mar  ~|(bad-spaces-poke-mark/mar !!)
    %visa-action    (action:visas !<(action:v-store vaz))
    %spaces-action  (action:spaces !<(action:store vaz))
  ==
::  +peer: handle on-watch
::
++  peer
  |=  pol=(pole knot)
  ^+  core
  ?+    pol  ~|(bad-spaces-watch-path/pol !!)
      [%updates ~]
    ?>  =(our.bol src.bol)                              ::  only allow ourselves
    =-  (emit %give %fact [/updates]~ spaces-reaction+-)
    !>(`s-react`[%initial spaces.state membership.state invitations.state])
  ::
      [%spaces ~]
    ?>  =(our.bol src.bol)
    %-  emil
    %+  turn  ~(tap in ~(key by spaces.state))
    |=  s-p=space-path:store
    =-  [%give %fact ~ -]
    :-  %spaces-reaction
    !>  ^-  s-react
    :+  %add
      (~(got by spaces.state) s-p)
    (~(got by membership.state) s-p)
  ::
      [%spaces who=@ pat=@ ~]                           ::  the space-level watch
    =+  host=(slav %p who.pol)
    =+  space=(~(got by spaces.state) host pat.pol)
    =+  members=(~(got by membership.state) host pat.pol)
    ?>  ?|  =(access.space %public)
            (check-member:security [host pat.pol] src.bol)
        ==
    =-  (emit %give %fact [pol]~ spaces-reaction+-)
    !>(`s-react`[%remote-space [host pat.pol] space members])
  ==
::
++  dude
  |=  [pol=(pole knot) sig=sign:agent:gall]
  ^+  core
  ?+    pol  ~|(bad-spaces-wire/pol !!)
      [%spaces who=@ pat=@ ~]
    ?+    -.sig  ~|(bad-spaces-sign-on/pol !!)
        %fact
      ?+  p.cage.sig   ~|(bad-spaces-fact-mark/p.cage.sig !!)
        %visa-reaction    (reaction:visas !<(=reaction:v-store q.cage.sig))
        %spaces-reaction  (reaction:spaces !<(=reaction:store q.cage.sig))
      ==
    ::
        %kick
      ~&  >>  "{<dap.bol>}: got kicked, resubscribing - {<who.pol>} {<pat.pol>}"
      (emit %pass pol %agent [(slav %p who.pol) %spaces] %watch pol)
    ::
        %watch-ack
      ?~  p.sig  core
      ::  bunted update indicates failure
      ~&  >>>  "{<dap.bol>}: subscription failed - {<who.pol>} {<pat.pol>}"
      =-  (emit %give %fact [/updates]~ -)
      spaces-reaction+!>(`s-react`[%remote-space [~zod ''] *space:store ~])
    ==
  ==
::
++  peek
  |=  pol=(pole knot)
  ^-  (unit (unit cage))
  ?+    pol  ~|(bad-peek-path/pol !!)
    [%x %all ~]          ``spaces-view+!>([%spaces spaces.state])
    [%x %groups ~]       ``groups-view+!>((our-groups:grp our.bol now.bol))
    [%x %invitations ~]  ``visa-view+!>([%invitations invitations.state])
  ::
      [%x %groups who=@ nam=@ %members ~]
    =+  ship=(slav %p who.pol)
    =+  name=`@t`nam.pol
    =-  ``groups-view+!>([%members fleet:-])
    (get-group:grp [ship name] our.bol now.bol)
  ::
      [%x who=@ pat=@ rest=*]
    =+  host=(slav %p who.pol)
    ?+    rest.pol  !!
      ~  ``spaces-view+!>([%space (~(got by spaces.state) [host pat.pol])])
    ::
        [%members ~]
      :+  ~  ~
      membership-view+!>([%members (~(got by membership.state) [host pat.pol])])
    ::
        [%members dem=@ ~]
      =+  them=(slav %p dem.rest.pol)
      =-  ``membership-view+!>([%member -])
      (~(got by (~(got by membership.state) [host pat.pol])) them)
    ::
        [%is-member dem=@ ~]
      =+  them=(slav %p dem.rest.pol)
      =-  ``membership-view+!>([%is-member -])
      (~(has by (~(got by membership.state) [host pat.pol])) them)
    ==
  ==
::
++  spaces
  |%
  ++  action
    |=  [act=action:store]
    |^  ^+  core
      ?-  -.act
        %add     (handle-add +.act)
        %join    (handle-join +.act)
        %leave   (handle-leave +.act)
        %update  (handle-update +.act)
        %remove  (handle-remove +.act)
        :: %kicked  (handle-kicked +.act)
      ==
    ::
    ++  handle-add
      |=  [slug=@t payload=add-payload:store members=members:m-store]
      ^+  core
      ?>  (team:title our.bol src.bol)
      =/  new=space:store
        (create-space:lib our.bol slug payload now.bol)
      ?<  (~(has by spaces.state) path.new)             :: don't overwrite
      ::  return updated state and a combination of invitations (pokes)
      ::   to new members and gifts to any existing/current subscribers
      %.  :_  (initial-visas:helpers path.new members new)
          ::  XX: are there any subscribers, already? maybe only initial-visas
          [%give %fact [/updates]~ spaces-reaction+!>(`s-react`[%add new members])]
      %=  emil
        spaces.state  (~(put by spaces.state) [path.new new])
        ::
            membership.state
          %+  ~(put by membership.state)  path.new
          (~(put by members) [our.bol (silt `rolist`~[%owner %admin]) '' %host])
      ==
    ::
    ++  handle-update
      |=  [path=space-path:store edit-payload=edit-payload:store]
      ^+  core
      ?>  (has-auth:security path src.bol %admin)
      =+  old=(~(got by spaces.state) path)
      =+  new=(edit-space old edit-payload)
      ?:  =(old new)  core
      =.  updated-at.new  now.bol
      =+  pats=~[/updates /spaces/(scot %p ship.path)/(scot %tas space.path)]
      %-  emit(spaces.state (~(put by spaces.state) path new))
      [%give %fact pats spaces-reaction+!>(`s-react`[%replace new])]
    ::
    ++  edit-space
      |=  [=space:store edit=edit-payload:store]
      %=  space
        name         name.edit
        description  description.edit
        access       access.edit
        picture      picture.edit
        color        color.edit
        theme        theme.edit
      ==
    ::
    ++  handle-remove
      |=  [path=space-path:store]
      ^+  core
      ?>  &(!=('our' space.path) (has-auth:security path src.bol %owner))
      =+  pats=~[/updates /spaces/(scot %p ship.path)/(scot %tas space.path)]
      %.  [%give %fact pats spaces-reaction+!>(`s-react`[%remove path])]
      %=  emit
        spaces.state      (~(del by spaces.state) path)
        membership.state  (~(del by membership.state) path)
      ==
    ::
    ++  handle-join
      |=  [path=space-path:store]
      ^+  core
      ?:  (is-host ship.path)
        ::  member joins and watches host
        =+  pat=/spaces/(scot %p ship.path)/(scot %tas space.path)
        %-  emil
        :~  =-  [%pass / %agent [ship.path %spaces] -]
            [%poke spaces-action+!>(`s-act`[%join path])]
          ::
            [%pass pat %agent [ship.path %spaces] %watch pat]
        ==
      ::  host accepts a join, maybe
      =/  spat=space:store  (~(got by spaces.state) path)
      =/  mems=(map ship member:m-store)
        (~(got by membership.state) path)
      =/  member=(unit member:m-store)
        ?.  =(%public access.spat)
          (~(get by mems) src.bol)
        `[(silt `rolist`[%member]~) '' %joined]
      ?~  member  core
      =.  status.u.member  %joined
      %=    core
          membership.state
        %-  ~(put by membership.state)
        [path (~(put by mems) src.bol u.member)]
      ==
    ::
    ++  handle-leave
      |=  [path=space-path:store]
      ^+  core
      =+  pat=/spaces/(scot %p ship.path)/(scot %tas space.path)
      ?:  (is-host ship.path)
        ::  host says goodbye, removes a member
        =.  membership.state
          %+  ~(put by membership.state)  path
          (~(del by (~(got by membership.state) path)) src.bol)
        =-  (emit %give %fact ~[/updates pat] -)
        visa-reaction+!>(`v-react`[%kicked path src.bol])
      ::  member handles leaving a space
      =.  state
        %=  state
          spaces      (~(del by spaces.state) path)
          membership  (~(del by membership.state) path)
        ==
      =;  cards=(list card)
        ?~  maybe-invite=(~(get by invitations.state) path)
          (emil cards)
        =.  invitations.state  (~(del by invitations.state) path)
        (emil cards)
      :~  [%pass pat %agent [our.bol %spaces] %leave ~]
          [%give %fact [/updates]~ spaces-reaction+!>(`s-react`[%remove path])]
          =-  [%pass / %agent [ship.path dap.bol] -]
          [%poke spaces-action+!>(`s-act`[%leave path])]
      ==
    ::
    --
  ++  reaction
    |=  [rct=reaction:store]
    |^  ^+  core
      ?-  -.rct
        %initial        (on-initial +.rct)
        %add            (on-add +.rct)
        %replace        (on-replace +.rct)
        %remove         core  ::(on-remove +.rct)
        %remote-space   (on-remote-space +.rct)
      ==
    ::
    ++  on-initial  ::  XX: suggest |=(* ^+(core core)) until in use
      |=  [=spaces:store =membership:m-store =invitations:v-store]
      ^+(core core)
    ::
    ++  on-add
      |=  [space=space:store members=members:m-store]
      ^+(core core)
    ::
    ++  on-replace
      |=  [space=space:store]
      ^+  core
      core(spaces.state (~(put by spaces.state) path.space space))
    ::
    ++  on-remove
      |=  [path=space-path:store]
      ^+  core
      =.  spaces.state          (~(del by spaces.state) path)
      ?:  (is-host ship.path)
        ::  host handles removal
        =+  pat=[/spaces/(scot %p ship.path)/(scot %tas space.path)]~
        %-  emil(membership.state (~(del by membership.state) path))
        ^-  (list card)
        :~  `card`[%give %kick pat ~]
            `card`[%give %fact pat spaces-reaction+!>(`s-react`[%remove path])]
        ==
      ::  member handles a removed space
      ?~  has-incoming=(~(get by invitations.state) path)
        core(membership.state (~(del by membership.state) path))
      ::  she also cleans up an invite
      =+  pat=/spaces/(scot %p ship.path)/(scot %tas space.path)
      %-  %=  emil
            membership.state  (~(del by membership.state) path)
            invitations.state  (~(del by invitations.state) path)
          ==
      ^-  (list card)
      :~  [%pass pat %agent [our.bol %spaces] %leave ~]
          [%give %fact [/updates]~ spaces-reaction+!>(`s-react`[%remove path])]
      ==
    ::
    ++  on-remote-space
      |=  [path=space-path:store =space:store =members:m-store]
      ^+  core
      %.  :~  =-  [%give %fact [/updates]~ -]
              spaces-reaction+!>(`s-react`[%remote-space path space members])
            ::
              =-  [%give %fact [/spaces]~ -]
              spaces-reaction+!>(`s-react`[%add space members])
          ==
      %=  emil
        spaces.state      (~(put by spaces.state) [path space])
        membership.state  (~(put by membership.state) [path members])
      ==
    ::
    --
  ++  helpers
    |%
    ++  initial-visas
      |=  [path=space-path:store =members:m-store =space:store]
      ^-  (list card)
      ::  loop thru each member, and build a list of invitations/pokes (acc)
      %-  ~(rep by (~(del by members) our.bol))
      |=  [[=ship =member:m-store] acc=(list card)]
      :_  acc
      =-  [%pass / %agent [ship %spaces] %poke visa-action+-]
      !>  ^-  v-act
      :+  %invited  path
      %-  new-visa:visa-lib 
      [path src.bol ship (head ~(tap in roles.member)) space '' now.bol]
    ::
    --
  --
++  visas
  |%
  ++  action
    |=  [act=action:v-store]
    |^  ^+  core
      ?-  -.act
        %invited         (handle-invited +.act)
        %stamped         (handle-stamped +.act)
        %kick-member     (handle-kick +.act)
        %send-invite     (handle-send +.act)
        %accept-invite   (handle-accept +.act)
        %revoke-invite   (handle-deported +.act)
        %decline-invite  (handle-decline +.act)
      ==
    ::
    ++  handle-deported
      |=  [path=space-path:store]
      ^+  core
      =.  invitations.state  (~(del by invitations.state) path)
      =-  (emit %give %fact [/updates]~ -)
      visa-reaction+!>(`v-react`[%invite-removed path])
    ::
    ++  handle-send  ::  sends an invite to a ship
      |=  [path=space-path:store =ship =role:m-store message=@t]
      ^+  core
      ?>  (check-member:security path src.bol)          ::  only members can invite
      ?:  (check-member:security path ship)  core       ::  only invite non-members
      =+  space=(~(got by spaces.state) path)
      =/  new-visa  
        (new-visa:visa-lib path src.bol ship role space message now.bol)
      ?.  (is-host ship.path)
        ::  member sends invite request to host
        =-  (emit %pass / %agent [ship.path %spaces] %poke -)
        visa-action+!>([%send-invite path ship role message])
      ::  host handles sending invite
      ::  XX: "dont invite yourself" - is this actually prevented?
      ?>  =(our.bol src.bol)
      =+  new-mem=[(silt `rolist`~[role]) '' `status:m-store`%invited]
      =.  membership.state
        %+  ~(put by membership.state)  path
        %.  [ship new-mem]
        ~(put by (~(gut by membership.state) path *members:m-store))
      =/  paths=(list (pole knot))
        ~[/updates /spaces/(scot %p ship.path)/(scot %tas space.path)]
      %-  emil
      :~  =-  [%give %fact paths visa-reaction+-]
          !>(`v-react`[%invite-sent path ship new-visa new-mem])
        ::
          =-  [%pass / %agent [ship %spaces] %poke -]
          visa-action+!>(`v-act`[%invited path new-visa])
      ==
    ::
    ++  handle-invited  ::  when an invite is received
      |=  [path=space-path:store =invite:v-store]
      ^+  core
      =.  invitations.state
        (~(put by invitations.state) [path invite])
      =/  notify=action:hark
        =-  (notify path /invite (crip -))
        " issued you a invite to join {<`@t`(scot %tas name.invite)>} in realm."
      %-  emil
      :~  =-  [%give %fact [/updates]~ visa-reaction+-]
          !>(`v-react`[%invite-received path invite])
        ::
          =+  cag=hark-action+!>(notify)
          [%pass / %agent [[our.bol %hark-store] %poke cag]]
      ==
    ::
    ++  handle-stamped
      |=  [path=space-path:store]
      ^+  core
      =+  pat=/spaces/(scot %p ship.path)/(scot %tas space.path)
      =.  invitations.state  (~(del by invitations.state) path)
      ::  watch the spaces and passports path once invite flow is complete
      %-  emil
      :~  [%pass pat %agent [ship.path %spaces] %watch pat]
        ::  remove invite after accpetance
          =-  [%give %fact [/updates]~ -]
          visa-reaction+!>(`v-react`[%invite-removed path])
      ==
    ::
    ++  handle-accept
      |=  [path=space-path:store]
      ^+  core
      ?.  (is-host ship.path)
        ::  member sends accept request to host
        =-  (emit %pass / %agent [ship.path %spaces] %poke -)
        visa-action+!>(`v-act`[%accept-invite path])
      ::  host handles acceptance
      =+  mems=(~(got by membership.state) path)
      =+  them=(~(got by mems) src.bol)
      =.  status.them  %joined
      =.  membership.state
        %-  ~(put by membership.state)
        [path (~(put by mems) src.bol them)]
      =/  paths
        ~[/updates /spaces/(scot %p ship.path)/(scot %tas space.path)]
      %-  emil
      :~  =+  cag=visa-reaction+!>(`v-act`[%stamped path])
          [%pass / %agent [src.bol %spaces] %poke cag]
        ::
          =+  cag=contact-share+!>([%share src.bol])
          [%pass / %agent [our.bol %contact-push-hook] %poke cag]
        ::
          =-  [%give %fact paths visa-reaction+-]
          !>(`v-react`[%invite-accepted path src.bol them])
      ==
    ::
    ++  handle-decline
      |=  [path=space-path:store]
      ^+  core
      ?.  (is-host ship.path)
        ::  member sends decline to host, emits a fact
        =+  pat=/spaces/(scot %p ship.path)/(scot %tas space.path)
        =.  invitations.state  (~(del by invitations.state) path)
        %-  emil
        :~  =-  [%pass pat %agent [ship.path %spaces] %poke -]
            visa-action+!>(`v-act`[%decline-invite path])
        ::
            =-  [%give %fact [/updates]~ -]
            visa-reaction+!>(`v-react`[%invite-removed path])
        ==
      ::  host handles decline from member
      =.  membership.state
        %+  ~(put by membership.state)  path
        (~(del by (~(got by membership.state) path)) src.bol)
      =-  (emit %give %fact [/updates]~ -)
      visa-reaction+!>(`v-react`[%kicked path src.bol])
    ::
    ++  handle-kick
      |=  [path=space-path:store =ship]
      ^+  core
      ?>  (has-auth:security path src.bol %admin)
      ?.  (is-host ship.path)
        ::  member sends a kick request to host
        =+  cag=visa-action+!>(`v-act`[%kick-member path ship])
        (emit [%pass / %agent [ship.path %spaces] %poke cag])
      ::  host handles the kick
      =.  membership.state
        %+  ~(put by membership.state)  path
        (~(del by (~(got by membership.state) path)) ship)
      =/  pat=(pole knot)
        /spaces/(scot %p ship.path)/(scot %tas space.path)
      %-  emil
      :~  [%give %kick [pat]~ (some ship)]
      ::
        =-  [%give %fact ~[/updates pat] -]
        visa-reaction+!>(`v-react`[%kicked path ship])
      ::
        =-  [%pass / %agent [ship %spaces] %poke -]
        visa-action+!>(`v-act`[%revoke-invite path])
      ==
    --
  ++  reaction
    |=  [rct=reaction:v-store]
    |^  ^+  core
      ?-  -.rct
        %kicked           (on-kicked +.rct)
        %invite-sent      (on-sent +.rct)
        %invite-removed   core
        %invite-received  core
        %invite-accepted  (on-accepted +.rct)
      ==
    ::
    ++  on-sent
      |=  [path=space-path:store =ship =invite:v-store =member:m-store]
      ^+  core        
      =/  passes
        %.  [ship [(silt `rolist`~[role.invite]) '' %invited]]
        ~(put by (~(gut by membership.state) path *members:m-store)) 
      =.  membership.state  (~(put by membership.state) [path passes])
      =-  (emit %give %fact [/updates]~ -)
      visa-reaction+!>(`v-react`[%invite-sent path ship invite member])
    ::
    ++  on-accepted
      |=  [path=space-path:store =ship =member:m-store]
      ^+  core
      =.  membership.state
        %+  ~(put by membership.state)  path
        %.  [ship member]
        ~(put by (~(gut by membership.state) path *members:m-store))
      =-  (emit %give %fact [/updates]~ -)
      visa-reaction+!>(`v-react`[%invite-accepted path ship member])
    ::
    ++  on-kicked
      |=  [path=space-path:store =ship]
      ^+  core
      ?:  =(our.bol ship)
        ::  we've been kicked
        =+  pat=/spaces/(scot %p ship.path)/(scot %tas space.path)
        %-  %=  emil
              spaces.state       (~(del by spaces.state) path)
              membership.state   (~(del by membership.state) path)
              invitations.state  (~(del by invitations.state) path)
            ==
        ^-  (list card)
        :~  [%pass pat %agent [ship.path %spaces] %leave ~]
        ::
          [%give %fact [/updates]~ spaces-reaction+!>(`s-react`[%remove path])]
        ==
      ::  host sends a kick
      =.  membership.state
        %+  ~(put by membership.state)  path
        (~(del by (~(got by membership.state) path)) ship)
      =-  (emit %give %fact [/updates]~ -)
      visa-reaction+!>(`v-react`[%kicked path ship])
    --
  ::
  ++  helpers
    |%
    :: ++  set-outgoing
    ::   |=  [path=space-path:store =ship inv=invite:v-store]
    ::   =/  space-invites               (~(gut by outgoing.invitations.state) path `space-invitations:v-store`[~])
    ::   =.  space-invites               (~(put by space-invites) [ship inv])
    ::   (~(put by outgoing.invitations.state) [path space-invites])
    :: ::
    --
  --
::
::
++  security
  |%
  ++  has-auth
    |=  [path=space-path:store =ship =role:m-store]
    ^-  ?
    =;  member=member:m-store
      (~(has in roles.member) role)
    (~(got by (~(got by membership.state) path)) ship)
  ::
  ++  check-member
    |=  [path=space-path:store =ship]
    ^-  ?
    ?~(mems=(~(get by membership.state) path) | (~(has by u.mems) ship))
  ::
  --
::
++  notify
  |=  [pth=space-path:store slug=path msg=cord]
  ^-  action:hark
  :+  %add-note
    `bin:hark`[/ [%realm /spaces/(scot %p ship.pth)]]
  :*  [ship/ship.pth text/msg ~]
      ~
      now.bol
      /
      %-  weld
      :_  slug
      /spaces/(scot %p ship.pth)/(scot %tas space.pth)
  ==
--