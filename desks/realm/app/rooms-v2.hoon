/-  store=rooms-v2
/+  verb, dbug, default-agent, lib=rooms-v2
::
|%
+$  card     card:agent:gall
+$  r-view   view:store
+$  r-react  reaction:store
+$  sig-act  signal-action:store
+$  ses-act  session-action:store
+$  pro-act  provider-action:store
::
+$  versioned-state  $%(state-0)
::
+$  state-0  
  $:  %0
      provider=provider-state:store
      session=session-state:store
  ==
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
      def  ~(. (default-agent this %|) bowl)
      core   ~(. +> [bowl ~])
  ::
  ++  on-init
    ^-  (quip card _this)
    =^  cards  state  abet:init:core
    [cards this]
  ::
  ++  on-save
    ^-  vase
    !>(state)
  ::
  ++  on-load
    |=  ole=vase
    ^-  (quip card _this)
    =^  cards  state  abet:(load:core ole)
    [cards this]
  ::
  ++  on-poke
    |=  cag=cage
    ^-  (quip card _this)
    =^  cards  state  abet:(poke:core cag)
    [cards this]
  ::
  ++  on-peek
    |=  pat=path
    ^-  (unit (unit cage))
    (peek:core pat)
  ::
  ++  on-watch
    |=  pat=path
    ^-  (quip card _this)
    =^  cards  state  abet:(peer:core pat)
    [cards this]
  ::
  ++  on-agent
    |=  [wir=wire sig=sign:agent:gall]
    ^-  (quip card _this)
    =^  cards  state  abet:(dude:core wir sig)
    [cards this]
  ::
  ++  on-arvo  on-arvo:def
  ++  on-fail   on-fail:def
  ++  on-leave  on-leave:def
  --
::
|_  [bol=bowl:gall dek=(list card)]
::
+*  core  .
++  emit  |=(=card core(dek [card dek]))
++  emil  |=(lac=(list card) core(dek (welp lac dek)))
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
  ::  XX: not sure the comments below are correct for
  ::      the listed conditions.
  ?|  ?!(=(src our.bol))  ::  if the action is not from the provider           
      =(hos our.bol)      ::  if the action is from the provider, and we are the provider
  ==
::
++  init
  ^+  core
  %=    core
      state
    :+  %0
      [rooms=~ online=& banned=~]
    [provider=our.bol current=~ rooms=~]
  ==
::
++  load
  |=  ole=vase
  ^+  core
  :: ::  prod
  :: =/  old  !<(versioned-state ole)
  :: ?>  ?=(%0 -.old)
  :: core(state old)
  ::  test
  ?^  old=(mole |.(!<(state-0 ole)))
    core(state u.old)
  %-  emil:init
  %+  turn  ~(tap in ~(key by wex.bol))
  |=([w=wire s=@p t=@tas] [%pass w %agent [s t] %leave ~])
::
++  peek
  |=  pol=(pole knot)
  ^-  (unit (unit cage))
  ?+    pol  !!
      [%x %session ~]
    ?>  =(our.bol src.bol)
    ``rooms-v2-view+!>(`r-view`session+session.state)
  ==
::
++  poke
  |=  [mar=mark vaz=vase]
  ^+  core
  ?+  mar  ~|(bad-rooms-mark/mar !!)
    %rooms-v2-signal           (action:signal !<(sig-act vaz))
    %rooms-v2-session-action   (session:action:rooms !<(ses-act vaz))
    %rooms-v2-provider-action  (provider:action:rooms !<(pro-act vaz))
  ==
::
++  peer
  |=  pol=(pole knot)
  ^+  core
  ?+    pol  ~|(bad-rooms-watch-path/pol !!)
      [%lib ~]
    ::  XX: are we intentionally sending to everyone on
    ::      /lib path here? should it just be ~?
    ?>  (is-host src.bol)
    %-  emit
    =-  [%give %fact [/lib]~ -]
    rooms-v2-view+!>(`r-view`session+session.state)
  ::
      [%provider-updates host=@ ~]
    ?<  (is-banned src.bol)
    ~&  >>  "rooms: {<src.bol>} subscribing to updates from {<our.bol>}}"
    %-  emit
    =-  [%give %fact ~ -]
    :-  %rooms-v2-reaction
    !>  ^-  r-react
    provider-changed+[(slav %p host.pol) rooms.provider.state]
  ==
::
++  dude
  |=  [pol=(pole knot) sig=sign:agent:gall]
  ^+  core
  ?+    pol  ~|(bad-rooms-dude-wire/pol !!)
      [%provider-updates host=@ ~]
    =+  host=(slav %p host.pol)
    ?+    -.sig  !!
        %fact
      ?>  ?=(%rooms-v2-reaction p.cage.sig)
      (reaction:rooms !<(r-react q.cage.sig))
    ::
        %watch-ack
      %.  core
      ?~  p.sig
        (slog leaf+"rooms: subscribed to rooms")
      ~&  >>>  "rooms: subscription failed"  (slog u.p.sig)
    ::
        %kick
      =+  pat=/provider-updates/[host.pol]
      %-  emit
      [%pass pat %agent [host %rooms-v2] %watch pat]
    ==
  ==
::
++  signal
  |%
  ++  action
    |=  act=signal-action:store
    |^  ^+  core
      ?-  -.act       
        %signal  (handle-signal +.act)
      ==
    ::
    ++  handle-signal
      |=  [from=ship to=ship rid=cord data=cord]
      ^+  core
      ?:  =(from our.bol)
        ::  sending a signal to another ship
        %-  emit
        =-  [%pass / %agent [to %rooms-v2] %poke -]
        rooms-v2-signal+!>([%signal from to rid data])
      ::  receiving a signal from another ship
      %-  emit
      [%give %fact [/lib]~ rooms-v2-signal+!>([%signal from to rid data])]
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
      ^+  core
      ?-    -.act
        %set-online  core(online.provider.state +.act)
      ::
          %ban  
        core(banned.provider.state (~(put in banned.provider.state) +.act))
          %unban
        core(banned.provider.state (~(del in banned.provider.state) +.act))
      ==
    ::
    ++  session
      |=  act=session-action:store
      |^  ^+  core
        ?-  -.act
          %set-provider    (set-provider +.act)
          %reset-provider  reset-provider
          %create-room     (create-room +.act)
          %edit-room       (edit-room +.act)
          %delete-room     (delete-room +.act)
          %enter-room      (enter-room +.act)
          %leave-room      (leave-room +.act)
          %invite          core
          %kick            core ::(handle-kick +.act)
          %send-chat       core ::(handle-send-chat +.act)
        ==
      ::
      ++  set-provider
        |=  new=ship
        =+  old=provider.session.state
        :: if its the same provider, don't change
        ?:  =(new old)  core
        ~&  >>  "{<%rooms-v2>}: [set-provider]. {<src.bol>} setting provider from {<old>} to {<new>}"
        =+  wor=/provider-updates/(scot %p old)
        =+  wir=/provider-updates/(scot %p new)
        %-  emil
        =-  ?~  cur=current.session.state  -
            :_  -
            :^  %pass  /  %agent
            :+  [old %rooms-v2]  %poke
            rooms-v2-session-action+!>(`ses-act`leave-room+u.cur)
        :~  [%pass wor %agent [old %rooms-v2] %leave ~]
            [%pass wir %agent [new %rooms-v2] %watch wir]
        ==
      ::
      ++  reset-provider
        =+  old=provider.session.state
        =+  wor=/provider-updates/(scot %p old)
        =+  wir=/provider-updates/(scot %p our.bol)
        %-  %=  emil
              rooms.session.state     ~
              current.session.state   ~
              provider.session.state  our.bol
            ==
        :~  [%pass wor %agent [old %rooms-v2] %leave ~]
            [%pass wir %agent [our.bol %rooms-v2] %watch wir]
        ==
      ::
      ++  create-room
        ::  XX: the pattern of indenting to show similarity
        ::      but not forcing them into a scope (core) is 
        ::      unconventional and might confuse the reader
        ::
        ::  XX: rewritten inline logic to resolve.
        ::
        |=  [=rid:store acc=access:store tit=title:store pat=(unit cord)]
        =+  hos=provider.session.state
        ~&  >>  "{<%rooms-v2>}: [create-room]. {<src.bol>} creating room {<rid>} on provider {<hos>}"
        ?.  (is-provider provider.session.state src.bol)
          ::  the action is from us and we are not the provider,
          ::  so send the action to the provider
          =+  lev=(gen-leave-cards:helpers rid hos)
          %-  emil
          %+  welp  lev
          =-  [%pass / %agent [hos %rooms-v2] %poke -]~
          rooms-v2-session-action+!>(`ses-act`create-room+[rid acc tit pat])
          ::
        ~&  >>  "{<%rooms-v2>}: [create-room] host. {<src.bol>} creating room {<rid>}"
        ?<  (~(has by rooms.provider.state) rid)        :: assert unique room id
        ?>  (lte ~(wyt by rooms.provider.state) max-rooms:lib)
        =+  old=(get-created-rooms:helpers src.bol)
        =+  pad=/provider-updates/(scot %p our.bol)
        =.  rooms.provider.state                        ::  remove old rooms
          (~(dif by rooms.provider.state) old)
        =|  =room:store                                 ::  bunt a room
        =:  rid.room        rid
            provider.room   our.bol
            creator.room    src.bol
            access.room     acc
            title.room      tit
            capacity.room   max-occupancy:lib
            path.room       pat
            present.room    (~(put in present.room) src.bol)
            whitelist.room  (~(put in whitelist.room) src.bol)
          ==
        %-  emil
        %-  weld
        :_  =-  [%give %fact [pad]~ -]~
            rooms-v2-reaction+!>(`r-react`room-created+room)
        %+  turn  ~(val by old)
        |=  ole=room:store
        =-  [%give %fact [pad]~ -]
        rooms-v2-reaction+!>(`r-react`room-deleted+rid.ole)
      ::
      ++  edit-room
        |=  [=rid:store tit=title:store acc=access:store]
        =+  hos=provider.session.state
        ?.  (is-provider hos src.bol)
          %-  emit
          =-  [%pass / %agent [hos %rooms-v2] %poke -]
          rooms-v2-session-action+!>(`ses-act`edit-room+[rid tit acc])
        ::
        =+  pat=/provider-updates/(scot %p our.bol)
        =+  room=(~(got by rooms.provider.state) rid)
        ?.  =(src.bol creator.room)   core              :: only the creator can edit the room
        =:  access.room  acc
            title.room   tit
          ==
        %.  =-  [%give %fact [pat]~ -]
            rooms-v2-reaction+!>(`r-react`room-updated+room)
        %=  emit
          rooms.provider.state  (~(put by rooms.provider.state) rid room)
        ==
      ::
      ++  delete-room
        |=  =rid:store
        =+  hos=provider.session.state
        ?.  (is-provider hos src.bol)
          %-  emit
          =-  [%pass / %agent [hos %rooms-v2] %poke -]
          rooms-v2-session-action+!>(`ses-act`delete-room+rid)
        ::
        ?>  (~(has by rooms.provider.state) rid)        ::  room exists
        =+  room=(~(got by rooms.provider.state) rid)
        ~&  >  ['is creator' (is-creator src.bol rid)]
        ~&  >  ['is provider' (is-host src.bol)]
        ?.  |((is-host src.bol) (is-creator src.bol rid))
          ~&  >>>  'cannot delete room - not creator or host'
          core
        ::
        =+  pat=/provider-updates/(scot %p our.bol)
        %.  =-  [%give %fact [pat]~ -]
            rooms-v2-reaction+!>(`r-react`room-deleted+rid)
        %=  emit
          rooms.provider.state  (~(del by rooms.provider.state) rid)
        ==
      ::
      ++  enter-room
        |=  =rid:store
        =+  hos=provider.session.state
        ::?.  (is-host provider)
        ?.  (is-provider hos src.bol)
          %-  emil
          %+  welp  (gen-leave-cards:helpers rid hos)
          =-  [%pass / %agent [hos %rooms-v2] %poke -]~
          rooms-v2-session-action+!>(`ses-act`enter-room+rid)
        ::
        ?>  (~(has by rooms.provider.state) rid)        ::  room exists
        ?>  (can-enter rid src.bol)                ::  src.bol can enter
        ::  TODO remove from other rooms if present
        :: =/  remove-result         (remove-present:helpers src.bol rid)
        =+  pat=/provider-updates/(scot %p our.bol)
        =+  room=(~(got by rooms.provider.state) rid)
        =.  present.room  (~(put in present.room) src.bol)
        %.  =-  [%give %fact [pat]~ -]
            rooms-v2-reaction+!>(`r-react`room-entered+[rid src.bol])
        emit(rooms.provider.state (~(put by rooms.provider.state) rid room))
        :: ?.  =(~(wyt by rooms.remove-result) 0)  
        ::     =.  rooms.provider.state    rooms.remove-result ::  remove from present rooms
        :: :_  state
        :: %+  weld  cards.remove-result
        ::     ^-  (list card)
        ::     [%give %fact [/provider-updates ~] rooms-v2-reaction+!>([%room-entered rid src.bol])]~
      ::
      ++  leave-room
        |=  =rid:store
        =+  hos=provider.session.state
        ?.  (is-provider hos src.bol)
          %-  emit
          =-  [%pass / %agent [hos %rooms-v2] %poke -]
          rooms-v2-session-action+!>(`ses-act`leave-room+rid)
        ::
        ?.  (~(has by rooms.provider.state) rid)  core  ::  room exists
        :: ?:  (is-present src.bol rid)      `state  ::  src.bol is present
        =+  pat=/provider-updates/(scot %p our.bol)
        ?:  (is-creator src.bol rid)
          %.  =-  [%give %fact [pat]~ -]
              rooms-v2-reaction+!>(`r-react`room-deleted+rid)
          emit(rooms.provider.state (~(del by rooms.provider.state) rid))
        ::
        =+  room=(~(got by rooms.provider.state) rid)
        =.  present.room  (~(del in present.room) src.bol)
        %.  =-  [%give %fact [pat]~ -]
            rooms-v2-reaction+!>(`r-react`room-left+[rid src.bol])
        %=  emit
            rooms.provider.state
          (~(put by rooms.provider.state) rid room)
        ==
      ::   
      ++  handle-send-chat
        |=  [con=cord]
        ?~  cur=current.session.state
            ~&  >>>  'must be in a room to send or receive chat'
            core
        ?.  =(src.bol our.bol)
          ::  receiving a signal from another ship
          %-  emit
          =-  [%give %fact [/lib]~ -]
          rooms-v2-reaction+!>(`r-react`chat-received+[src.bol con])
        ::  send all present users the chat message
        =+  room=(~(got by rooms.session.state) u.cur)
        %-  emil
        %+  turn  (skim ~(tap in present.room) skim-self:helpers)
        |=  sip=ship
        =-  [%pass / %agent [sip %rooms-v2] %poke -]
        rooms-v2-session-action+!>(`ses-act`send-chat+con)
      ::
      ++  handle-kick
        |=  [rid=cord sip=ship]
        =+  room=(~(got by rooms.session.state) rid)
        ?.  (is-host provider.room)
          %-  emit
          =-  [%pass / %agent [sip %rooms-v2] %poke -]
          rooms-v2-session-action+!>(`ses-act`kick+[rid sip])
        ::
        ?.  =(creator.room src.bol)  core
        =+  pat=/provider-updates/(scot %p our.bol)
        =.  present.room  (~(del in present.room) sip)
        %.  =-  [%give %fact [pat]~ -]
            rooms-v2-reaction+!>(`r-react`kicked+[rid sip])
        emit(rooms.provider.state (~(put by rooms.provider.state) rid room))
      --
    --
  ++  reaction
    |=  [rct=reaction:store]
    |^  ^+  core
      ?+  -.rct  core
        %kicked            (on-kicked +.rct)
        %room-left         (on-left +.rct)
        %room-created      (on-created +.rct)
        %room-updated      (on-updated +.rct)
        %room-deleted      (on-deleted +.rct)
        %room-entered      (on-entered +.rct)
        %provider-changed  (on-provider +.rct)
        :: %present           core :: (on-suite-add +.rct)
        :: %invited           core :: (on-joined +.rct)
      ==
    ::
    ++  on-created
      |=  =room:store
      %.  =-  [%give %fact [/lib]~ -]
          rooms-v2-reaction+!>(`r-react`room-created+room)
      %=    emit
          rooms.session.state
        (~(put by rooms.session.state) [rid.room room])
      ::
          current.session.state
        ::  if we created the room, update our current
        ?:(=(our.bol creator.room) (some rid.room) current.session.state)
      ==
    ::
    ++  on-updated
      |=  =room:store
      %.  =-  [%give %fact [/lib]~ -]
          rooms-v2-reaction+!>(`r-react`room-updated+room)
      %=  emit
        rooms.session.state  (~(put by rooms.session.state) rid.room room)
      ==
    ::
    ++  on-deleted
      |=  =rid:store
      %.  [%give %fact [/lib]~ rooms-v2-reaction+!>(room-deleted+rid)]
      %=    emit
        rooms.session.state  (~(del by rooms.session.state) rid)
      ::
          current.session.state
        ?:(=(current.session.state (some rid)) ~ current.session.state)
      ==
    ::
    ++  on-entered
      |=  [=rid:store sip=ship]
      =+  room=(~(got by rooms.session.state) rid)
      %.  =-  [%give %fact [/lib]~ -]
          rooms-v2-reaction+!>(`r-react`room-entered+[rid sip])
      %=    emit
          current.session.state
        ::  if the entered ship is us, update our current
        ?:(=(our.bol sip) (some rid) current.session.state)
      ::
          rooms.session.state
        %-  ~(put by rooms.session.state)
        [rid room(present (~(put in present.room) sip))]
      ==
    ::
    ++  on-left
      |=  [=rid:store sip=ship]
      =+  room=(~(got by rooms.session.state) rid)
      ~&  >>  "on-left: rid={<rid>} ship={<sip>}"
      %.  =-  [%give %fact [/lib]~ -]
          rooms-v2-reaction+!>(`r-react`room-left+[rid sip])
      %=    emit
          rooms.session.state
        %-  ~(put by rooms.session.state)
        [rid room(present (~(del in present.room) sip))]
      ::
          current.session.state 
        ::  if the left ship is us, update our current
        ?:  ?&  =(our.bol ship)  
                =((some rid) current.session.state)
            ==
          ~
        current.session.state
      ==
    ::
    ++  on-provider
      |=  [sip=ship rom=rooms:store]
      %.  =-  [%give %fact [/lib]~ -]
          rooms-v2-reaction+!>(`r-react`provider-changed+[sip rom])
      %=    emit
        rooms.session.state     rom
        provider.session.state  sip
      ::
          current.session.state
        ::  if the provider has actually changed, clear our current   
        ?:(!=(provider provider.session.state) ~ current.session.state)
      ==
    ::
    ++  on-kicked
      |=  [=rid:store sip=ship]
      =+  room=(~(got by rooms.session.state) rid)
      ~&  >>  "on-kicked: rid={<rid>} ship={<sip>}"
      %.  =-  [%give %fact [/lib]~ -]
          rooms-v2-reaction+!>(`r-react`[%kicked rid sip])
      %=    emit
          rooms.session.state
        %-  ~(put by rooms.session.state)
        [rid room(present (~(del in present.room) sip))]
      ::
          current.session.state
        ::  if the left ship is us, update our current
        ?:  ?&  =(our.bol ship)  
                =((some rid) current.session.state)
            ==
          ~
        current.session.state
      ==
    ::
    --
  ::
  ++  helpers
    |%
    ++  skim-self  |=(=ship !=(ship our.bol))
    ::
    ++  skim-created-rooms
      |=([=ship =room:store] =(ship creator.room))
    ::
    ++  skim-present-rooms
      |=([=ship =room:store] (~(has in present.room) ship))
    ::
    ++  gen-leave-cards
      |=  [=rid:store provider=ship]
      ^-  (list card)
      ?.  =(current.session.state rid)  ~
      =-  [%pass / %agent [provider %rooms-v2] %poke -]~
      rooms-v2-session-action+!>(`ses-act`leave-room+rid)
    ::
    ++  get-created-rooms
      |=  =ship
      ^-  rooms:store
      %-  malt
      ^-  (list [rid=rid:store room=room:store])
      %+  skim  ~(tap by rooms.provider.state)
      |=  [=rid:store =room:store]
      (skim-created-rooms ship room)
    ::
    ++  remove-present
      |=  [=ship entering-rid=rid:store]
      ^-  [cards=(list card) =rooms:store]
      =+  pat=/provider-updates/(scot %p our.bol)
      %-  ~(rep by rooms.provider.state)
      |=  $:  [=rid:store =room:store]
              result=[cards=(list card) =rooms:store]
          ==
      ?:  =(rid entering-rid)            result         :: do not remove from entering room
      ?.  (~(has in present.room) ship)  result
      =.  present.room  (~(del in present.room) ship)
      :_  (~(put by rooms.result) rid room)
      %+  snoc  cards.result
      =-  [%give %fact [pat]~ -]
      rooms-v2-reaction+!>(`r-react`room-left+[rid ship])
    ::
    ++  get-present-rooms
      |=  =ship
      ^-  rooms:store
      %-  malt
      ^-  (list [rid=rid:store room=room:store])  
      %+  skim  ~(tap by rooms.provider.state)
      |=  [=rid:store =room:store]
      (skim-present-rooms ship room)
    --
  --
--