:: 
::  %rooms [realm]: 
::
::  Keeps track of the webrtc rooms in Realm
::
/-  store=rooms, spaces
/+  lib=rooms
/+  dbug, default-agent, agentio
|%
+$  card  card:agent:gall
+$  versioned-state
    $%  state-0
    ==
+$  state-0
  $:  %0
      rooms=(map rid:store room:store)
      online=?
      banned=(set ship)
  ==
--
%-  agent:dbug
=|  state-0
=*  state  -
^-  agent:gall
=<
|_  =bowl:gall
+*  this  .
    def   ~(. (default-agent this %.n) bowl)
    core   ~(. +> [bowl ~])
:: ::
++  on-save   !>(state)
++  on-load   |=(vase `..on-init)
++  on-watch  |=(path !!)
++  on-leave  |=(path `..on-init)
++  on-agent  |=([wire sign:agent:gall] !!)
++  on-arvo   |=([wire sign-arvo] !!)
++  on-fail   |=([term tang] `..on-init)
++  on-init
  ^-  (quip card _this)
  `this
++  on-peek   |=(path ~)
++  on-poke
  |=  [=mark =vase]
  ^-  (quip card _this)
  :: crash if banned or a child of banned
  ?<  (~(has in banned) src.bowl)
  ?<  %-  ~(has in banned)
      %-  sein:title
      :-  our.bowl
      :-  now.bowl
      src.bowl
  |^
    =^  cards  state
      ?+  mark  (on-poke:def mark vase)
        %rooms-action
          (action:core !<(action:store vase))
        %rooms-server-action
          (server-action:core !<(server-action:store vase))
      ==
    [cards this]
  --
--
|_  [=bowl:gall cards=(list card)]
:: TODO use emit/emil pattern?
::
++  core  .
::
++  action
  |=  [act=action:store]
  ^-  (quip card _state)
  ?>  ?|
      online
      =(src.bowl our.bowl)
      ==
  |^
  ?+  -.act         `state
    %enter          (enter +.act)
    %exit           exit
    %create         (create +.act)
    %set-title      (set-title +.act)
    %set-access     (set-access +.act)
    %set-capacity   (set-capacity +.act)
    %set-space      (set-space +.act)
    %invite         (invite +.act)
    %kick           (kick +.act)
    %delete         (delete +.act)
    %request        (request +.act)
    %request-all    request-all
  ==
  ::
    ++  enter
      |=  =rid:store
      =/  room  (~(got by rooms) rid)
      ?>  :: enforce privacy
          ?|
          =(%public access.room)
          (~(has in whitelist.room) src.bowl)
          ==
      ?>  :: enforce max room limit
          %+  lth
          (lent ~(tap in present.room))
          capacity.room
      ::  access granted
      :: leave old room
      =.  rooms
        (leave-rooms:lib rooms src.bowl)
      :: join room
      =.  present.room
        (~(put in present.room) src.bowl)
      =.  rooms
        (insert room)
      :_  state
      (bump-room room)
    ::
    ++  exit
      ::
      :: first look up rid by @p
      :: TODO move this to lib?
      ::
      :: this assumes that a given ship
      ::   is only in one room.
      :: TODO leave all old rooms, update all old rooms
      =/  =rid:store
        =/  looms  ~(val by rooms)
        |-
        ?~  looms  !!
        ?:  %-
            ~(has in present.i.looms)
            src.bowl
            ::
          rid.i.looms
        $(looms t.looms)
      ::
      :: grabbed the dudes rid
      =/  =room:store
        (~(got by rooms) rid)
      ::
      ::
      =.  present.room
        (~(del in present.room) src.bowl)
      =.  rooms
        (insert room)
      :_  state
      (bump-room room)
    ::
    ++  create
      |=  [=rid:store =access:store =title:store enter=?]
      ?<  (~(has by rooms) rid)
      ?>  (lte ~(wyt by rooms) max-rooms:lib)
      =|  =room:store
      =:  rid.room       rid
          provider.room  our.bowl
          access.room    access
          creator.room   src.bowl
          title.room     title
          capacity.room  max-occupancy:lib
        ==
      =?  rooms
          enter
        :: leave old rooms
        (leave-rooms:lib rooms src.bowl)
      =?  present.room
          enter
        :: enter new room
        (~(put in present.room) src.bowl)
      ::
      =.  whitelist.room
        (~(put in whitelist.room) src.bowl)
      =.  rooms
        (insert room)
      :_  state
      (bump-room room)
    ::
    ++  set-title
      |=  [=rid:store =title:store]
      =/  =room:store
        (~(got by rooms) rid)
      ?>  =(creator.room src.bowl)
      =.  title.room  title
      =.  rooms
        (insert room)
      :_  state
      (bump-room room)
    ::
    ++  set-access
      |=  [=rid:store =access:store]
      =/  =room:store
        (~(got by rooms) rid)
      ?>  =(creator.room src.bowl)
      =.  access.room  access
      =.  rooms
        (insert room)
      :_  state
      (bump-room room)
    ::
    ++  set-capacity
      |=  [=rid:store =capacity:store]
      =/  =room:store
        (~(got by rooms) rid)
      ?>  =(creator.room src.bowl)
      =.  capacity.room  capacity
      =.  rooms
        (insert room)
      :_  state
      (bump-room room)
    ::
     ++  set-space
      |=  [=rid:store space=cord]
      =/  =room:store
        (~(got by rooms) rid)
      ?>  =(creator.room src.bowl)
      :: TODO scry spaces to assert membership
      =.  space.room  [~ space]
      =.  rooms
        (insert room)
      :_  state
      (bump-room room)
    ::
    ++  invite
      |=  [=rid:store invited=ship]
      :: TODO
      :: who is allowed to invite?
      =/  =room:store
        (~(got by rooms) rid)
      ?>  (~(has in whitelist.room) src.bowl)
      =.  whitelist.room
        (~(put in whitelist.room) invited)
      =.  rooms
        (insert room)
      :_  state
      :-
      %+  poke:pass:agentio
          [invited client:lib]
          :-  %rooms-update
          !>  [%invited our.bowl rid src.bowl]
      (bump-room room)
    ::
    ++  kick
      |=  [=rid:store kicked=ship]
      =/  =room:store
        (~(got by rooms) rid)
      ?>  (~(has in whitelist.room) src.bowl)
      =.  whitelist.room
        (~(del in whitelist.room) kicked)
      =.  present.room
        (~(del in present.room) kicked)
      =.  rooms
        (insert room)
      :_  state
      :-
      %+  poke:pass:agentio
          [kicked client:lib]
          :-  %rooms-update
          !>  [%kicked our.bowl rid src.bowl]
      (bump-room room)
    ::
    ++  delete
      |=  =rid:store
      =/  =room:store
        (~(got by rooms) rid)
      ?>  ?|
          =(creator.room src.bowl)
          =(our.bowl src.bowl)
          ==
      =.  rooms
        (~(del by rooms) rid)
      :_  state 
        (kick-room room)
    ::
    ++  request
      |=  =rid:store
      =/  =room:store
        (~(got by rooms) rid)
      :: enforce privacy
      :: crash if private and src not in whitelist
      ?>  ?|
          =(%public access.room)
          (~(has in whitelist.room) src.bowl)
          ==
      ::
      :_  state
      :~
      %+  poke:pass:agentio
        [src.bowl client:lib]
        :-  %rooms-update
        !>  [%room room]
      ==
    ::
    ++  request-all
      =|  rooms-set=(set room:store)
      =/  looms=(list room:store)
        ~(val by rooms)
      =.  rooms-set
        (~(gas in rooms-set) looms)
      ::
      :: enforce privacy
      :: remove private items from the list
      :: unless src in whitelist
      =.  looms
        |-
        ?~  looms  ~
        =*  loom  i.looms
        ?:  ?|
          =(%public access.loom)
          (~(has in whitelist.loom) src.bowl)
            ==
          $(looms t.looms)
        :-  loom  $(looms t.looms)
      ::
      =|  hidden-rooms-set=(set room:store)
      =.  hidden-rooms-set
        (~(gas in hidden-rooms-set) looms)
      =.  rooms-set
        (~(dif in rooms-set) hidden-rooms-set)
      ::
      :_  state
      :~
      %+  poke:pass:agentio
        [src.bowl client:lib]
        :-  %rooms-update
        !>  [%rooms rooms-set]
      ==
    ::
    ::  utilities
    ::  TODO move update-room to lib
    ::    call in rooms and room
    ++  update-room
      |=  [=room:store upd=update:store]
      ^-  (list card)
      %~  tap  in
      ^-  (set card)
      %-  ~(run in present.room)
        |=  =ship
        %+  poke:pass:agentio
            [ship client:lib]
            :-  %rooms-update
            !>  upd
    ++  kick-room
      |=  =room:store
      %+  update-room
        room 
        [%kicked our.bowl rid.room src.bowl]
    ++  bump-room
      |=  =room:store
      %+  update-room
        room 
        [%room room]
    ++  insert
      |=  =room:store
      ^-  (map rid:store room:store)
      (~(put by rooms) rid.room room)
  --
::
++  server-action
  |=  [act=server-action:store]
  ^-  (quip card _state)
  ?>  =(src.bowl our.bowl)
  |^
  ?-  -.act
    %set-online     (set-online +.act)
    %ban            (ban +.act)
    %unban          (unban +.act)
    %ban-set        (ban-set +.act)
    %unban-set      (unban-set +.act)
    %unban-all      unban-all
  ==
    ++  set-online
      |=  is=?
      `state(online is)
    ::
    ++  ban
      |=  =ship
      =.  banned
      (~(put in banned) ship)
      `state
    ::
    ++  unban
      |=  =ship
      =.  banned
      (~(del in banned) ship)
      `state
    ::
    ++  ban-set
      |=  ships=(set ship)
      =.  banned
      (~(uni in banned) ships)
      `state
    ::
    ++  unban-set
      |=  ships=(set ship)
      =.  banned
      (~(dif in banned) ships)
      `state
    ::
    ++  unban-all
      `state(banned *(set ship))
    ::
   --
::
--