/-  store=spaces-chat
/-  sstore=spaces-store
/-  vstore=visas
/-  membership-store=membership
/+  dbug, default-agent
|%
+$  card  card:agent:gall
+$  versioned-state  $%(state-0)
+$  state-0          [%0 chats=space-chats:store]
--
=|  state-0
=*  state  -
%-  agent:dbug
=<
  ^-  agent:gall
  |_  =bowl:gall
  +*  this  .
      def   ~(. (default-agent this %|) bowl)
      hol   ~(. +> [bowl ~])
  ::
  ++  on-init
    ^-  (quip card _this)
    :_  this
    [%pass /spaces %agent [our.bowl %spaces] %watch /updates]~
  ::
  ++  on-agent
    |=  [=wire =sign:agent:gall]
    ^-  (quip card _this)
    =/  wirepath  `path`wire
    ?+    wire  (on-agent:def wire sign)
      [%spaces ~]
        ?+    -.sign  (on-agent:def wire sign)
          %watch-ack
            ?~  p.sign  %-  (slog leaf+"{<dap.bowl>}: subscribed to spaces" ~)  `this
            ~&  >>>  "{<dap.bowl>}: spaces subscription failed"
            `this
          %kick
            ~&  >  "{<dap.bowl>}: spaces kicked us, resubscribing..."
            :_  this
            :~  [%pass /spaces %agent [our.bowl %spaces] %watch /updates]
            ==
          %fact
            ?+    p.cage.sign   (on-agent:def wire sign)
                  %spaces-reaction
                =^  cards  state
                  (spaces-reaction:hol !<(=reaction:sstore q.cage.sign))
                [cards this]
                ::
                  %visa-reaction
                =^  cards  state
                  (visas-reaction:hol !<(=reaction:vstore q.cage.sign))
                [cards this]
            ==
        ==
      ==
  ::
  :: ++  on-agent  |=([wire sign:agent:gall] !!)
  ++  on-save   !>(state)
  ++  on-load   |=(vase `..on-init)
  ++  on-poke   |=(cage !!)
  ++  on-peek   |=(path ~)
  ++  on-watch  |=(path !!)
  ++  on-arvo   |=([wire sign-arvo] !!)
  ++  on-leave  |=(path `..on-init)
  ++  on-fail   |=([term tang] `..on-init)
--
|_  [=bowl:gall cards=(list card)]
::
++  hol  .
++  spaces-reaction
  |=  [rct=reaction:sstore]
  ^-  (quip card _state)
  |^
  ?+  -.rct         `state
    %add            (on-add +.rct)
    %remove         (on-remove +.rct)
  ==
  ::
  ++  on-add
    |=  [space=space:sstore =members:membership-store]
    ::  TODO create a new chat for this space with the members
    `state
  ::
  ++  on-remove
    |=  [path=space-path:sstore]
    ::  TODO remove all the chats for this space
    `state
    ::
  --
::
++  visas-reaction
  |=  [rct=reaction:vstore]
  ^-  (quip card _state)
  |^
  ?+  -.rct             `state
    %invite-accepted    (on-accepted +.rct)
    %kicked             (on-kicked +.rct)
  ==
  ::
  ++  on-accepted
    |=  [path=space-path:sstore =ship =member:membership-store]
    ^-  (quip card _state)
    ::  TODO add the new member to the chats for this space based on their role
    `state
  ::
  ++  on-kicked
    |=  [path=space-path:sstore =ship]
    ^-  (quip card _state)
    ::  TODO remove the member from the chats for this space
    `state
  --
  
--