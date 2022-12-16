/-  store=rooms
/+  verb, dbug, default-agent, lib=rooms
::
|%
+$  card      card:agent:gall
+$  r-view    view:store
+$  r-react   reaction:store
+$  sig-act   signal-action:store
+$  ses-act   session-action:store
+$  pro-act   provider-action:store
::
+$  versioned-state  $%(state-0)
::
+$  state-0
  $:  %0
      live=(unit room:store)
      session=session-state:store
      provider=provider-state:store
  ==
::
--
::
%+  verb  &
%-  agent:dbug
=|  state-0
=*  state  -
::
^-  agent:gall
::
=<
  |_  =bowl:gall
  +*  this  .
      def   ~(. (default-agent this %|) bowl)
      hol   ~(. +> [bowl ~])
  ::
  ++  on-init
    ^-  (quip card _this)
    =^  cards  state  abet:init:hol
    [cards this]
  ::
  ++  on-save
    ^-  vase
    !>(state)
  ::
  ++  on-load
    |=  old-state=vase
    ^-  (quip card _this)
    =/  old  !<(versioned-state old-state)
    ?-  -.old
      %0  `this(state old)
    ==
  ::
  ++  on-poke
    |=  [=mark =vase]
    ^-  (quip card _this)
    |^
    =^  cards  state
    ?+  mark               ~|(bad-rooms-mark/mark !!)
      %rooms-signal        (action:signal:hol !<(sig-act vase))
      %rooms-provider      (provider:action:rooms:hol !<(pro-act vase))
      %rooms-session       (session:action:rooms:hol !<(ses-act vase))
    ==
    [cards this]
    --
  ::
  ++  on-peek
    |=  =path
    ^-  (unit (unit cage))
    ?+    path  (on-peek:def path)
        [%x %session ~]  ::  ~/scry/rooms/session.json
      ?>  =(our.bowl src.bowl)
      ``rooms-view+!>([%session session.state])
    ==
  ::
  ++  on-watch
    |=  path=(pole knot)
    ^-  (quip card _this)
    =/  cards=(list card)
    ?+  path                  (on-watch:def path)
      ::
      [%lib ~]
        ?>  (is-host:hol src.bowl)
        [%give %fact ~ rooms-view+!>([%session session.state])]~
      ::
      [%provider-updates host=@ ~]  ::  subscribe to updates for a specific provider
        ?<  (is-banned:hol src.bowl)
        ~&  >>  "{<dap.bowl>}: {<src.bowl>} subscribing to updates for {<our.bowl>}"
        [%give %fact ~ rooms-reaction+!>([%provider-changed host.path rooms.provider.state])]~
      ::
      :: [%room-updates host=@ rid=@ ~]  ::  subscribe to updates for a specific provider
      ::   ~&  >>  "{<dap.bowl>}: {<src.bowl>} subscribing to updates for {<our.bowl>}"
      ::   =/  host      `@p`(slav %p i.t.path)
      ::   ?<  (is-banned:hol src.bowl)
      ::   =/  rooms         rooms.provider.state
      ::   [%give %fact ~ rooms-reaction+!>([%provider-changed host rooms])]~
      ::
    ==
    [cards this]
  ::
  ++  on-agent
    |=  [=wire =sign:agent:gall]
    ^-  (quip card _this)
    =/  wirepath  `path`wire
    ?+    wire  (on-agent:def wire sign)
      [%provider-updates @ ~]
        ?+    -.sign  (on-agent:def wire sign)
          %watch-ack
            ?~  p.sign  %-  (slog leaf+"{<dap.bowl>}: subscribed to rooms" ~)  `this
            ~&  >>>  "{<dap.bowl>}: rooms subscription failed"
            `this
          ::
          %kick
            ~&  >  "{<dap.bowl>}: rooms kicked us, resubscribing..."
            =/  host         `@p`(slav %p i.t.wire)
            =/  watch-path    [/provider-updates/(scot %p host)]
            :_  this
            [%pass watch-path %agent [host %rooms] %watch watch-path]~
          ::
          %fact
            ?+    p.cage.sign   (on-agent:def wire sign)
                %rooms-reaction
              =^  cards  state
                (reaction:rooms:hol !<(=reaction:store q.cage.sign))
              [cards this]
            ==
        ==
    ==
  ::
  ++  on-arvo  on-arvo:def
  ::
  ++  on-fail   on-fail:def
  ::
  ++  on-leave  on-leave:def
  --
::
|_  [bol=bowl:gall dek=(list card)]
::
+*  hol  .
::  do we want to use the abet pattern?
++  emil  |=(lac=(list card) hol(dek (welp lac dek)))
++  emit  |=(=card hol(dek [card dek]))
++  abet  ^-((quip card _state) [(flop dek) state])
::
++  is-host    |=(p=@p =(our.bol p))
++  is-banned  |=(p=@p (~(has in banned.provider.state) p))
++  is-whitelisted
  |=([=room:store =ship] (~(has in whitelist.room) ship))
++  is-creator
  |=  [=ship =rid:store]
  ?~(rom=(~(get by rooms.provider.state) rid) | =(creator.u.rom ship))
++  is-present
  |=  [sip=ship =rid:store]
  ^-  ?
  ?~(rom=(~(get by rooms.provider.state) rid) | (~(has in present.u.rom) sip))
++  can-enter
  |=  [=rid:store =ship]
  ^-  ?
  =+  room=(~(got by rooms.provider.state) rid)
  ?.(=(%private access.room) & (is-whitelisted room ship))
++  is-provider
  |=  [hos=ship src=ship]
  ^-  ?
  ?|  ?!(=(src our.bol))  ::  if the action is not from the provider           
      =(hos our.bol)      ::  if the action is from the provider, and we are the provider
  ==
::
++  init
  ^+  hol
  =/  wire       [/provider-updates/(scot %p our.bol)]
  =/  watch-our  [%pass wire %agent [our.bol %rooms] %watch wire]~
  hol(state [%0 live=~ session=session-init host=provider-init], dek (weld watch-our dek))
  ::
  ++  provider-init
    ^-  provider-state:store
    [rooms=[~] online=%.y banned=~]
  ::
  ++  session-init
    ^-  session-state:store
    [provider=our.bol rooms=[~]]
::
::  Feature arms
::
++  signal
  |%
  ++  action
    |=  act=signal-action:store
    ^-  (quip card _state)
    |^
    ?-  -.act
      %signal         (handle-signal +.act)
    ==
    ::
    ++  handle-signal
      |=  [from=ship to=ship rid=cord data=cord]
      ^-  (quip card _state)
      ?:  =(from our.bol)
        ::  Sending a signal to another ship
        :_  state
        [%pass / %agent [to %rooms] %poke rooms-signal+!>([%signal from to rid data])]~
      ::  Receiving a signal from another ship
      :_  state
      [%give %fact [/lib ~] rooms-signal+!>([%signal from to rid data])]~
    ::
    --
  --
::
++  rooms
  |%
  ++  action
    |%
    ++  provider
      |=  act=provider-action:store
      ^-  (quip card _state)
      ?-  -.act
        %set-online   (set-online +.act)
        %ban          (ban +.act)
        %unban        (unban +.act)
      ==
      ::
      ++  set-online
        |=  [online=?]
        =.  online.provider.state   online
        `state
      ::
      ++  ban
        |=  [=ship]
        =.  banned.provider.state  (~(put in banned.provider.state) ship)
        `state
      ::
      ++  unban
        |=  [=ship]
        =.  banned.provider.state  (~(del in banned.provider.state) ship)
        `state
      --
    ::
    ++  session
      |=  act=session-action:store
      ^-  (quip card _state)
      ?-  -.act
        %set-provider       (set-provider +.act)
        %reset-provider     reset-provider
        %create-room        (create-room +.act)
        %edit-room          (edit-room +.act)
        %delete-room        (delete-room +.act)
        %enter-room         (enter-room +.act)
        %leave-room         (leave-room +.act)
        %invite             `state
        %kick               (handle-kick +.act)
        %send-chat          (handle-send-chat +.act)
      ==
      ::
      ::  exploring different syntax for this
      ++  set-provider
        |=  new=ship
        =/  old               provider.session.state
        ?:  =(new old)  `state    :: if its the same provider, don't change
        ~&  >>  "{<%rooms>}: [set-provider]. {<src.bol>} setting provider from {<old>} to {<new>}"
        =/  old-wir     /provider-updates/(scot %p old)
        =/  new-wir     /provider-updates/(scot %p new)
        :_  state  %+  weld
        ?~  liv=live.state  [~]
          :~  
          :^  %pass  /  %agent
          :+  [old %rooms]  %poke
          rooms-session-action+!>(`ses-act`leave-room+rid.u.liv)
          ==
        ^-  (list card)
        :~
          [%pass old-wir %agent [old %rooms] %leave ~]
          [%pass new-wir %agent [new %rooms] %watch new-wir]
        ==
      ::
      ++  reset-provider
        =/  old                     provider.session.state
        =.  provider.session.state  our.bol
        =.  live.state         ~
        =.  rooms.session.state     ~
        =/  old-wir                 /provider-updates/(scot %p old)
        =/  new-wir                 /provider-updates/(scot %p our.bol)
        :_  state
        :~
          [%pass old-wir %agent [old %rooms] %leave ~]
          [%pass new-wir %agent [our.bol %rooms] %watch new-wir]
        ==
      ::
      ++  create-room
        |=  [=rid:store =access:store =title:store path=(unit cord)]
        =/  host            provider.session.state
        ~&  >>  "{<dap.bol>}: [create-room]. {<src.bol>} creating room {<rid>} on provider {<host>}"
        ?.  (is-provider:hol host src.bol)
          ::  the action is from us and we are not the provider, 
          ::  so send the action to the provider
          (session-create-room rid access title path)
        (provider-create-room rid access title path)
        ::
        ++  session-create-room
          |=  [=rid:store =access:store =title:store path=(unit cord)]
          =/  provider      provider.session.state
          =/  leave-cards   (gen-leave-cards:helpers:rooms:hol rid provider)
          :_  state
          %+  weld  leave-cards
            ^-  (list card)
            [%pass / %agent [provider dap.bol] %poke rooms-session-action+!>([%create-room rid access title path])]~
        ::
        ++  provider-create-room
          |=  [=rid:store =access:store =title:store path=(unit cord)]
          ~&  >>  "{<dap.bol>}: [create-room] host. {<src.bol>} creating room {<rid>}"
          ?<  (~(has by rooms.provider.state) rid) :: assert unique room id
          ?>  (lte ~(wyt by rooms.provider.state) max-rooms:lib)
          ::  TODO check if src.bol is allowed to create a room
          =|  =room:store
            =:  rid.room       rid
                provider.room  our.bol
                creator.room   src.bol
                access.room    access
                title.room     title
                capacity.room  max-occupancy:lib
                path.room      path
            ==
          =/  old-rooms               (get-created-rooms:helpers:rooms:hol src.bol)
          =.  rooms.provider.state    (~(dif by rooms.provider.state) old-rooms)  :: remove old rooms
          =.  present.room            (~(put in present.room) src.bol)        :: enter new room
          =.  whitelist.room          (~(put in whitelist.room) src.bol)      :: creator is always on the whitelist
          =.  rooms.provider.state    (~(put by rooms.provider.state) [rid room])
          =/  fact-path               [/provider-updates/(scot %p our.bol) ~]
          =/  delete-cards         ::  delete old rooms by the creator
            %+  turn  ~(val by old-rooms)
              |=  old-room=room:store
              [%give %fact fact-path rooms-reaction+!>([%room-deleted rid.old-room])]
          :_  state
          %+  weld  delete-cards
            ^-  (list card)
            [%give %fact fact-path rooms-reaction+!>([%room-created room])]~
      ::
      ++  edit-room
        |=  [=rid:store =title:store =access:store]
        =/  provider      provider.session.state
        ::
        ?.  (is-provider:hol provider src.bol)
          :_  state
          [%pass / %agent [provider dap.bol] %poke rooms-session-action+!>([%edit-room rid title access])]~
        ::
        =/  room                      (~(got by rooms.provider.state) rid)
        ?.  =(src.bol creator.room)   `state  :: only the creator can edit the room
        =.  access.room               access
        =.  title.room                title
        =.  rooms.provider.state      (~(put by rooms.provider.state) [rid room])
        =/  fact-path                 [/provider-updates/(scot %p our.bol) ~]
        :_  state
        [%give %fact fact-path rooms-reaction+!>([%room-updated room])]~
      ::
      ++  delete-room
        |=  =rid:store
        =/  provider      provider.session.state
        ?.  (is-provider:hol provider src.bol)
          :_  state
          [%pass / %agent [provider dap.bol] %poke rooms-session-action+!>([%delete-room rid])]~
        ::
        ?>  (~(has by rooms.provider.state) rid) ::  room exists
        =/  room   (~(got by rooms.provider.state) rid)
        ~&  >  ['is creator' (is-creator:hol src.bol rid)]
        ~&  >  ['is provider' (is-host:hol src.bol)]
        =/  can-delete
          ?|  (is-creator:hol src.bol rid)
              (is-host:hol src.bol)
          ==
        ?.  can-delete
          ~&  >>>  'cannot delete room - not creator or host'
          `state
        ::
        =.  rooms.provider.state      (~(del by rooms.provider.state) rid)
        =/  fact-path                 [/provider-updates/(scot %p our.bol) ~]
        :_  state
        :~
          [%give %fact fact-path rooms-reaction+!>([%room-deleted rid])]
        ==
      ::
      ++  enter-room
        |=  =rid:store
        =/  provider      provider.session.state
        ?.  (is-provider:hol provider src.bol)
          =/  leave-cards   (gen-leave-cards:helpers:rooms:hol rid provider)
          :_  state
          %+  weld  leave-cards
            ^-  (list card)
            [%pass / %agent [provider dap.bol] %poke rooms-session-action+!>([%enter-room rid])]~
        ::
        ?>  (~(has by rooms.provider.state) rid)  ::  room exists
        ?>  (can-enter:hol rid src.bol)           ::  src.bol can enter
        ::  TODO remove from other rooms if present
        :: =/  remove-result         (remove-present:helpers:rooms:hol src.bol rid)
        =/  room                      (~(got by rooms.provider.state) rid)
        ?>  (lth ~(wyt in present.room) capacity.room)
        =.  present.room              (~(put in present.room) src.bol)
        =.  rooms.provider.state      (~(put by rooms.provider.state) [rid room])
        =/  fact-path                 [/provider-updates/(scot %p our.bol) ~]
        :_  state
        [%give %fact fact-path rooms-reaction+!>([%room-entered rid src.bol])]~
        :: ?.  =(~(wyt by rooms.remove-result) 0)
        ::     =.  rooms.provider.state    rooms.remove-result ::  remove from present rooms
        :: :_  state
        :: %+  weld  cards.remove-result
        ::     ^-  (list card)
        ::     [%give %fact [/provider-updates ~] rooms-reaction+!>([%room-entered rid src.bol])]~
      ::
      ++  leave-room
        |=  =rid:store
        =/  provider      provider.session.state
        ?.  (is-provider:hol provider src.bol)
          :_  state
          [%pass / %agent [provider dap.bol] %poke rooms-session-action+!>([%leave-room rid])]~
        ::
        ?.  (~(has by rooms.provider.state) rid)  `state  ::  room exists
        :: ?:  (is-present:hol src.bol rid)      `state  ::  src.bol is present
        =/  fact-path                 [/provider-updates/(scot %p our.bol) ~]
        ?:  (is-creator:hol src.bol rid)
          =.  rooms.provider.state    (~(del by rooms.provider.state) rid)
          :_  state
          [%give %fact fact-path rooms-reaction+!>([%room-deleted rid])]~
        ::
        =/  room                  (~(got by rooms.provider.state) rid)
        =.  present.room          (~(del in present.room) src.bol)
        =.  rooms.provider.state      (~(put by rooms.provider.state) [rid room])
        :_  state
        [%give %fact fact-path rooms-reaction+!>([%room-left rid src.bol])]~
      ::
      ++  handle-send-chat
        |=  [content=cord]
        ^-  (quip card _state)
        ?~  live.state
            ~&  >>>  'must be in a room to send or receive chat'
            `state
        ?:  =(src.bol our.bol)
          ::  send all present users the chat message
          =/  room     u.live.state
          =/  peers   (skim ~(tap in present.room) skim-self:helpers:rooms:hol)
          :_  state
          %+  turn  (skim ~(tap in present.room) skim-self:helpers:rooms:hol)
            |=  =ship
            ^-  card
            [%pass / %agent [ship dap.bol] %poke rooms-session-action+!>([%send-chat content])]
        ::  Receiving a signal from another ship
        :_  state
        [%give %fact [/lib ~] rooms-reaction+!>([%chat-received src.bol content])]~
      ::
      ++  handle-kick
        |=  [rid=cord =ship]
        ^-  (quip card _state)
        =/  room                  (~(got by rooms.session.state) rid)
        ?.  (is-host:hol provider.room)
          :_  state
          [%pass / %agent [ship dap.bol] %poke rooms-session-action+!>([%kick rid ship])]~
        ::
        ?.  =(creator.room src.bol)  `state
        =.  present.room            (~(del in present.room) ship)
        =.  rooms.provider.state    (~(put by rooms.provider.state) [rid room])
        =/  fact-path               [/provider-updates/(scot %p our.bol) ~]
        :_  state
        :~
          [%give %fact fact-path rooms-reaction+!>([%kicked rid ship])]
        ==
      ::
      --
  ::
  ++  reaction
    |=  [rct=reaction:store]
    ^-  (quip card _state)
    |^
    ::
    ?+  -.rct             `state
      %room-created       (on-created +.rct)
      %room-updated       (on-updated +.rct)
      %room-deleted       (on-deleted +.rct)
      %room-entered       (on-entered +.rct)
      %room-left          (on-left +.rct)
      %provider-changed   (on-provider +.rct)
      :: %invited          (on-joined +.rct)
      %kicked             (on-kicked +.rct)
    ==
    ::
    ++  on-created
      |=  [=room:store]
      =.  live.state
        ::  if we created the room, update our current
        ?:  =(our.bol creator.room)  (some room)  live.state
      ~&  >>  "on-created: live={<rid.room>}"
      =.  rooms.session.state    (~(put by rooms.session.state) [rid.room room])
      :_  state
      [%give %fact [/lib ~] rooms-reaction+!>([%room-created room])]~
    ::
    ++  on-updated
      |=  [=room:store]
      =.  rooms.session.state    (~(put by rooms.session.state) [rid.room room])
      :_  state
      [%give %fact [/lib ~] rooms-reaction+!>([%room-updated room])]~
    ::
    ++  on-deleted
      |=  [=rid:store]
      =.  live.state
        =/  live-rid  ?~  live.state  ~  rid.u.live.state
        ?:  =(live-rid rid)  ~  live.state
      =.  rooms.session.state   (~(del by rooms.session.state) rid)
      :_  state
      [%give %fact [/lib ~] rooms-reaction+!>([%room-deleted rid])]~
    ::
    ++  on-entered
      |=  [=rid:store =ship]
      ^-  (quip card _state)
      =.  live.state
        ::  if the entered ship is us, update our current
        ?:  =(our.bol ship)  
          (~(get by rooms.session.state) rid)  
        live.state
      ::
      ~&  >>  ['on-entered' ship rid]
      =/  room                  (~(got by rooms.session.state) rid)
      =.  present.room          (~(put in present.room) ship)
      =.  rooms.session.state   (~(put by rooms.session.state) [rid room])
      ~&  >>  ['on-entered updated room:' room]
      :_  state
      [%give %fact [/lib ~] rooms-reaction+!>([%room-entered rid ship])]~
    ::
    ++  on-left
      |=  [=rid:store =ship]
      =.  live.state
        ::  if the left ship is us, update our current
        =/  live-rid  ?~  live.state  ~  rid.u.live.state
        ?:  ?&
              =(our.bol ship)
              =(rid live-rid)
            ==
          ~  live.state
      ~&  >>  "on-left: rid={<rid>} ship={<ship>}"
      =/  room                  (~(got by rooms.session.state) rid)
      =.  present.room          (~(del in present.room) ship)
      =.  rooms.session.state   (~(put by rooms.session.state) [rid room])
      :_  state
      [%give %fact [/lib ~] rooms-reaction+!>([%room-left rid ship])]~
    ::
    ++  on-provider
      |=  [provider=ship =rooms:store]
      =.  provider.session.state    provider
      =.  rooms.session.state       rooms
      =.  live.state
        ::  if the provider has actually changed, clear our current
        ?:  ?!(=(provider provider.session.state))  ~  live.state
      :_  state
      [%give %fact [/lib ~] rooms-reaction+!>([%provider-changed provider rooms])]~
    ::
    ++  on-kicked
      |=  [=rid:store =ship]
      ~&  >>  "on-kicked: rid={<rid>} ship={<ship>}"
      =.  live.state  
        ::  if the left ship is us, update our current
        =/  live-rid  ?~  live.state  ~  rid.u.live.state
        ?:  ?&
              =(our.bol ship)
              =(rid live-rid)
            ==
          ~  live.state
      =/  room                  (~(got by rooms.session.state) rid)
      =.  present.room          (~(del in present.room) ship)
      =.  rooms.session.state   (~(put by rooms.session.state) [rid room])
      :_  state
      [%give %fact [/lib ~] rooms-reaction+!>([%kicked rid ship])]~
    ::
    --
  ::
  ++  helpers
    |%
    ++  gen-leave-cards
      |=  [=rid:store provider=ship]
      ^-  (list card)
      =/  live-rid  ?~  live.state  ~  rid.u.live.state
      ?:  =(live-rid rid)
        [%pass / %agent [provider dap.bol] %poke rooms-session-action+!>([%leave-room rid])]~
      [~]
    ::
    ++  get-created-rooms
      |=  =ship
      ^-  rooms:store
      =/  rooms=(list [rid=rid:store room=room:store])
        %+  skim  ~(tap by rooms.provider.state)
          |=  [=rid:store =room:store]
          (skim-created-rooms ship room)
      ::
      ^-(=rooms:store (malt rooms))
    ::
    ++  remove-present
      |=  [=ship entering-rid=rid:store]
      ^-  [cards=(list card) =rooms:store]
      %-  ~(rep by rooms.provider.state)
        |=  [[=rid:store =room:store] result=[cards=(list card) =rooms:store]]
        ?:  =(rid entering-rid)  :: do not remove from entering room
          result
        ?:  (~(has in present.room) ship)
          =/  fact-path     [/provider-updates/(scot %p our.bol) ~]
          =.  cards.result  (snoc cards.result [%give %fact fact-path rooms-reaction+!>([%room-left rid ship])])
          =.  present.room  (~(del in present.room) ship)
          =.  rooms.result  (~(put by rooms.result) [rid room])
          [cards.result rooms.result]
        result
    ::
    ++  get-present-rooms
      |=  =ship
      ^-  rooms:store
      =/  rooms=(list [rid=rid:store room=room:store])
        %+  skim  ~(tap by rooms.provider.state)
          |=  [=rid:store =room:store]
          (skim-present-rooms ship room)
      ::
      ^-(=rooms:store (malt rooms))
    ::
    ++  skim-created-rooms
      |=  [=ship =room:store]
      ^-  ?
      =/  creator  creator.room
      =(ship creator)
    ::
    ++  skim-present-rooms
      |=  [=ship =room:store]
      ^-  ?
      (~(has in present.room) ship)
    ::
    ++  skim-self
      |=  =ship
      ^-  ?
      ?!  =(ship our.bol)
    ::
    --
::
--
