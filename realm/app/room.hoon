:: 
::  %room [realm]:
::
/-  store=rooms
/+  lib=rooms
/+  dbug, default-agent
/+  agentio
|%
+$  card  card:agent:gall
+$  versioned-state
    $%  state-0
    ==
+$  state-0
  $:  %0
      my-room=(unit room:store)
      provider=(unit ship)
  ==
--
%-  agent:dbug
=|  state-0
=*  state  -
^-  agent:gall
=<
|_  =bowl:gall
+*  this   .
    def    ~(. (default-agent this %.n) bowl)
    core   ~(. +> [bowl ~])
::
++  on-save   !>(state)
++  on-load   |=(vase `..on-init)
++  on-leave  |=(path `..on-init)
++  on-agent  |=([wire sign:agent:gall] !!)
++  on-arvo   |=([wire sign-arvo] !!)
++  on-fail   |=([term tang] `..on-init)
++  on-init
  ^-  (quip card _this)
  `this
++  on-peek
    |=  =path
    ^-  (unit (unit cage))
    ?+    path  (on-peek:def path)
    ::
      [%x ~]
        ``rooms-view+!>([%full my-room provider])
      [%x %present ~]
        :: TODO tall form?
        ?~  my-room
          ``rooms-view+!>([%present *(set ship)])
        ``rooms-view+!>([%present present.u.my-room])
    ==
++  on-watch
  |=  =path
  ^-  (quip card _this)
  ?+    path
    (on-watch:def path)
      [%room %local ~]
    :_  this
      ?~  my-room  ~
      [%give %fact [/room/local]~ %rooms-update !>([%room u.my-room])]~
  ==
++  on-poke
  |=  [=mark =vase]
  ^-  (quip card _this)
  |^
    =^  cards  state
      ?+  mark  (on-poke:def mark vase)
        %rooms-action
          (action:core !<(action:store vase))
        ::
        %rooms-update
          (update:core !<(update:store vase))
      ==
    [cards this]
  --
--
::
|_  [=bowl:gall cards=(list card)]
:: TODO emit/emil pattern?
::
::
++  abet  [(flop cards) state]
++  core  .
++  emit  |=(=card core(cards [card cards]))
++  emil  |=(caz=(list card) core(cards (welp (flop caz) cards)))
++  give  |=(=gift:agent:gall (emit %give gift))
::
:: :: utils
++  fwd-to-room
  |=  [upd=update:store]
  ^-  (list card)
  ?~  provider     !!
  ?~  my-room      !!
  =/  here  present.u.my-room
  =.  here
    (~(del in here) our.bowl)
  :: poke everyone in here
  %~  tap  in
  ^-  (set card)
  %-  ~(run in here)
    |=  =ship
    %+  poke:pass:agentio
        [ship client:lib]
        :-  %rooms-update
        !>  upd
::
++  action
  |=  [act=action:store]
  ^-  (quip card _state)
  ?>  =(our.bowl src.bowl)
  |^
  ?+     -.act      (fwd-to-provider act)
    %logout         logout
    %exit           (exit act)
    %chat           (chat +.act)
    %set-provider   (set-provider +.act)
  ==
  ::
    ++  exit
      |=  act=action:store
      =.  my-room  ~
      (fwd-to-provider act)
    ++  logout
      =/  dad       +.provider
      =.  my-room   ~
      =.  provider  ~
      :_  state
      :~
        %+  poke:pass:agentio
          [dad server:lib]
          rooms-action+!>([%exit ~])
      ==
    ++  chat
    :: fwd to peers
    |=  =cord
      =/  upd
        [%chat our.bowl cord]
      =/  caz
        (fwd-to-room upd)
      =.  cards
        (welp (flop caz) cards)
      abet
    ++  set-provider
      |=  =ship
      =.  provider
          :-  ~  ship
      =.  my-room   ~
      `state
    :: ::
    :: ::
    ++  fwd-to-provider
      |=  [act=action:store]
      ?~  provider  !!
      =*  dad  u.provider
      :_  state
      :~
        %+  poke:pass:agentio
          [dad server:lib]
          rooms-action+!>(act)
      ==
  --
::
++  update
  |=  [upd=update:store]
  ^-  (quip card _state)
  |^
  =.  cards
    :-  (publish-local upd)
    cards
  ~&  >  ["UPDATE: " upd]
  ?-  -.upd
    %room      (room +.upd)
    %rooms     (rooms +.upd)
    %invited   (invited +.upd)
    %kicked    (kicked +.upd)
    %chat      (chat +.upd)
  ==
  ::
    ++  chat
      |=  [=ship =cord]
      ::
      :: assert message is from peer
      ?~  my-room  !!
      =*  here  present.u.my-room
      ?>  (~(has in here) src.bowl)
      ::
      ~&  >  [%room-chat src.bowl cord]
      abet
    ::
    ++  room
      |=  =room:store
      ::  TODO
      ::  if not my provider:
      ::    reply with [%exit ~] action
      :: this can do a lot to enforce consensus
      :: =======
      ?>  is-provider
      ~&  >  ["room: got an update"]
      =.  my-room
        [~ room]
      abet
    ::
    ++  rooms
      |=  rooms=(set room:store)
      ?>  is-provider
      :: find and update my-room
      ::
      :: look up room by @p
      :: TODO move this to lib
      =/  rum=(unit room:store)
        =/  looms  ~(tap in rooms)
        |-
        ?~  looms  ~
        ?:  %-
            ~(has in present.i.looms)
            our.bowl
            ::
          [~ i.looms]
        $(looms t.looms)
      ?~  rum  abet
      :: found my room
      =.  my-room  [~ u.rum]
      abet
    ::
    ++  invited
      |=  [provider=ship =rid:store =ship]
      :: ?>  is-provider :: TODO needed?
      :: ?>  is-friend   :: TODO needed?
      abet
    ::
    ++  kicked
      |=  [provider=ship =rid:store =ship]
      ?>  is-provider
      =.  my-room  ~
      abet
    :: ::
    :: ::
    :: :: utils
    ++  fwd-to-room
      |=  [upd=update:store]
      ^-  (list card)
      ?~  provider     !!
      ?~  my-room      !!
      =/  here  present.u.my-room
      =.  here
        (~(del in here) our.bowl)
      :: poke everyone in here
      %~  tap  in
      ^-  (set card)
      %-  ~(run in here)
        |=  =ship
        %+  poke:pass:agentio
            [ship client:lib]
            :-  %rooms-update
            !>  upd
    ::
    ++  publish-local
      |=  [upd=update:store]
      ^-  card
      [%give %fact [/room/local]~ %rooms-update !>(upd)]
    ::
    ++  is-provider
      ^-  ?
      ?~  provider  |
      =(src.bowl u.provider)
  --
::
--