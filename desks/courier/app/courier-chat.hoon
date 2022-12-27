::  courier [realm]:
::
::  A messaging agent that handles both direct messages and group chats.
::  It has it's own state and writes to %chat. 
::
/-  c-chat=courier-chat
/-  c-path=courier-path
/-  inv-sur=courier-invite
/-  notif=notify
:: /-  channel-sur=courier-channel
/+  notif-lib=notify, dbug, default-agent, verb
/+  corlib=courier-chat
::
=>
  |%
  +$  card        card:agent:gall
  +$  chat-act    action:c-chat
  +$  chat-rct    reaction:c-chat
  +$  chat-vi     view:c-chat 
  +$  inv-act     action:inv-sur
  +$  inv-rct     reaction:inv-sur
  ::
  +$  versioned-state
      $%  state-0
      ==
  +$  state-0
    $:  %0
        =chats:c-chat
        =previews:c-chat
        :: =channels:channel-sur
        =app-id:notif         :: constant
        =uuid:notif           :: (sham @p)
        =devices:notif        :: (map device-id player-id)
        push-enabled=?
    ==
  --
::
=|  state-0
=*  state  -
%-  agent:dbug
%+  verb  |
::
=<
  ^-  agent:gall
  |_  =bowl:gall
  +*  this      .
      def       ~(. (default-agent this %.n) bowl)
      hol       ~(. +> [bowl ~])
      :: corlib    ~(corlib +> [bowl ~])
  ::
  ++  on-init
    ^-  (quip card _this)
    =.  app-id.state            '82328a88-f49e-4f05-bc2b-06f61d5a733e'
    =.  uuid.state              (sham our.bowl)
    =.  push-enabled.state      %.y
    `this
  ::
  ++  on-save
    ^-  vase
    !>(state)
  ::
  ++  on-load
    :: |=  old-state=vase
    :: ^-  (quip card _this)
    :: =/  old  !<(versioned-state old-state)
    :: ?-  -.old
    ::   %0  `this(state old)
    :: ==
    |=  =vase
    ^-  (quip card _this)
    ~&  %on-load
    =/  old=(unit versioned-state)
      (mole |.(!<(versioned-state vase)))
    :: ~&  old
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
  ++  on-poke    ::  on-poke:def
    |=  [=mark =vase]
    ^-  (quip card _this)
    |^
    =^  cards  state
    ?+  mark            (on-poke:def mark vase)
      %chat-action      (action:chat:hol !<(chat-act vase))
      %invite-action    (action:invite:hol !<(inv-act vase))
      %notify-action    (on-notify-action:hol !<(action:notif vase))
    ==
    [cards this]
  --
  ::
  ++  on-watch
    |=  =path
    ^-  (quip card _this)
    ?>  =(our.bowl src.bowl)
    =/  cards=(list card)
      ?+    path      (on-watch:def path)
          [%updates ~]
        ::
        [%give %fact ~ graph-dm-reaction+!>([%previews ~])]~
      ==
    [cards this]
  ::
  ++  on-peek
    |=  =path
    ^-  (unit (unit cage))
    ?+    path  (on-peek:def path)
    ::
      [%x %devices ~]
        ?>  =(our.bowl src.bowl)
        ``notify-view+!>([%devices devices.state])
      ::
      [%x %inbox ~]
        ?>  =(our.bowl src.bowl)
        ``courier-view+!>([%inbox previews.state])
      ::
      :: [%x %dms ~]
      ::   ?>  =(our.bowl src.bowl)
      ::   =/  dm-previews   (previews:gs:lib our.bowl now.bowl)
      ::   ``graph-dm-view+!>([%inbox dm-previews])
      :: ::
      :: [%x %dms %group @ @ ~]    ::  ~/scry/courier/dms/group/~dev/~2022.8.28..20.32.55.json
      ::   ?>  =(our.bowl src.bowl)
      ::   =/  entity       `@p`(slav %p i.t.t.t.path)
      ::   =/  timestamp    `@t`i.t.t.t.t.path
      ::   =/  dms           (grp-log:gs:lib our.bowl now.bowl entity timestamp)
      ::   ``graph-dm-view+!>([%dm-log dms])
      :: [%x %dms @ ~]             ::  ~/scry/courier/dms/~dev.json
      ::   ?>  =(our.bowl src.bowl)
      ::   =/  to-ship       `@p`(slav %p i.t.t.path)
      ::   =/  dms           (dm-log:gs:lib our.bowl to-ship now.bowl)
      ::   ``graph-dm-view+!>([%dm-log dms])
      :: [%x %rolodex ~]
      ::   :-  ~  :-  ~  :-  %rolodex
      ::   !>(.^(rolodex:cs %gx /(scot %p our.bowl)/contact-store/(scot %da now.bowl)/all/noun))
    
    ::  ~/scry/courier/dms/~dev/paged/0/20.json
    ::   [%x %dms @ %paged @ @ ~]
    ::     ?>  =(our.bowl src.bowl)
    ::     =/  to-ship       `@p`(slav %p i.t.t.path)
    ::     =/  dms           (gen-dms:gs:lib our.bowl to-ship now.bowl)
    ::     ``graph-dm-view+!>([%dm-log dms])
   ==
  
  ++  on-agent    on-agent:def
  :: ++  on-agent
  ::   |=  [=wire =sign:agent:gall]
  ::   ^-  (quip card _this)
  ::   ?+    wire  (on-agent:def wire sign)
  ::     :: ::
  ::     :: [%g2 %club @ %ui ~]
  ::     ::   ?+    -.sign  (on-agent:def wire sign)
  ::     ::     %watch-ack
  ::     ::       ?~  p.sign  `this
  ::     ::       ~&  >>>  "{<dap.bowl>}: groups-two /club/id/ui subscription failed"
  ::     ::       `this
  ::     ::     %kick
  ::     ::       ~&  >  "{<dap.bowl>}: groups-two /club/id/ui kicked us, giving up..."
  ::     ::       `this
  ::     ::     %fact
  ::     ::       =^  cards  state
  ::     ::         (handle-club-ui-fact:groups-two wire cage.sign bowl state)
  ::     ::       [cards this]
  ::     ::   ==
  ::     :: ::
  ::     :: [%g2 %briefs ~]
  ::     ::   ?+    -.sign  (on-agent:def wire sign)
  ::     ::     %watch-ack
  ::     ::       ?~  p.sign  `this
  ::     ::       ~&  >>>  "{<dap.bowl>}: groups-two /briefs subscription failed"
  ::     ::       `this
  ::     ::     %kick
  ::     ::       ~&  >  "{<dap.bowl>}: groups-two /briefs kicked us, resubscribing..."
  ::     ::       :_  this
  ::     ::       :~
  ::     ::         [%pass /g2/briefs %agent [our.bowl %chat] %watch /briefs]
  ::     ::       ==
  ::     ::     %fact
  ::     ::       ~&  'groups-two /briefs fact'
  ::     ::       ~&  cage.sign
  ::     ::       [(propagate-briefs-fact:groups-two cage.sign bowl state) this]
  ::     ::   ==
  ::     :: ::
  ::     :: [%g2 %dm @ %ui ~]
  ::     ::   :: ~&  -.sign
  ::     ::   ?+    -.sign  (on-agent:def wire sign)
  ::     ::     %watch-ack
  ::     ::       ?~  p.sign  `this
  ::     ::       ~&  >>>  "{<dap.bowl>}: groups-two /dm/ui subscription failed"
  ::     ::       `this
  ::     ::     %kick
  ::     ::       ~&  >  "{<dap.bowl>}: groups-two /dm/ui kicked us, giving up..."
  ::     ::       `this
  ::     ::     %fact
  ::     ::       =^  cards  state
  ::     ::         (handle-dm-ui-fact:groups-two wire cage.sign bowl state)
  ::     ::       [cards this]
  ::     ::       ::[(handle-dm-ui-fact:groups-two cage.sign bowl state) this]
  ::     ::   ==
  ::     :: ::
  ::     :: [%g2 %club %new ~]
  ::     ::   :: ~&  -.sign
  ::     ::   ?+    -.sign  (on-agent:def wire sign)
  ::     ::     %watch-ack
  ::     ::       ?~  p.sign  `this
  ::     ::       ~&  >>>  "{<dap.bowl>}: groups-two /club/new subscription failed"
  ::     ::       `this
  ::     ::     %kick
  ::     ::       ~&  >  "{<dap.bowl>}: groups-two /club/new kicked us, resubscribing..."
  ::     ::       :_  this
  ::     ::       :~
  ::     ::         [%pass /g2/club/new %agent [our.bowl %chat] %watch /club/new]
  ::     ::       ==
  ::     ::     %fact
  ::     ::       [(handle-club-invite:groups-two cage.sign bowl) this]
  ::     ::   ==
  ::     :: ::
  ::     :: [%g2 %dm %invited ~]
  ::     ::   :: ~&  -.sign
  ::     ::   ?+    -.sign  (on-agent:def wire sign)
  ::     ::     %watch-ack
  ::     ::       ?~  p.sign  `this
  ::     ::       ~&  >>>  "{<dap.bowl>}: groups-two /dm/invited subscription failed"
  ::     ::       `this
  ::     ::     %kick
  ::     ::       ~&  >  "{<dap.bowl>}: groups-two /dm/invited kicked us, resubscribing..."
  ::     ::       :_  this
  ::     ::       :~
  ::     ::         [%pass /g2/dm/invited %agent [our.bowl %chat] %watch /dm/invited]
  ::     ::       ==
  ::     ::     %fact
  ::     ::       [(handle-dm-invite:groups-two cage.sign bowl) this]
  ::     ::   ==
  ::     ==
  ::   ==
  ::
  ++  on-arvo    
    |=  [=wire =sign-arvo]
    ^-  (quip card _this)
    ?+  wire  (on-arvo:def wire sign-arvo)
        [%push-notification *]
      `this
    ==
  ::
  ++  on-leave    on-leave:def
  ++  on-fail     on-fail:def
  --
::
|_  [=bowl:gall cards=(list card)]
::
++  hol  .
++  chat
  |%
  ++  action
    |=  act=chat-act
    ^-  (quip card _state)
    ?-  -.act             
      %create-chat        (create-chat +.act)
      %leave-chat         (leave-chat +.act)
      :: %send-message       (send-message +.act)
      :: %read-chat          (read-chat +.act)
      :: %delete-chat        (delete-chat +.act)
      :: %react              (react +.act)
    ==
    ::
    ++  create-chat
      |=  [type=chat-type:c-chat to=(set ship)]
      ^-  (quip card _state)
      `state
    ::
    ++  leave-chat
      |=  [=path:c-path]
      ^-  (quip card _state)
      `state
    ::
    ++  send-message
      |=  [=path:c-path =message:c-chat]
      ^-  (quip card _state)
      `state
    ::
    ++  read-chat
      |=  [=path:c-path]
      ^-  (quip card _state)
      `state
    ::
    ++  delete-chat
      |=  [=path:c-path]
      ^-  (quip card _state)
      `state
    ::
    ++  react
      |=  [path=m-path:c-chat react=reacts:c-chat]
      ^-  (quip card _state)
      `state
  ::
  ++  reaction
    |=  rct=chat-rct
    ^-  (quip card _state)
    ?-  -.rct             
      %message-created    (message-created +.rct)
      %message-left       (message-left +.rct)
      %message-sent       (message-sent +.rct)
      %message-received   (message-received +.rct)
      %chat-read          (chat-read +.rct)
      %chat-deleted       (chat-deleted +.rct)
      %reacted            (reacted +.rct)
    ==
    ++  message-created
      |=  [type=chat-type:c-chat to=(set ship)]
      ^-  (quip card _state)
      `state
    ::
    ++  message-left
      |=  [=path:c-path]
      ^-  (quip card _state)
      `state
    ::
    ++  message-sent   
      :: only reacted when we send a message to a peer
      |=  [=path:c-path =preview:c-chat]
      ^-  (quip card _state)
      `state
    ::
    ++  message-received  
      :: only reacted when we receive a message from a peer
      |=  [=path:c-path =message:c-chat]
      ^-  (quip card _state)
      `state
    ::
    ++  chat-read
      |=  [=path:c-path]
      ^-  (quip card _state)
      `state
    ::
    ++  chat-deleted
      |=  [=path:c-path]
      ^-  (quip card _state)
      `state
    ::
    ++  reacted
      |=  [path=(pair path:c-path time) =ship react=reacts:c-chat]
      ^-  (quip card _state)
      `state
    
  ::
  ++  helpers
    |%
    :: ++  forward-to-chat
    ::   |=  [=path =cage]
    ::   ^-  (list card)
    ::   :~
    ::     [%pass /g2/dm/chat %agent [our.bowl %chat] %poke %chat-action !>(cage)]
    ::   ==
    --
  --
::
++  invite
  |%
  ++  action
    |=  [act=inv-act]
    ^-  (quip card _state)
    ?-  -.act             
      %accept-invite      (handle-accept +.act)
      %decline-invite     (decline-accept +.act)
      %invite-ship        (invite-ship +.act)
      %kick-ship          (kick-ship +.act)
    ==
    ::
    ++  handle-accept
      |=  [=path:c-path]
      ^-  (quip card _state)
      `state
    ::
    ++  decline-accept
      |=  [=path:c-path]
      ^-  (quip card _state)
      `state
    ::
    ++  invite-ship
      |=  [=path:c-path =ship]
      ^-  (quip card _state)
      `state
    ::
    ++  kick-ship
      |=  [=path:c-path =ship]
      ^-  (quip card _state)
      `state
  ::
  ++  reaction
    |=  [rct=inv-rct]
    ^-  (quip card _state)
    ?-  -.rct            
      %invite-accepted    `state
      %invite-declined    `state
      %ship-invited       `state
      %ship-kicked        `state
    ==
    ++  invite-accepted
      |=  [=path:c-path]
      ^-  (quip card _state)
      `state
    ::
    ++  invite-declined
      |=  [=path:c-path]
      ^-  (quip card _state)
      `state
    ::
    ++  ship-invited
      |=  [=path:c-path =ship]
      ^-  (quip card _state)
      `state
    ::
    ++  ship-kicked
      |=  [=path:c-path =ship]
      ^-  (quip card _state)
      `state 
  ::
  --
::
++  on-notify-action
  |=  [act=action:notif]
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
    |=  [=device-id:notif =player-id:notif]
    =.  devices.state         (~(put by devices.state) device-id player-id)
    `state
  ::
  ++  remove-device
    |=  [=device-id:notif]
    =.  devices.state         (~(del by devices.state) device-id)
    `state
  ::
  --
::
--
