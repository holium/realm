::  courier [realm]:
::
::  A thin agent that interfaces with various chat stores
::
/-  store=courier, post, graph-store, *post, *resource, group, inv=invite-store, met=metadata-store
/+  dbug, default-agent, lib=courier, hook=dm-hook
|%
+$  card  card:agent:gall
+$  versioned-state
    $%  state-0
    ==
+$  state-0
  $:  %0
  ==
--
=|  state-0
=*  state  -
%-  agent:dbug
:: =/  tid         (scot %ta 'group-dm_0v6.cqlt2.4o96j.6fq0u.dv85g.v3tco')
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
    :: =/  ta-now            `@ta`(scot %da now.bowl)  
    :: =/  start-args       [~ `tid [p=our.bowl q=%landscape r=da+now.bowl] %graph-create !>(~)]
    :_  this
    ::  %watch: all incoming dms and convert to our simple structure
    :~  
      [%pass /graph-store %agent [our.bowl %graph-store] %watch /updates]
      :: [%pass /group-dm-thread %agent [our.bowl %spider] %watch /thread-result/[tid]]
      :: [%pass /thread/[ta-now] %agent [our.bowl %spider] %poke %spider-start !>(start-args)]
    ==
  ++  on-save   !>(~)
  ++  on-load   |=(vase `..on-init)
  ++  on-poke
    |=  [=mark =vase]
    ^-  (quip card _this)
    :: ~&  >  [mark]
    |^
    =^  cards  state
    ?+  mark  (on-poke:def mark vase)
      %graph-dm-action    (on-graph-action:core !<(action:store vase))
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
        [%give %fact [/updates ~] courier-reaction+!>([%previews dm-previews])]~
      ==
    [cards this]
  ::
  ++  on-peek
    |=  =path
    ^-  (unit (unit cage))
    ?+    path  (on-peek:def path)
    ::
    ::  ~/scry/courier/dms.json
      [%x %dms ~]
        ?>  =(our.bowl src.bowl)
        =/  dm-previews   (previews:gs:lib our.bowl now.bowl)
        ``courier-view+!>([%inbox dm-previews])
    ::
    ::  ~/scry/courier/dms/group/~dev/~2022.8.28..20.32.55.json
      [%x %dms %group @ @ ~]
        ?>  =(our.bowl src.bowl)
        =/  entity       `@p`(slav %p i.t.t.t.path)
        =/  timestamp    `@t`i.t.t.t.t.path
        =/  dms           (grp-log:gs:lib our.bowl now.bowl entity timestamp)
        ``courier-view+!>([%dm-log dms])
    ::
    ::  ~/scry/courier/dms/~dev.json
      [%x %dms @ ~]
        ?>  =(our.bowl src.bowl)
        =/  to-ship       `@p`(slav %p i.t.t.path)
        =/  dms           (dm-log:gs:lib our.bowl to-ship now.bowl)
        ``courier-view+!>([%dm-log dms])
    ::
    ::  ~/scry/courier/dms/~dev/paged/0/20.json
      :: [%x %dms @ %paged @ @ ~]
      ::   ?>  =(our.bowl src.bowl)
      ::   =/  to-ship       `@p`(slav %p i.t.t.path)
      ::   =/  dms           (gen-dms:gs:lib our.bowl to-ship now.bowl)
      ::   ``courier-view+!>([%dm-log dms])
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
      :: [%dm-hook ~]
      ::   ?+    -.sign  (on-agent:def wire sign)
      ::     %watch-ack
      ::       ?~  p.sign  `this
      ::       ~&  >>>  "{<dap.bowl>}: dm-hook subscription failed"
      ::       `this
      ::     %kick
      ::       ~&  >  "{<dap.bowl>}: dm-hook kicked us, resubscribing..."
      ::       :_  this
      ::       :~  
      ::         [%pass /dm-hook %agent [our.bowl %dm-hook] %watch /updates]
      ::       ==
      ::     %fact
      ::       ?+    p.cage.sign  (on-agent:def wire sign)
      ::           %graph-update-3
      ::         =^  cards  state
      ::           (graph-dm !<(=update:graph-store q.cage.sign) our.bowl now.bowl)
      ::         [cards this]
      ::       ==
      ::   ==
      :: [%thread ~]
      ::   ?+    -.sign  (on-agent:def wire sign)
      ::     %poke-ack
      ::       ?~  p.sign
      ::         %-  (slog leaf+"Thread started successfully" ~)
      ::         `this
      ::       %-  (slog leaf+"Thread failed to start" u.p.sign)
      ::       `this
      ::   ==
      ::
      :: [%group-dm-thread ~]
      ::   ?+    -.sign  (on-agent:def wire sign)
      ::     %fact
      ::       ?+   p.cage.sign  `this
      ::         %thread-fail
      ::           ~&  >>>  ['thread failedddd' q.cage.sign]
      ::         `this
      ::       ==
      ::   ==
    ==
  ::
  ++  on-leave    on-leave:def
  ::
  ++  on-arvo     on-arvo:def
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
    %create-group-dm       (create-group-dm +.act)
    %send-dm               (send-dm +.act)
    %send-group-dm         (send-group-dm +.act)
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
    :_  state
    :~ 
        [%pass / %agent [our.bowl %graph-store] %poke graph-update-3+!>(update)]
        [%pass / %agent [our.bowl %graph-push-hook] %poke push-hook-action+!>([%add rid.action])]
        [%pass / %agent [our.bowl %group-store] %poke group-update-0+!>([%add-group rid.action policy.associated %.y])]
        [%pass / %agent [our.bowl %group-store] %poke group-update-0+!>([%add-members rid.action (~(put in ships) our.bowl)])]
        [%pass / %agent [our.bowl %contact-push-hook] %poke push-hook-action+!>([%add rid.action])]
        [%pass / %agent [our.bowl %metadata-push-hook] %poke push-hook-action+!>([%add rid.action])]
        [%pass / %agent [our.bowl %metadata-push-hook] %poke metadata-update-2+!>(met-action)]
        [%pass / %agent [our.bowl %invite-hook] %poke invite-action+!>(inv-action)]
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

++  on-graph-update    ::  Handles graph-store updates
  |=  [upd=update:graph-store now=@da our=ship]
  ^-  (quip card _state)
  |^
  ?+  -.q.upd   `state
    %add-nodes
      ?:  =(name.resource.+.q.upd %dm-inbox)
        :: is dm-inbox
        =/  dm            ^-((map index:graph-store node:graph-store) nodes.+.q.upd)  
        =/  dm-node       (snag 0 ~(tap by dm)) :: get the node
        =/  ship-dec      (snag 0 p.dm-node)
        =/  index         (snag 1 p.dm-node)
        =/  new-dm        (received-dm:gs:lib ship-dec index q.dm-node our now)
        :_  state
        [%give %fact [/updates ~] courier-reaction+!>([%dm-received new-dm])]~
      ::
      ?:  (group-skim-gu:gs:lib resource.+.q.upd)
        ::  is group dm
        =/  dm            ^-((map index:graph-store node:graph-store) nodes.+.q.upd)  
        =/  dm-node       (snag 0 ~(tap by dm)) :: get the node
        =/  entity        entity.resource.+.q.upd
        =/  name          name.resource.+.q.upd
        =/  new-dm        (received-grp-dm:gs:lib our now entity name q.dm-node)
        :_  state
        [%give %fact [/updates ~] courier-reaction+!>([%dm-received new-dm])]~
      :: else 
      `state
    %add-graph
      ::  TODO new graph invites
      ~&  >>  ['add graph' upd]
      `state
  ==
  --

--