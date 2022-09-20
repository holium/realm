::  courier [realm]:
::
::  A thin agent that interfaces with various chat stores
::
/-  store=courier, post, graph-store, *post, *resource, group, inv=invite-store, met=metadata-store, 
    hark=hark-store, dm-hook-sur=dm-hook, push-notify
/+  dbug, default-agent, lib=courier, hook=dm-hook, push-lib=push-notify
|%
+$  card  card:agent:gall

+$  state-0
  $:  %0
      =app-id:push-notify         :: constant
      =rest-api-key:push-notify   :: constant
      =uuid:push-notify           :: (sham @p)
      push-enabled=?
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
  ++  on-init
    ^-  (quip card _this)
    =.  app-id.state            '82328a88-f49e-4f05-bc2b-06f61d5a733e'
    =.  rest-api-key.state      'Basic MDZiNDZmN2EtYTBhMy00OWJlLTlkZWItOWIyNDY5MTQzMmFl'
    =.  uuid.state              (sham our.bowl)
    =.  push-enabled.state       %.y
    :_  this
    ::  %watch: all incoming dms and convert to our simple structure
    :~  
      [%pass /graph-store %agent [our.bowl %graph-store] %watch /updates]
      [%pass /dm-hook %agent [our.bowl %dm-hook] %watch /updates]
      :: [%pass /group-dm-thread %agent [our.bowl %spider] %watch /thread-result/[tid]]
      :: [%pass /thread/[ta-now] %agent [our.bowl %spider] %poke %spider-start !>(start-args)]
    ==
  ++  on-save   !>(state)
  ++  on-load   ::|=(vase `..on-init)
    |=  =vase
    ^-  (quip card _this)
    =/  old=(unit state-0)
      (mole |.(!<(state-0 vase)))  
    ?^  old
      `this(state u.old)
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
      %graph-dm-action    (on-graph-action:core !<(action:store vase))
      %notify-action      (on-notify-action:core !<(action:push-notify vase))
      :: %next-dm-action    (on-action:core !<(action:store vase))
    ==
    [cards this]
  --
  ::
  ++  on-watch
    |=  =path
    ^-  (quip card _this)
    =/  cards=(list card)
      ?+    path      (on-watch:def path)
          [%updates ~]
        ?>  =(our.bowl src.bowl)
        =/  dm-previews   (previews:gs:lib our.bowl now.bowl)
        [%give %fact [/updates ~] graph-dm-reaction+!>([%previews dm-previews])]~
      ==
    [cards this]
  ::
  ++  on-peek
    |=  =path
    ^-  (unit (unit cage))
    ?+    path  (on-peek:def path)
    ::
    ::  ~/scry/courier/dms.json
      [%x %push-uuid ~]
        ?>  =(our.bowl src.bowl)
        ``notify-view+!>([%uuid uuid.state])
    ::  ~/scry/courier/dms.json
      [%x %dms ~]
        ?>  =(our.bowl src.bowl)
        =/  dm-previews   (previews:gs:lib our.bowl now.bowl)
        ``graph-dm-view+!>([%inbox dm-previews])
    ::
    ::  ~/scry/courier/dms/group/~dev/~2022.8.28..20.32.55.json
      [%x %dms %group @ @ ~]
        ?>  =(our.bowl src.bowl)
        =/  entity       `@p`(slav %p i.t.t.t.path)
        =/  timestamp    `@t`i.t.t.t.t.path
        =/  dms           (grp-log:gs:lib our.bowl now.bowl entity timestamp)
        ``graph-dm-view+!>([%dm-log dms])
    ::
    ::  ~/scry/courier/dms/~dev.json
      [%x %dms @ ~]
        ?>  =(our.bowl src.bowl)
        =/  to-ship       `@p`(slav %p i.t.t.path)
        =/  dms           (dm-log:gs:lib our.bowl to-ship now.bowl)
        ``graph-dm-view+!>([%dm-log dms])
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
    =/  wirepath  `path`wire
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
    :: %accept-dm          `state
    :: %decline-dm         `state
    :: %pendings           `state
    :: %screen             `state
    %send-dm               (send-dm +.act)
    %read-dm               (read-dm +.act) 
    %create-group-dm       (create-group-dm +.act)
    %send-group-dm         (send-group-dm +.act)
    %read-group-dm         (read-group-dm +.act)
  ==
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
  |^
  ?+  -.q.upd   `state
    %add-nodes
      ?:  =(name.resource.+.q.upd %dm-inbox) :: is dm-inbox
        =/  dm            ^-((map index:graph-store node:graph-store) nodes.+.q.upd)  
        =/  dm-node       (snag 0 ~(tap by dm)) :: get the node
        =/  ship-dec      (snag 0 p.dm-node)
        =/  new-dm        (received-dm:gs:lib ship-dec q.dm-node our now)
        (send-updates new-dm)
      ::
      ?:  (group-skim-gu:gs:lib resource.+.q.upd)  ::  is group dm
        =/  dm            ^-((map index:graph-store node:graph-store) nodes.+.q.upd)  
        =/  dm-node       (snag 0 ~(tap by dm)) :: get the node
        =/  entity        entity.resource.+.q.upd
        =/  name          name.resource.+.q.upd
        =/  new-dm        (received-grp-dm:gs:lib our now entity name q.dm-node)
        (send-updates new-dm)
      :: else 
      `state
    %add-graph
      ::  TODO new graph invites
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
    |=  [new-dm=chat:store]
    ?:  =(%.n push-enabled.state)
      :_  state
      [%give %fact [/updates ~] graph-dm-reaction+!>([%dm-received new-dm])]~
    ::
    =/  notify   (generate-push-notification:push-lib our.bowl app-id.state new-dm)
    ~&  >>  (request:enjs:push-lib notify)
    :: `state
    ::  send http request
    ::
    =/  =header-list:http
      :~  ['Content-Type' 'application/json']
      ==
    =|  =request:http
    =:  method.request       %'POST'
        url.request          'https://onesignal.com/api/v1/notifications'
        header-list.request  header-list
        body.request
          :-  ~
          %-  as-octt:mimes:html
          %-  en-json:html
          (request:enjs:push-lib notify)
    ==
    ~&  >>>  request
    :: [~[[%pass /push-notification/(scot %da now.bowl) %arvo %i %request request *outbound-config:iris]] state]
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
  |=  [act=action:push-notify]
  ^-  (quip card _state)
  |^
  ?-  -.act      
    %enable-push           
      =.  push-enabled.state   %.y
      `state
    %disable-push           
      =.  push-enabled.state   %.n
      `state  
  ==
  --

--