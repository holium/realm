::  courier [realm]:
::
::  A thin agent that interfaces with various chat stores
::
/-  store=courier, post, graph-store, *post, *resource
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
    :_  this
    ::  %watch: all incoming dms and convert to our simple structure
    :~  
      [%pass /graph-store %agent [our.bowl %graph-store] %watch /updates]
    ==
  ++  on-save   !>(~)
  ++  on-load   |=(vase `..on-init)
  :: ++  on-poke
  ::   |=  [=mark =vase]
  ::   ^-  (quip card _this)
  ::   ?+  mark  (on-poke:def mark vase)
  ::     %dm-hook-action     
  ::   [%pass / %agent [our.bowl %dm-hook] %poke %dm-hook-action !<(action:hook vase)]~
  ::   ==
    :: [cards this]
  :: ++  on-poke
  ::   |=  [=mark =vase]
  ::   ^-  (quip card _this)
  ::   |^
  ::   ?+  mark  (on-poke:def mark vase)
  ::       %dm-hook-action
  ::     =+  !<(=action:hook vase)
  ::     =^  cards  state
  ::     :~ 
  ::       [%pass / %agent [our.bowl %dm-hook] %poke %dm-hook-action action]
  ::     ==
  ::   ==
  ::     [cards this]
  ++  on-poke   ::|=(cage !!)
    |=  [=mark =vase]
    ^-  (quip card _this)
    ~&  >  [mark]
    |^
    =^  cards  state
    ?+  mark  (on-poke:def mark vase)
      %courier-action    (on-action:core !<(action:store vase))
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
                (graph-dm !<(=update:graph-store q.cage.sign) our.bowl now.bowl)
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
++  on-action 
  |=  [act=action:store]
  ^-  (quip card _state)
  ~&  >  act
  |^
  ?-  -.act      
    :: %accept-dm          `state
    :: %decline-dm         `state
    :: %pendings           `state
    :: %screen             `state
    %create-group-dm    (create-group-dm +.act)
    %send-dm            (send-dm +.act)
    :: %send-group-dm      (send-group-dm +.act)
  ==
  ::
  ++  create-group-dm
    |=  [ships=(set ship)]
    ^-  (quip card _state)
    ~&  >>  [ships]
    `state
    ::
  ++  send-dm
    |=  [=ship =post]
    ^-  (quip card _state)
    ~&  >>  [ship post]
    `state
  ::
  ++  send-group-dm
    |=  [=resource =post]
    ^-  (quip card _state)
    `state
  ::
  --

++  graph-dm    ::  Handles graph-store updates
  |=  [upd=update:graph-store our=ship now=@da]
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
  ==
  --

--