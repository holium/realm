::  courier [realm]:
::
::  A thin agent that interfaces with various chat stores
::
/-  store=courier, post, graph-store
/+  dbug, default-agent, lib=courier
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
  ++  on-poke   |=(cage !!)
  ++  on-watch  |=(path !!)
  ::
  ++  on-peek
    |=  =path
    ^-  (unit (unit cage))
    ?+    path  (on-peek:def path)
    ::
    ::  ~/scry/courier/dms.json
      [%x %dms ~]
        ?>  =(our.bowl src.bowl)
        =/  dm-previews   (gen-list:gs-dms:lib our.bowl now.bowl)
        ``courier-view+!>([%inbox dm-previews])
    ::
    ::  ~/scry/courier/dms/~dev.json
      [%x %dms @ ~]
        ?>  =(our.bowl src.bowl)
        =/  to-ship       `@p`(slav %p i.t.t.path)
        =/  dms           (gen-dms:gs-dms:lib our.bowl to-ship now.bowl)
        ``courier-view+!>([%dm-log dms])
    ::
    ::  ~/scry/courier/dms/~dev/paged/0/20.json
    [%x %dms @ %paged @ @ ~]
        ?>  =(our.bowl src.bowl)
        =/  to-ship       `@p`(slav %p i.t.t.path)
        =/  dms           (gen-dms:gs-dms:lib our.bowl to-ship now.bowl)
        ``courier-view+!>([%dm-log dms])
    ::
    
    ==
  ::
  :: ++  on-agent    on-agent:def
  ++  on-agent 
    |=  [=wire =sign:agent:gall]
    ^-  (quip card _this)
    =/  wirepath  `path`wire
    ?+    wire  (on-agent:def wire sign)
      [%graph-store ~]
        ?+    -.sign  (on-agent:def wire sign)
          %watch-ack
            ?~  p.sign  `this
            ~&  >>>  "{<dap.bowl>}: spaces subscription failed"
            `this
          %fact
            ?+    p.cage.sign  (on-agent:def wire sign)
                %graph-update-3
              =^  cards  state
                (graph-dm !<(=update:graph-store q.cage.sign))
              [cards this]
            ==
        ==
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
++  core  .
++  graph-dm
  |=  [upd=update:graph-store]
  ^-  (quip card _state)
  |^
  ?+  -.q.upd   `state
    %add-nodes
      ?:  =(name.resource.+.q.upd %dm-inbox)
      :: is dm-inbox
      =/  dm-posts      ^-((map index:graph-store node:graph-store) nodes.+.q.upd)  
      ~&  >>  ['is dm inbox' dm-posts]
      :: ~&  >>  ['is dm inbox' (map-to-dms:gs-dms:lib dm-posts)]
      :: (convert-dm-node:gs-dms:lib )
      `state
    :: else 
    `state
    :: %add-nodes
    :: ~&  >>  [name.resource.+.q.upd]
    :: `state
  ==
    :: ?:  =(name.resource.+.q.upd %dm-inbox)
    ::   :: is dm-inbox
    ::   ~&  >>  ['is dm inbox' name.resource.+.q.upd]
    :: :: else 
    :: `state
  ::
  :: ++  on-initial
  ::   |=  [spaces=spaces:store]
  ::   ^-  (quip card _state)
  ::   `state
  :: ::
  --

--