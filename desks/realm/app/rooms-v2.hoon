/-  store=rooms-v2
/+  verb, dbug, default-agent, lib=rooms-v2
::
|%
::
+$  versioned-state  $%(state-0)
::
+$  state-0
  $:  %0
      provider=provider-state:store
      session=session-state:store
      active-timer=_|
      signal-tally=(map signal-action:store @)
  ==
::
+$  card  card:agent:gall
++  step  ~m1
++  peak  100
--
::
%-  agent:dbug
=|  state-0
=*  state  -
::
^-  agent:gall
::
=<
  |_  =bowl:gall
  +*  this  .
      def  ~(. (default-agent this %|) bowl)
      hol   ~(. +> [bowl ~])
  ::
  ++  on-init
    ^-  (quip card _this)
    =^  cards  state
      abet:init:hol
    [cards this]
  ::
  ++  on-save
    ^-  vase
    !>(state)
  ::
  ++  on-load
    |=  =vase
    ^-  (quip card:agent:gall agent:gall)
    =/  old=(unit state-0)
      (mole |.(!<(state-0 vase)))
    ?^  old
      `this(state u.old)
    ~&  >>  'nuking old %rooms-v2 state' ::  temporarily doing this for making development easier
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
    ?+  mark                  (on-poke:def mark vase)
        %rooms-v2-signal
      (action:signal:hol !<(signal-action:store vase))
        %rooms-v2-provider-action
      (provider:action:rooms:hol !<(provider-action:store vase))
        %rooms-v2-session-action
      =/  new-thing  !<(session-action:store vase)
      (session:action:rooms:hol !<(session-action:store vase))
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
      ``rooms-v2-view+!>([%session session.state])
    ==
  ::
  ++  on-watch
    |=  =path
    ^-  (quip card _this)
    =/  cards=(list card)
    ?+  path                  (on-watch:def path)
      ::
      [%lib ~]
        ?>  (is-our:hol src.bowl)
        [%give %fact [/lib ~] rooms-v2-view+!>([%session session.state])]~
      ::
      [%provider-updates @ ~]  ::  subscribe to updates for a specific provider
        ~&  >>  "{<dap.bowl>}: [on-watch]. {<src.bowl>} subscribing to updates for {<our.bowl>}"
        =/  host      `@p`(slav %p i.t.path)
        ?<  (is-banned:hol src.bowl)
        =/  rooms         rooms.provider.state
        [%give %fact ~ rooms-v2-reaction+!>([%provider-changed host rooms])]~
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
            [%pass watch-path %agent [host %rooms-v2] %watch watch-path]~
          ::
          %fact
            ?+    p.cage.sign   (on-agent:def wire sign)
                %rooms-v2-reaction
              =^  cards  state
                (reaction:rooms:hol !<(=reaction:store q.cage.sign))
              [cards this]
            ==
        ==
    ==
  ::
  ++  on-arvo
    |=  [=wire =sign-arvo]
    ^-  (quip card _this)
    ?+    wire  (on-arvo:def wire sign-arvo)
        [%clear-signal-tally ~]
      ?+    sign-arvo  (on-arvo:def wire sign-arvo)
          [%behn %wake *]
        ?~  error.sign-arvo
          `this(active-timer |, signal-tally ~)
        (on-arvo:def wire sign-arvo)
      ==
    ==
  ::
  ++  on-fail   on-fail:def
  ::
  ++  on-leave  on-leave:def
  --
::
|_  [bol=bowl:gall dek=(list card)]
::
+*  hol  .
++  abet
  ^-  (quip card _state)
  [(flop dek) state]
::
++  init
  ^+  hol
  =/  wire       [/provider-updates/(scot %p our.bol)]
  =/  watch-our  [%pass wire %agent [our.bol %rooms-v2] %watch wire]~
  hol(state [%0 host=provider-init session=session-init | ~], dek (weld watch-our dek))
  ::
  ++  provider-init
    ^-  provider-state:store
    [rooms=[~] online=%.y banned=~]
  ::
  ++  session-init
    ^-  session-state:store
    [provider=our.bol current=~ rooms=[~]]
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
        =/  signal  [%signal from to rid data]
        =/  count  (~(gut by signal-tally) signal 0)
        ?:  (gte count peak)  `state
        ::  Sending a signal to another ship
        :_  %=  state
              active-timer  %.y
              signal-tally  (~(put by signal-tally) signal +(count))
            ==
        %+  welp
          ?:  active-timer  ~
          [%pass /clear-signal-tally %arvo %b %wait (add now.bol step)]~
        [%pass / %agent [to %rooms-v2] %poke rooms-v2-signal+!>([%signal from to rid data])]~
      ::  Receiving a signal from another ship
      :_  state
      ?:  ?~  current.session  %.n
          =(u.current.session rid)
        [%give %fact [/lib ~] rooms-v2-signal+!>([%signal from to rid data])]~
      [%pass / %agent [src.bol dap.bol] %poke rooms-v2-session-action+!>([%leave-room rid])]~
    ::
    --
  --
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
      ==
      ::
      ++  set-provider
        |=  new-provider=ship
        =/  old-provider   provider.session.state
        :: if its the same provider, don't change
        ?:  =(new-provider old-provider)  `state
        =/  leave-cards
          ?~  current.session.state  [~]
          [%pass / %agent [old-provider dap.bol] %poke rooms-v2-session-action+!>([%leave-room u.current.session.state])]~
        ::
        =/  old-wire       [/provider-updates/(scot %p old-provider)]
        =/  wire           [/provider-updates/(scot %p new-provider)]
        ~&  >>  "{<dap.bol>}: [set-provider]. {<src.bol>} setting provider from {<old-provider>} to {<new-provider>}"
        =/  outgoing-sub-wire-leave-cards
          ^-  (list card)
          %+  murn
            ^-  (list path)
            %~  tap  in
            ^-  (set path)
            %-  %~  run  in
                  ~(key by wex.bol)
            |=  [sub=path =ship =term]
            sub
          |=  =path
          ?+  path  ~
              [%provider-updates @ ~]
            `[%pass path %agent [(slav %p i.t.path) %rooms-v2] %leave ~]
          ==
        :_  state
        %+  weld  outgoing-sub-wire-leave-cards
          %+  weld  leave-cards
            ^-  (list card)
            :~
              [%pass old-wire %agent [old-provider %rooms-v2] %leave ~]
              [%pass wire %agent [new-provider %rooms-v2] %watch wire]
            ==
      ::
      ++  reset-provider
        =/  old-provider            provider.session.state
        =.  provider.session.state  our.bol
        =.  current.session.state   ~
        =.  rooms.session.state     ~
        =/  old-wire       [/provider-updates/(scot %p old-provider)]
        =/  wire           [/provider-updates/(scot %p our.bol)]
        :_  state
        :~
          [%pass old-wire %agent [old-provider %rooms-v2] %leave ~]
          [%pass wire %agent [our.bol %rooms-v2] %watch wire]
        ==
      ::
      ++  create-room
        |=  [=rid:store =access:store =title:store path=(unit cord) type=room-type:store]
        ~&  >>  "{<dap.bol>}: [create-room]. {<src.bol>} creating room {<rid>} on provider {<provider.session.state>}"
        ?:  ?|  =(our.bol provider.session.state)
                !=(%rooms type)
            ==
          (provider-create-room rid access title path type)
        ::  the action is from us and we are not the provider, so send the action to the provider
        (session-create-room rid access title path type)
        ::
        ++  session-create-room
          |=  [=rid:store =access:store =title:store path=(unit cord) type=room-type:store]
          =/  provider      provider.session.state
          :_  state
          [%pass / %agent [provider dap.bol] %poke rooms-v2-session-action+!>([%create-room rid access title path type])]~
        ::
        ++  provider-create-room
          |=  [=rid:store =access:store =title:store path=(unit cord) type=room-type:store]
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
                type.room      type
            ==
::          =/  old-room                (get-present-room:helpers:rooms:hol src.bol)
::          =.  rooms.provider.state              :: remove old room if it exists
::            ?~  old-room  rooms.provider.state
::            ?:  ?|  !=(type type.u.old-room)
::                    =(type %data)
::                ==
::              rooms.provider.state
::            ?:  =(src.bol creator.u.old-room)   :: creator is leaving the room, so delete it
::              (~(del by rooms.provider.state) rid.u.old-room)
            :: if participant is leaving, remove participant
::            =.  present.u.old-room    (~(del in present.u.old-room) src.bol)
::            (~(put by rooms.provider.state) [rid.u.old-room u.old-room])
          ::
          =/  fact-path               [/provider-updates/(scot %p our.bol) ~]
::          =/  delete-cards            ::  prep cards to update delete old rooms by the creator
::            ?~  old-room  ~
::            ?:  ?|  !=(type type.u.old-room)
::                    =(type %data)
::                ==
::              ~
::            ?:  =(src.bol creator.u.old-room)  ::  creator is leaving the room, so delete it
::              [%give %fact fact-path rooms-v2-reaction+!>([%room-deleted rid.u.old-room])]~
::            [%give %fact fact-path rooms-v2-reaction+!>([%room-left rid.u.old-room src.bol])]~
          =.  present.room            (~(put in present.room) src.bol)        :: enter new room
          =.  whitelist.room          (~(put in whitelist.room) src.bol)      :: creator is always on the whitelist
          =.  rooms.provider.state    (~(put by rooms.provider.state) [rid room])
          :_  state
          =/  delete-cards  ~
          %+  weld  delete-cards
            ^-  (list card)
            [%give %fact fact-path rooms-v2-reaction+!>([%room-created room])]~
      ::
      ++  edit-room
        |=  [=rid:store =title:store =access:store]
        =/  provider      provider.session.state
        ::
        ?.  (is-provider:hol src.bol rid)
          :_  state
          [%pass / %agent [provider dap.bol] %poke rooms-v2-session-action+!>([%edit-room rid title access])]~
        ::
        =/  room                      (~(got by rooms.provider.state) rid)
        ?.  =(src.bol creator.room)   `state  :: only the creator can edit the room
        =.  access.room               access
        =.  title.room                title
        =.  rooms.provider.state      (~(put by rooms.provider.state) [rid room])
        =/  fact-path                 [/provider-updates/(scot %p our.bol) ~]
        :_  state
        [%give %fact fact-path rooms-v2-reaction+!>([%room-updated room])]~
      ::
      ++  delete-room
        |=  =rid:store
        =/  provider      provider.session.state
        ~&  >>  "{<dap.bol>}: [delete-room]. {<src.bol>} deleting room {<rid>}"
        ?.  (is-provider:hol src.bol rid)
          :_  state
          [%pass / %agent [provider dap.bol] %poke rooms-v2-session-action+!>([%delete-room rid])]~
        ::
        ?>  (~(has by rooms.provider.state) rid) ::  room exists
        =/  room   (~(got by rooms.provider.state) rid)
        =/  can-delete
          ?|  (is-creator:hol src.bol rid)
              (is-our:hol src.bol)
          ==
        ?.  can-delete
          ~&  >>>  'cannot delete room - not creator or host'
          `state
        ::
        =.  rooms.provider.state      (~(del by rooms.provider.state) rid)
        =/  fact-path                 [/provider-updates/(scot %p our.bol) ~]
        :_  state
        :~
          [%give %fact fact-path rooms-v2-reaction+!>([%room-deleted rid])]
        ==
      ::
      ++  enter-room
        |=  =rid:store
        =/  provider      provider.session.state
        ?.  (is-provider:hol src.bol rid)
          :_  state
            [%pass / %agent [provider dap.bol] %poke rooms-v2-session-action+!>([%enter-room rid])]~
        ::
        ?>  (~(has by rooms.provider.state) rid)  ::  room exists
        ?>  (can-enter:hol rid src.bol)       ::  src.bol can enter
        =/  fact-path               [/provider-updates/(scot %p our.bol) ~]
        =/  old-room                (get-present-room:helpers:rooms:hol src.bol)
          =.  rooms.provider.state              :: remove old room if it exists
            ?~  old-room  rooms.provider.state
            ?:  =(src.bol creator.u.old-room)   :: creator is leaving the room, so delete it
              (~(del by rooms.provider.state) rid.u.old-room)
            :: if participant is leaving, remove participant
            =.  present.u.old-room    (~(del in present.u.old-room) src.bol)
            (~(put by rooms.provider.state) [rid.u.old-room u.old-room])
        =/  leave-cards            ::  prep card to leave old room
          ?~  old-room  ~
          ?:  =(src.bol creator.u.old-room)  ::  creator is leaving the room, so delete it
            [%give %fact fact-path rooms-v2-reaction+!>([%room-deleted rid.u.old-room])]~
          [%give %fact fact-path rooms-v2-reaction+!>([%room-left rid.u.old-room src.bol])]~

        =/  room                      (~(got by rooms.provider.state) rid)
        ?>  (lth ~(wyt in present.room) capacity.room)
        =.  present.room              (~(put in present.room) src.bol)
        =.  rooms.provider.state      (~(put by rooms.provider.state) [rid room])
        :_  state
        %+  weld  leave-cards
            ^-  (list card)
        [%give %fact fact-path rooms-v2-reaction+!>([%room-entered rid src.bol])]~
      ::
      ++  leave-room
        |=  =rid:store
        =/  provider      provider.session.state
        ?.  (is-provider:hol src.bol rid)
          :_  state
          [%pass / %agent [provider dap.bol] %poke rooms-v2-session-action+!>([%leave-room rid])]~
        ::
        ?.  (~(has by rooms.provider.state) rid)  `state  ::  room exists
        =/  fact-path                 [/provider-updates/(scot %p our.bol) ~]
        ?:  (is-creator:hol src.bol rid)
          =.  rooms.provider.state    (~(del by rooms.provider.state) rid)
          :_  state
          [%give %fact fact-path rooms-v2-reaction+!>([%room-deleted rid])]~
        ::
        =/  room                  (~(got by rooms.provider.state) rid)
        =.  present.room          (~(del in present.room) src.bol)
        =.  rooms.provider.state      (~(put by rooms.provider.state) [rid room])
        :_  state
        [%give %fact fact-path rooms-v2-reaction+!>([%room-left rid src.bol])]~
      ::
      ++  handle-kick
        |=  [rid=cord =ship]
        ^-  (quip card _state)
        =/  room                  (~(got by rooms.session.state) rid)
        ?.  (is-our:hol provider.room)
          :_  state
          [%pass / %agent [provider.room dap.bol] %poke rooms-v2-session-action+!>([%kick rid ship])]~
        ::
        ?.  =(creator.room src.bol)  `state
        =.  present.room            (~(del in present.room) ship)
        =.  rooms.provider.state    (~(put by rooms.provider.state) [rid room])
        =/  fact-path               [/provider-updates/(scot %p our.bol) ~]
        :_  state
        :~
          [%give %fact fact-path rooms-v2-reaction+!>([%kicked rid ship])]
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
      :: %present          (on-suite-add +.rct)
      :: %invited          (on-joined +.rct)
      %kicked             (on-kicked +.rct)
    ==
    ::
    ++  on-created
      |=  [=room:store]
      =.  current.session.state
        ::  if we created the room, update our current
        ?:  =(our.bol creator.room)  (some rid.room)  current.session.state
      ~&  >>  "on-created: current={<current.session.state>}"
      =.  rooms.session.state    (~(put by rooms.session.state) [rid.room room])
      :_  state
      [%give %fact [/lib ~] rooms-v2-reaction+!>([%room-created room])]~
    ::
    ++  on-updated
      |=  [=room:store]
      =.  rooms.session.state    (~(put by rooms.session.state) [rid.room room])
      :_  state
      [%give %fact [/lib ~] rooms-v2-reaction+!>([%room-updated room])]~
    ::
    ++  on-deleted
      |=  [=rid:store]
      =.  current.session.state
        ?:  =(current.session.state (some rid))  ~  current.session.state
      =.  rooms.session.state   (~(del by rooms.session.state) rid)
      :_  state
      [%give %fact [/lib ~] rooms-v2-reaction+!>([%room-deleted rid])]~
    ::
    ++  on-entered
      |=  [=rid:store =ship]
      ^-  (quip card _state)
      =.  current.session.state
        ::  if the entered ship is us, update our current
        ?:  =(our.bol ship)  (some rid)  current.session.state
      ::
      ~&  >>  ['on-entered' ship rid]
      =/  room                  (~(got by rooms.session.state) rid)
      =.  present.room          (~(put in present.room) ship)
      =.  rooms.session.state   (~(put by rooms.session.state) [rid room])
      ~&  >>  ['on-entered updated room:' room]
      :_  state
      [%give %fact [/lib ~] rooms-v2-reaction+!>([%room-entered rid ship])]~
    ::
    ++  on-left
      |=  [=rid:store =ship]
      =.  current.session.state
        ::  if the left ship is us, update our current
        ?:
          ?&
            =(our.bol ship)
            =((some rid) current.session.state)
          ==
          ~  current.session.state
      ~&  >>  "on-left: rid={<rid>} ship={<ship>}"
      =/  room                  (~(got by rooms.session.state) rid)
      =.  present.room          (~(del in present.room) ship)
      =.  rooms.session.state   (~(put by rooms.session.state) [rid room])
      :_  state
      [%give %fact [/lib ~] rooms-v2-reaction+!>([%room-left rid ship])]~
    ::
    ++  on-provider
      |=  [provider=ship =rooms:store]
      =.  provider.session.state    provider
      =.  rooms.session.state       rooms
      =.  current.session.state
        ::  if the provider has actually changed, clear our current
        ?:  ?!(=(provider provider.session.state))  ~  current.session.state
      :_  state
      [%give %fact [/lib ~] rooms-v2-reaction+!>([%provider-changed provider rooms])]~
    ::
    ++  on-kicked
      |=  [=rid:store =ship]
      ~&  >>  "on-kicked: rid={<rid>} ship={<ship>}"
      =?  current.session.state  ::  if the left ship is us, update our current
          ?&
            =(our.bol ship)
            =((some rid) current.session.state)
          ==
        ~
      =/  room                  (~(got by rooms.session.state) rid)
      =.  present.room          (~(del in present.room) ship)
      =.  rooms.session.state   (~(put by rooms.session.state) [rid room])
      :_  state
      [%give %fact [/lib ~] rooms-v2-reaction+!>([%kicked rid ship])]~
    ::
    --
  ::
  ++  helpers
    |%
    ++  gen-leave-cards
      |=  [=rid:store provider=ship]
      ^-  (list card)
      ?:  =(current.session.state rid)
        [%pass / %agent [provider dap.bol] %poke rooms-v2-session-action+!>([%leave-room rid])]~
      [~]
    ::
    ++  get-present-room
      |=  =ship
      ^-  (unit room:store)
      =/  rooms=(list room=room:store)
        %+  skim  ~(val by rooms.provider.state)
          |=  =room:store
          (skim-present-rooms ship room)
      ?:  =((lent rooms) 0)  ~
      (some (rear rooms))
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
++  can-enter
  |=  [=rid:store =ship]
  ^-  ?
  =/  room      (~(got by rooms.provider.state) rid)
  ?:  =(%private access.room)
    (is-whitelisted:hol room ship)
  %.y
::
++  is-whitelisted
  |=  [=room:store =ship]
  ^-  ?
  (~(has in whitelist.room) ship)
::
++  is-creator
  |=  [=ship =rid:store]
  ^-  ?
  =/  room  (~(get by rooms.provider.state) rid)
  ?~  room  %.n
  =(creator.u.room ship)
::
++  is-banned
  |=  [=ship]
  ^-  ?
  (~(has in banned.provider.state) ship)
::
++  is-present
  |=  [=ship =rid:store]
  ^-  ?
  =/  room    (~(get by rooms.provider.state) rid)
  ?~  room    %.n
  (~(has in present.u.room) ship)
::
++  is-our
  |=  [=ship]
  ^-  ?
  =(our.bol ship)
::
++  is-provider
  |=  [src=ship =rid:store]
  ^-  ?
  (~(has by rooms.provider.state) rid) :: if the action is from our, and we are the provider
--
