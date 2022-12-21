::  courier [realm]:
::
::  A thin agent that interfaces with various chat stores
::
/-  store=courier, post, graph-store, *post, *resource, *versioned-state, group, inv=invite-store, met=metadata-store,
    hark=hark-store, dm-hook-sur=dm-hook, notify, agd-type=accept-group-dm, cs=contact-store
/+  dbug, default-agent, lib=courier, hook=dm-hook, notif-lib=notify, groups-two
=|  state-2
=*  state  -
=<
  %-  agent:dbug
  |_  =bowl:gall
  +*  this  .
      def   ~(. (default-agent this %.n) bowl)
      core   ~(. +> [bowl ~])
  ::
  ++  on-init
    ^-  (quip card _this)
    =.  groups-target.state     %2
    =.  app-id.state            '82328a88-f49e-4f05-bc2b-06f61d5a733e'
    =.  uuid.state              (sham our.bowl)
    =.  push-enabled.state      %.y
    :_  this
    ::  %watch: all incoming dms and convert to our simple structure
    :~
      [%pass /graph-store %agent [our.bowl %graph-store] %watch /updates]
      [%pass /dm-hook %agent [our.bowl %dm-hook] %watch /updates]
    ==
  ++  on-save   !>(state)
  ++  on-load
    |=  =vase
    ^-  (quip card _this)
    ~&  %on-load
    =/  old=(unit versioned-state)
      (mole |.(!<(versioned-state vase)))
    :: ~&  old
    ?^  old
      `this(state (migrate-state u.old)) 
    ~&  >>  'nuking old state'
    =^  cards  this  on-init
    :_  this
    =-  (welp - cards)
    %+  turn  ~(tap in ~(key by wex.bowl))
    |=  [=wire =ship =term]
    ^-  card
    [%pass wire %agent [ship term] %leave ~]
  ::
  ++  on-poke
    |=  [=mark =vase]
    ^-  (quip card _this)
    |^
    =^  cards  state
    ?+  mark  (on-poke:def mark vase)
      %test  [(test-scry:groups-two 0 bowl) state]
      %accept-dm
        ?-  groups-target
          %1
            =/  dm-hook-action  !<(action:dm-hook-sur vase)
            ?-  -.dm-hook-action
              %decline  !!
              %pendings  !!
              %screen  !!
              %accept
              :-
                [%pass / %agent [our.bowl %dm-hook] %poke dm-hook-action+!>([%accept ship.dm-hook-action])]~
                state
            ==
          %2  [(accept-dm:groups-two !<(action:dm-hook-sur vase) bowl) state]
        ==
      %accept-group-dm
        ?-  groups-target
          %1
            =/  accept-action  !<(action:agd-type vase)
            :-
            [%pass / %agent [our.bowl %invite-store] %poke invite-action+!>([-.accept-action term=%group uid=id.accept-action])]~
            state
          %2  [(accept-group-dm:groups-two !<(action:agd-type vase) bowl) state]
        ==
      %graph-dm-action
        ?-  groups-target
          %1  (on-graph-action:core !<(action:store vase))
          %2  (on-graph-action:groups-two !<(action:store vase) bowl state)
        ==
      %notify-action  (on-notify-action:core !<(action:notify vase))
      %set-groups-target
      ::   :courier &set-groups-target %2
      =.  groups-target.state     !<(targetable-groups vase)
      :_  state
      (set-groups-target:groups-two !<(targetable-groups vase) bowl)
        :: [%1 !<(targetable-groups vase) +>:state]
    ==
    [cards this]
  --
  ::
  ++  on-watch
    |=  =path
    ^-  (quip card _this)
    ?>  =(our.bowl src.bowl)
    =/  cards=(list card)
      ?:  =(groups-target %2)
        (on-watch:groups-two path bowl state)
      :: ~&  "on-watch called in %courier"
      :: ~&  path
      ?+    path      (on-watch:def path)
          [%updates ~]
        =/  dm-previews   (previews:gs:lib our.bowl now.bowl)
        [%give %fact [/updates ~] graph-dm-reaction+!>([%previews dm-previews])]~
      ==
    [cards this]
  ::
  ++  on-peek
    |=  =path
    ^-  (unit (unit cage))
    ?:  =(groups-target %2)
      (peek:groups-two path bowl devices.state state)
    ?+    path  (on-peek:def path)
    ::
      [%x %devices ~]
        ~&  "peeking at old groups still"
        ?>  =(our.bowl src.bowl)
        ``notify-view+!>([%devices devices.state])
    ::
      [%x %dms ~]
        ?>  =(our.bowl src.bowl)
        =/  dm-previews   (previews:gs:lib our.bowl now.bowl)
        ``graph-dm-view+!>([%inbox dm-previews])
      ::
      [%x %dms %group @ @ ~]    ::  ~/scry/courier/dms/group/~dev/~2022.8.28..20.32.55.json
        ?>  =(our.bowl src.bowl)
        =/  entity       `@p`(slav %p i.t.t.t.path)
        =/  timestamp    `@t`i.t.t.t.t.path
        =/  dms           (grp-log:gs:lib our.bowl now.bowl entity timestamp)
        ``graph-dm-view+!>([%dm-log dms])
      [%x %dms @ ~]             ::  ~/scry/courier/dms/~dev.json
        ?>  =(our.bowl src.bowl)
        =/  to-ship       `@p`(slav %p i.t.t.path)
        =/  dms           (dm-log:gs:lib our.bowl to-ship now.bowl)
        ``graph-dm-view+!>([%dm-log dms])
      [%x %rolodex ~]
        :-  ~  :-  ~  :-  %rolodex
        !>(.^(rolodex:cs %gx /(scot %p our.bowl)/contact-store/(scot %da now.bowl)/all/noun))
    ::
    ::  ~/scry/courier/dms/~dev/paged/0/20.json
      :: [%x %dms @ %paged @ @ ~]
      ::   ?>  =(our.bowl src.bowl)
      ::   =/  to-ship       `@p`(slav %p i.t.t.path)
      ::   =/  dms           (gen-dms:gs:lib our.bowl to-ship now.bowl)
      ::   ``graph-dm-view+!>([%dm-log dms])
    ==
  ::
  ++  on-agent
    |=  [=wire =sign:agent:gall]
    ^-  (quip card _this)
    :: ~&  wire
    ?+    wire  (on-agent:def wire sign)
      [%graph-store ~]
        ?+    -.sign  (on-agent:def wire sign)
          %watch-ack
            ?~  p.sign  `this
            ~&  >>>  "{<dap.bowl>}: graph-store subscription failed"
            `this
          %kick
            ~&  >  "{<dap.bowl>}: graph-store kicked us, resubscribing..."
            :_  this
            :~
              [%pass /graph-store %agent [our.bowl %graph-store] %watch /updates]
            ==
          %fact
            ?+    p.cage.sign  (on-agent:def wire sign)
                %graph-update-3
              =^  cards  state
                (on-graph-update !<(=update:graph-store q.cage.sign) now.bowl our.bowl)
              [cards this]
            ==
        ==
      [%dm-hook ~]
        ?+    -.sign  (on-agent:def wire sign)
          %watch-ack
            ?~  p.sign  `this
            ~&  >>>  "{<dap.bowl>}: dm-hook subscription failed"
            `this
          %kick
            ~&  >  "{<dap.bowl>}: dm-hook kicked us, resubscribing..."
            :_  this
            :~
              [%pass /dm-hook %agent [our.bowl %dm-hook] %watch /updates]
            ==
          %fact
            ?+    p.cage.sign  (on-agent:def wire sign)
                %dm-hook-action
              =^  cards  state
                (on-hook-action !<(=action:dm-hook-sur q.cage.sign) now.bowl our.bowl)
              [cards this]
            ==
        ==
      [%g2 %club @ %ui ~]
        ?+    -.sign  (on-agent:def wire sign)
          %watch-ack
            ?~  p.sign  `this
            ~&  >>>  "{<dap.bowl>}: groups-two /club/id/ui subscription failed"
            `this
          %kick
            ~&  >  "{<dap.bowl>}: groups-two /club/id/ui kicked us, giving up..."
            `this
          %fact
            :: ~&  ['club fact' cage.sign]
            =^  cards  state
              (handle-club-ui-fact:groups-two wire cage.sign bowl state)
            [cards this]
            ::[(handle-club-ui-fact:groups-two wire cage.sign bowl state) this]
        ==
      [%g2 %briefs ~]
        ?+    -.sign  (on-agent:def wire sign)
          %watch-ack
            ?~  p.sign  `this
            ~&  >>>  "{<dap.bowl>}: groups-two /briefs subscription failed"
            `this
          %kick
            ~&  >  "{<dap.bowl>}: groups-two /briefs kicked us, resubscribing..."
            :_  this
            :~
              [%pass /g2/briefs %agent [our.bowl %chat] %watch /briefs]
            ==
          %fact
            ~&  'groups-two /briefs fact'
            ~&  cage.sign
            [(propagate-briefs-fact:groups-two cage.sign bowl state) this]
            :: [whom:c brief:briefs:c]
        ==
      [%g2 %dm @ %ui ~]
        :: ~&  -.sign
        ?+    -.sign  (on-agent:def wire sign)
          %watch-ack
            ?~  p.sign  `this
            ~&  >>>  "{<dap.bowl>}: groups-two /dm/ui subscription failed"
            `this
          %kick
            ~&  >  "{<dap.bowl>}: groups-two /dm/ui kicked us, giving up..."
            `this
          %fact
            =^  cards  state
              (handle-dm-ui-fact:groups-two wire cage.sign bowl state)
            [cards this]
            ::[(handle-dm-ui-fact:groups-two cage.sign bowl state) this]
        ==
      [%g2 %club %new ~]
        :: ~&  -.sign
        ?+    -.sign  (on-agent:def wire sign)
          %watch-ack
            ?~  p.sign  `this
            ~&  >>>  "{<dap.bowl>}: groups-two /club/new subscription failed"
            `this
          %kick
            ~&  >  "{<dap.bowl>}: groups-two /club/new kicked us, resubscribing..."
            :_  this
            :~
              [%pass /g2/club/new %agent [our.bowl %chat] %watch /club/new]
            ==
          %fact
            [(handle-club-invite:groups-two cage.sign bowl) this]
        ==
      [%g2 %dm %invited ~]
        :: ~&  -.sign
        ?+    -.sign  (on-agent:def wire sign)
          %watch-ack
            ?~  p.sign  `this
            ~&  >>>  "{<dap.bowl>}: groups-two /dm/invited subscription failed"
            `this
          %kick
            ~&  >  "{<dap.bowl>}: groups-two /dm/invited kicked us, resubscribing..."
            :_  this
            :~
              [%pass /g2/dm/invited %agent [our.bowl %chat] %watch /dm/invited]
            ==
          %fact
            [(handle-dm-invite:groups-two cage.sign bowl) this]
        ==
    ==
  ::
  ++  on-leave    on-leave:def
  ::
  ++  on-arvo
    |=  [=wire =sign-arvo]
    ^-  (quip card _this)
    ?+  wire  (on-arvo:def wire sign-arvo)
        [%push-notification *]
      `this
    ==
  ::
  ++  on-fail     on-fail:def
  --
::
|_  [=bowl:gall cards=(list card)]
::
++  this  .
++  core  .
::
++  on-graph-action
  |=  [act=action:store]
  ^-  (quip card _state)
  |^
  ?-  -.act
    :: %accept-dm            `state
    :: %decline-dm           `state
    %send-dm               (send-dm +.act)
    %read-dm               (read-dm +.act)
    %create-group-dm       (create-group-dm +.act)
    %send-group-dm         (send-group-dm +.act)
    %read-group-dm         (read-group-dm +.act)
    %set-groups-target     (on-graph-action:groups-two act bowl state)
  ==
  ::
  ++  accept-dm
    |=  =ship
    `state
  ::
  ++  decline-dm
    |=  =ship
    `state
  ::
  ++  read-dm
    |=  [=ship]
    =/  action      ^-(action:hark [%read-count [%landscape [/graph/(scot %p our.bowl)/dm-inbox/(crip (y-co:co ship))]]])
    :_  state
    :~
        [%pass / %agent [our.bowl %hark-store] %poke hark-action+!>(action)]
    ==
  ::
  ++  read-group-dm
    |=  [=resource]
    =/  action  ^-(action:hark [%read-count [%landscape [/graph/(scot %p entity.resource)/(cord name.resource)]]])
    :_  state
    :~
        [%pass / %agent [our.bowl %hark-store] %poke hark-action+!>(action)]
    ==
      ::
  ++  create-group-dm     ::  should be in a thread, but for now its here
    |=  [ships=(set ship)]
    ^-  (quip card _state)
    =/  action     (new-group-dm:gs:lib our.bowl now.bowl ships)
    ?>  ?=(%create -.action)
    =/  =update:graph-store     [now.bowl %add-graph rid.action *graph:graph-store mark.action %.y]
    ?>  ?=(%policy -.associated.action)
    =/  associated              associated.action
    ?>  ?=(%invite -.policy.associated)
    =/  inv-action=action:inv
      :^  %invites  %graph  (shaf %graph-uid eny.bowl)
      ^-  multi-invite:inv
      :*  our.bowl
          %graph-push-hook
          rid.action
          pending.policy.associated
          description.action
      ==
    =/  =metadatum:met
      %*  .  *metadatum:met
        title         title.action
        description   description.action
        date-created  now.bowl
        creator       our.bowl
        config        [%graph module.action]
        preview       %.n
        hidden        %.n
      ==
    =/  met-action=action:met
      [%add rid.action graph+rid.action metadatum]
    ::  create group-dm-created preview
    =/  to-set        (~(put in ships) our.bowl)
    =/  mtd-list      (get-metadata:gs:lib to-set our.bowl now.bowl)
    =/  new-grp-prev  [
          path=(spat /(scot %p entity.rid.action)/(cord name.rid.action))
          to=(~(put in ships) our.bowl)
          type=%group
          source=%graph-store
          last-time-sent=now.bowl
          last-message=[~]
          metadata=mtd-list
          invite-hash=~
          unread-count=0
      ]
    :_  state
    :~
        [%pass / %agent [our.bowl %graph-store] %poke graph-update-3+!>(update)]
        [%pass / %agent [our.bowl %graph-push-hook] %poke push-hook-action+!>([%add rid.action])]
        [%pass / %agent [our.bowl %group-store] %poke group-update-0+!>([%add-group rid.action policy.associated %.y])]
        [%pass / %agent [our.bowl %group-store] %poke group-update-0+!>([%add-members rid.action (~(put in ships) our.bowl)])]
        [%pass / %agent [our.bowl %contact-push-hook] %poke push-hook-action+!>([%add rid.action])]
        [%pass / %agent [our.bowl %metadata-push-hook] %poke push-hook-action+!>([%add rid.action])]
        [%pass / %agent [our.bowl %metadata-push-hook] %poke metadata-update-2+!>(met-action)]
        [%pass / %agent [our.bowl %group-push-hook] %poke push-hook-action+!>([%add rid.action])]
        [%pass / %agent [our.bowl %invite-hook] %poke invite-action+!>(inv-action)]
        [%give %fact [/updates ~] graph-dm-reaction+!>([%group-dm-created `message-preview:store`new-grp-prev])]
    ==
    ::
  ++  send-dm
    |=  [=ship =post]
    ^-  (quip card _state)
    =/  dm-nodes  `(map index node:graph-store)`[~]
    =.  dm-nodes  (~(put by dm-nodes) index.post [[%.y p=[post]] [%empty ~]])
    =/  upd-act   `update:graph-store`[now.bowl [%add-nodes [our.bowl %dm-inbox] dm-nodes]]
    :_  state
    :~
        [%pass / %agent [our.bowl %dm-hook] %poke graph-update-3+!>(upd-act)]
    ==
  ::
  ++  send-group-dm
    |=  [=resource =post]
    ^-  (quip card _state)
    =/  hashed-node   (add-hash-to-node:gs:lib our.bowl now.bowl [[%.y p=[post]] [%empty ~]])
    =/  dm-nodes      `(map index node:graph-store)`[~]
    =.  dm-nodes      (~(put by dm-nodes) index.post hashed-node)
    =/  upd-act   `update:graph-store`[now.bowl [%add-nodes resource dm-nodes]]
    :_  state
    :~
        [%pass / %agent [our.bowl %graph-push-hook] %poke graph-update-3+!>(upd-act)]
    ==
  ::
  --
::
++  on-graph-update    ::  Handles graph-store updates
  |=  [upd=update:graph-store now=@da our=ship]
  ^-  (quip card _state)
  :: ~&  "on-graph-update called"
  :: ~&  upd
  |^
  ?+  -.q.upd   `state
    %add-nodes
      ?:  =(name.resource.+.q.upd %dm-inbox) :: is dm-inbox
        =/  dm            ^-((map index:graph-store node:graph-store) nodes.+.q.upd)
        =/  dm-node       (snag 0 ~(tap by dm)) :: get the node
        =/  ship-dec      (snag 0 p.dm-node)
        =/  new-dm        (received-dm:gs:lib ship-dec q.dm-node our now)
        (send-updates new-dm our)
      ::
      ?:  (group-skim-gu:gs:lib resource.+.q.upd)  ::  is group dm
        =/  dm            ^-((map index:graph-store node:graph-store) nodes.+.q.upd)
        =/  dm-node       (snag 0 ~(tap by dm)) :: get the node
        =/  entity        entity.resource.+.q.upd
        =/  name          name.resource.+.q.upd
        =/  new-dm        (received-grp-dm:gs:lib our now entity name q.dm-node)
        (send-updates new-dm our)
      :: else
      `state
    %add-graph  ::  TODO new graph invites
      :: ~&  >>  ['add graph' upd]
      :: ?:  =(-.q.upd %add-graph)
      ::   ?>  =(+.mark.+.q.upd %graph-validator-chat)
      ::   =/  name-da   (slaw %da name)
      ::   ?~  name-da
      ::     ~&  >  ['continue']
      ::     `state
      ::   `state
      :: [%add-graph
      ::   p=~2022.9.5..19.36.10..46ff
      ::     q
      ::   [ %add-graph
      ::     resource=[entity=~dev name=%~2022.9.5..19.36.10]
      ::     graph={}
      ::     mark=[~ %graph-validator-chat]
      ::     overwrite=%.y
      ::   ]
      :: ]
      `state
  ==
  ++  send-updates
    |=  [new-dm=chat:store our=ship]
    ?:  =(%.n push-enabled.state) ::  we've disabled push
      :_  state
      [%give %fact [/updates ~] graph-dm-reaction+!>([%dm-received new-dm])]~
    ?:  (is-our-message:gs:lib our new-dm) :: its our message (outgoing)
      :_  state
      [%give %fact [/updates ~] graph-dm-reaction+!>([%dm-received new-dm])]~
        ::
    ?:  =((lent ~(tap by devices.state)) 0) :: there are no devices
      :_  state
      [%give %fact [/updates ~] graph-dm-reaction+!>([%dm-received new-dm])]~
    =/  notify   (generate-push-notification:notif-lib our app-id.state new-dm)
    ::  send http request
    ::
    =/  =header-list:http
      :~  ['Content-Type' 'application/json']
      ==
    =|  =request:http
    :: TODO when porting to groups-two handle group-dms by adding set of
    :: participants in metadata
    =:  method.request       %'POST'
        url.request          'https://onesignal.com/api/v1/notifications'
        header-list.request  header-list
        body.request
          :-  ~
          %-  as-octt:mimes:html
          %-  en-json:html
          (request:enjs:notif-lib notify devices.state)
    ==
    :_  state
    :~
      [%give %fact [/updates ~] graph-dm-reaction+!>([%dm-received new-dm])]
      [%pass /push-notification/(scot %da now.bowl) %arvo %i %request request *outbound-config:iris]
      ::  Send to onesignal
    ==
  --
::
++  on-hook-action
  |=  [act=action:dm-hook-sur now=@da our=ship]
  ^-  (quip card _state)
  :: ~&  "on-hook-action called"
  :: ~&  act
  |^
  ?+  -.act                 `state
    %pendings               (pending-dm +.act)
    :: %screen                 (screen +.act)
    :: %accept                 (accept +.act)
    :: %declined               (decline +.act)
  ==
  ++  pending-dm
    |=  ships=(set ship)
    ?:  =(0 ~(wyt in ships))  ::  if no ships in pendings
      `state
    =/  new-from            (rear ~(tap in ships))    ::  assumes at least one ship is in the set
    =/  invite-preview      (invite-preview:gs:lib new-from our now)
    ~&  >  invite-preview
    :_  state
    [%give %fact [/updates ~] graph-dm-reaction+!>([%invite-dm invite-preview])]~
  --
::
++  on-notify-action
  |=  [act=action:notify]
  ^-  (quip card _state)
  |^
  ?-  -.act                   ::  `state
    %enable-push              (set-push %.y)
    %disable-push             (set-push %.n)
    %set-device               (set-device +.act)
    %remove-device            (remove-device +.act)
  ==
  ::
  ++  set-push
    |=  enabled=?
    =.  push-enabled.state   enabled
    `state
  ::
  ++  set-device
    |=  [=device-id:notify =player-id:notify]
    =.  devices.state         (~(put by devices.state) device-id player-id)
    `state
  ::
  ++  remove-device
    |=  [=device-id:notify]
    =.  devices.state         (~(del by devices.state) device-id)
    `state
  ::
  --
--
