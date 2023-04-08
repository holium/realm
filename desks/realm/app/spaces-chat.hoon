/-  store=spaces-chat
/-  sstore=spaces-store
/-  vstore=visas
/-  mstore=membership
/+  lib=spaces-chat
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
    ~&  >  "{<dap.bowl>}: initializing..."
    =/  spaces-scry       .^(view:sstore %gx /(scot %p our.bowl)/spaces/(scot %da now.bowl)/all/noun)
    ?>  ?=(%spaces -.spaces-scry)
    =/  spaces            spaces.spaces-scry
    =/  to-add-chat=(list [k=space-path:sstore v=space:sstore])
        %+  skim  ~(tap by spaces)
          |=  kv=[k=space-path:sstore v=space:sstore]
          &(=(ship.path.v.kv our.bowl) ?!(=(space.k.kv 'our')))
    =/  new-chats  
      %+  turn  to-add-chat
        |=  [sk=space-path:sstore sv=space:sstore]
        =/  members-scry         .^(view:mstore %gx /(scot %p our.bowl)/spaces/(scot %da now.bowl)/(scot %p ship.sk)/(scot %tas space.sk)/members/noun)
        ?>  ?=(%members -.members-scry)
        =/  members           members.members-scry
        =/  chat-and-cards    (create-space-chat:lib sv [%role %member] members now.bowl)
        =/  chat              +.chat-and-cards
        =/  cards             -.chat-and-cards
        [k=sk c=chat cd=cards]
    =/  cards  
      %+  roll  new-chats
        |=  [[k=space-path:sstore c=chat:store cd=(list card)] acc=(list card)]
        (weld acc cd)
    =/  chats
      %+  turn  new-chats
      |=  [k=space-path:sstore c=chat:store cd=(list card)]
      =/  chats-map       `chats:store`~
      =/  chats-map       (~(put by chats-map) path.c c)
      [k chats-map]
    =.  chats.state   `space-chats:store`(malt chats)
    :_  this
    %+  weld  cards
    ^-  (list card)
    :~
      [%pass /spaces %agent [our.bowl %spaces] %watch /updates]
    ==
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
    |=  [space=space:sstore =members:mstore]
    ::  TODO create a new chat for this space with the members
    ~&  >  "{<dap.bowl>}: creating chat for {<space>}"
    `state
  ::
  ++  on-remove
    |=  [path=space-path:sstore]
    ::  TODO remove all the chats for this space
    ~&  >  "{<dap.bowl>}: removing chat for {<path>}"
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
    |=  [path=space-path:sstore =ship =member:mstore]
    ^-  (quip card _state)
    ::  TODO add the new member to the chats for this space based on their role
    ~&  >  "{<dap.bowl>}: adding {<ship>} to chats for {<path>}"
    `state
  ::
  ++  on-kicked
    |=  [path=space-path:sstore =ship]
    ^-  (quip card _state)
    ::  TODO remove the member from the chats for this space
    ~&  >  "{<dap.bowl>}: removing {<ship>} from chats for {<path>}"
    `state
  --
  
--