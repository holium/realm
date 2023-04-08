::  friends [realm]:
::
::  Friend list management within Realm
::
/-  *friends
/+  verb, dbug, defa=default-agent
|%
::
+$  versioned-state  $%(state-0 state-1 state-2)
::
+$  state-0  [%0 is-public=? friends=friends-0]
+$  state-1  [%1 sync-contact-store=? is-public=? friends=friends-1]
+$  state-2  [%2 =friends]
::
+$  card  card:agent:gall
--
::
%+  verb  &
%-  agent:dbug
=|  state-2
=*  state  -
=<
  |_  =bowl:gall
  +*  this   .
      def    ~(. (defa this %|) bowl)
      core   ~(. +> [bowl ~])
  ::
  ++  on-init
    ^-  (quip card _this)
    ~>  %bout.[0 '%friends +on-init']
    =^  cards  state
      abet:init:core
    [cards this]
  ::
  ++  on-save
    ^-  vase
    ~>  %bout.[0 '%friends +on-save']
    !>(state)
  ::
  ++  on-load
    |=  =vase
    ~>  %bout.[0 '%friends +on-load']
    ^-  (quip card _this)
    =^  cards  state
      abet:(load:core vase)
    [cards this]
  ::
  ++  on-poke
    |=  =cage
    ~>  %bout.[0 '%friends +on-poke']
    ^-  (quip card _this)
    =^  cards  state  abet:(poke:core cage)
    [cards this]
  ::
  ++  on-peek
    |=  =path
    ~>  %bout.[0 '%friends +on-peek']
    ^-  (unit (unit cage))
    [~ ~]
  ::
  ++  on-agent
    |=  [pole=(pole knot) =sign:agent:gall]
    ~>  %bout.[0 '%friends +on-agent']
    ^-  (quip card _this)
    :: =^  cards  state  abet:(agent:core pole sign)
    :: [cards this]
    `this
  ::
  ++  on-arvo
    |=  [pole=(pole knot) sign=sign-arvo]
    ~>  %bout.[0 '%friends +on-arvo']
    ^-  (quip card _this)
    :: =^  cards  state  abet:(arvo:core pole sign)
    :: [cards this]
    `this
  ::
  ++  on-watch
    |=  pole=(pole knot)
    ~>  %bout.[0 '%arvo +on-watch']
    ^-  (quip card _this)
    :: =^  cards  state  abet:(watch:core pole)
    :: [cards this]
    `this
  ::
  ++  on-fail
    ~>  %bout.[0 '%friends +on-fail']
    on-fail:def
  ::
  ++  on-leave
    ~>  %bout.[0 '%friends +on-leave']
    on-leave:def
  ::
  --
|_  [=bowl:gall cards=(list card)]
++  core  .
++  abet  [(flop cards) state]
++  emit  |=(=card core(cards [card cards]))
++  emil  |=(new-cards=(list card) core(cards (welp new-cards cards)))
::  +init: handle on-init
::
++  init
  ^+  core
  core
::  +load: handle on-load
::
++  load
  |=  =vase
  ^+  core
  =/  old  !<(versioned-state vase)
  ?-    -.old
      %0
    %=  core
      state
      :*  %2
          ^-  ^friends
          %-  malt
          %+  turn  ~(tap by friends.old)
          |=  [=ship fren=friend-0]
          :-  ship
          ^-  friend
          :*  pinned.fren
              tags.fren
              now.bowl
              now.bowl
              ~
              ?-  status.fren
                %fren       %fren
                %following  %sent
                %follower   %received
              ==   
              ~
      ==  ==
    ==
    ::
      %1
    %=  core
      state
      :*  %2
          ^-  ^friends
          %-  malt
          %+  turn  ~(tap by friends.old)
          |=  [=ship fren=friend-1]
          :-  ship
          ^-  friend
          :*  pinned.fren
              tags.fren
              now.bowl
              now.bowl
              ~
              ?-  status.fren
                %fren       %fren
                %following  %sent
                %follower   %received
                %contact    %know
                %our        %our
              ==
              ~
      ==  ==
    ==
    ::
    %2  core(state old)
  ==
::  +poke: handle on-poke
::
++  poke
  |=  [=mark =vase]
  ^+  core
  ?+    mark  ~|(bad-friends-mark/mark !!)
      %friends-action-0
    =/  act  !<(friends-action-0 vase)
    ?-    -.act
        %add-friend
      ::  If trying to add-friend ourselves, or issued from another ship, crash.
      ::
      ?.  =(our.bowl src.bowl)  ~|('no-foreign-add-friend' !!)
      ?:  =(our.bowl ship.act)  ~|('no-self-add-friend' !!)
      ~&  >  ['adding friend' ship.act]
      ::
      ::  %add-friend
      ::
      ::    A successful add-friend will result in a follow request
      ::    or an accept request, depending on our state.
      ::    We don't update state here, rather we wait for a
      ::    positive %poke-ack from the other ship.
      ::
      ::    TODO: receiving a NACK should notify the UI that the request failed.
      ::
      =*  follow-friend
        %-  emit
        :*  %pass
            /follow-friend/(scot %p ship.act)
            %agent
            [ship.act dap.bowl]
            %poke
            friends-action-0+!>([%follow-friend ~])
        ==
      ::
      =*  accept-friend
        %-  emit
        :*  %pass
            /accept-friend/(scot %p ship.act)
            %agent
            [ship.act dap.bowl]
            %poke
            friends-action-0+!>([%accept-friend ~])
        ==
      ::
      ?:  ::  if this ship is in our friends list
          ::
          (~(has by friends) ship.act)
        ::  get our current information about them
        ::
        =/  fren  (~(got by friends) ship.act)
        ::
        ?.  ::  if they are not known or received
            ::
            ?=(?(%know %received) relationship.fren)
          ::  then crash
          ::
          ~|('invalid-add-friend' !!)
        ?:  ::  if only know
            ::
            ?=(%know relationship.fren)
          ::  then send a follow request
          ::
          follow-friend
        ::  else (received) send an accept request
        ::
        accept-friend
      ::  ship is not in our friends list, so add them as know
      ::  and send a follow request
      ::
      =/  fren
        :*  pinned=%.n
            tags=*tags
            created-at=now.bowl
            updated-at=now.bowl
            phone-number=~
            relationship=%know
            contact-info=~
        ==
      =.  friends  (~(put by friends) ship.act fren)
      follow-friend
    ::
        %edit-friend
      ?.  =(our.bowl src.bowl)  ~|('no-foreign-edit-friend' !!)
      core
    ::
        %remove-friend
      ?.  =(our.bowl src.bowl)  ~|('no-foreign-remove-friend' !!)
      core
    ::
        %block-friend
      ?.  =(our.bowl src.bowl)  ~|('no-foreign-block-friend' !!)
      core
    ::
        %unblock-friend
      ?.  =(our.bowl src.bowl)  ~|('no-foreign-unblock-friend' !!)
      core
    ::
        %set-info
      ?.  =(our.bowl src.bowl)  ~|('no-foreign-edit-info' !!)
      core
    ::
        %follow-friend
      core
    ::
        %accept-friend
      core
    ::
        %bye-friend
      core
    ::
    ==
  ==
--
