::  friends [realm]:
::    Friend list management within Realm
::
::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
::                                                                            ::
::  This agent is heavily documented.  It's meant to be an example            ::
::  and reference for writing future Realm agents.                            ::
::  Follow the structure shown here whenever possible.                        ::
::                                                                            ::
::  Principles:                                                               ::
::  - Try to keep line width under 80 characters.                             ::
::    To add a ruler in VSCode, see https://stackoverflow.com/a/29972073      ::
::  - Prefer longer and more descriptive variable names.                      ::
::  - Avoid hiding logic in library files, besides JSON handlers.             ::
::  - If in an unexpected state, crash with an error message / stack trace.   ::
::    Be as strict as possible, especially on the first pass.  Then you'll    ::
::    start to see how state can get corrupted, and can decide on behavior    ::
::    for those situations.                                                   ::
::  - Follow the commenting style shown here and described in                 ::
::    https://developers.urbit.org/reference/hoon/style.                      ::
::    (minus the "boxed in" comments, they are for this guide only).          ::
::  - Follow rune choice, file structure, and other style guidelines in       ::
::    https://www.ajlamarc.com/blog/2023-02-26-urbit-style/.                  ::
::    If another code structure could serve better, discuss with the team.    ::
::                                                                            ::
::  Q: How do I introduce a new state version?                                ::
::  A: Add it to versioned-state, add a new case to +load,                    ::
::     and update the sur definitions.                                        ::
::     Modify the versioned cores to work alongside the new state.            ::
::     If this is infeasible, remove some of the old versioned cores.         ::
::                                                                            ::
::  Q: How do I introduce a new mark version?                                 ::
::  A: Add the new sur definitions.  Add a new versioned core,                ::
::     copying over the previous's logic and making the necessary changes.    ::
::     Update the /~/current-version/ scry to latest.                         ::
::                                                                            ::
::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
::
/-  *friends
/+  verb, dbug, defa=default-agent
|%
::
::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
::                                                                            ::
::  Define state versioning and other boilerplate                             ::
::                                                                            ::
::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
::
+$  versioned-state
  $%  state-0
      state-1
      state-2
  ==
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
::
::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
::                                                                            ::
::  Nested core pattern:                                                      ::
::    https://developers.urbit.org/blog/nested-core-pattern                   ::
::                                                                            ::
::    Calls the relevant arms in "core" if the arm is implemented             ::
::    otherwise functionality is stubbed here via default-agent.              ::
::                                                                            ::
::    This hides the =^ nonsense from the rest of the code.                   ::
::                                                                            ::
::  See also for more information / a refresher about Gall:                   ::
::    https://developers.urbit.org/reference/arvo/gall/gall#arms              ::
::                                                                            ::
::   ___                                                                  __  ::
::  /__/|__                                                            __//|  ::
::  |__|/_/|__                                                       _/_|_||  ::
::  |_|___|/_/|__                                                 __/_|___||  ::
::  |___|____|/_/|__             ᕦ( ͡° ͜ʖ ͡°)ᕤ                  __/_|____|_||  ::
::  |_|___|_____|/_/|_________________________________________/_|_____|___||  ::
::  |___|___|__|___|/__/___/___/___/___/___/___/___/___/___/_|_____|____|_||  ::
::  |_|___|___|___|___|___|___|___|___|___|___|___|___|___|___|___|___|___||  ::
::  |___|___|___|___|___|___|___|___|___|___|___|___|___|___|___|___|___|_||  ::
::  |_|___|___|___|___|___|___|___|___|___|___|___|___|___|___|___|___|___|/  ::
::                                                                            ::
::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
::
  |_  =bowl:gall
  +*  this   .
      def    ~(. (defa this %|) bowl)
      core   ~(. +> [bowl ~])
  ::
  ++  on-init
    ^-  (quip card _this)
    ~>  %bout.[0 '%friends +on-init']
    :: =^  cards  state  abet:init:core
    :: [cards this]
    on-init:def
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
    |=  [path=(pole knot) =sign:agent:gall]
    ~>  %bout.[0 '%friends +on-agent']
    ^-  (quip card _this)
    =^  cards  state  abet:(agent:core path sign)
    [cards this]
  ::
  ++  on-arvo
    |=  [path=(pole knot) sign=sign-arvo]
    ~>  %bout.[0 '%friends +on-arvo']
    ^-  (quip card _this)
    :: =^  cards  state  abet:(arvo:core path sign)
    :: [cards this]
    `this
  ::
  ++  on-watch
    |=  path=(pole knot)
    ~>  %bout.[0 '%arvo +on-watch']
    ^-  (quip card _this)
    :: =^  cards  state  abet:(watch:core path)
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
::
::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
::                                                                            ::
::  CORE: "shared" core that dispatches events                                ::
::  to the correct versioned core for handling.                               ::
::                                                                            ::
::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
::
|_  [=bowl:gall cards=(list card)]
+*  core  .
++  abet  [(flop cards) state]
++  emit  |=(=card core(cards [card cards]))
++  emil  |=(new-cards=(list card) core(cards (welp new-cards cards)))
::
::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
::                                                                            ::
::  +load: handle on-load                                                     ::
::                                                                            ::
::    Handle transition from old state versions.                              ::
::    Always upgrade state incrementally:                                     ::
::    from state-0 to state-1, state-1 to state-2, etc.                       ::
::    This lets you write one state transition per update instead of N.       ::
::    Multiple upgrades will be handled recursively.                          ::
::                                                                            ::
::    1.  Extract old state from vase                                         ::
::    2.  Branch on state version                                             ::
::    3.  Handle transition to the next version, or return if at latest.      ::
::        This is done by calling $, i.e. re-evaluating at the trap           ::
::        with `old` updated to the next version.                             ::
::                                                                            ::
::  Note that state versions move separately from "mark" versions.            ::
::  i.e. action-0, update-0, scry /~/0/<...>, etc.                            ::
::  Hence we handle state versioning here rather than in versioned cores.     ::
::                                                                            ::
::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
::
++  load
  |=  =vase
  ^+  core
  =/  old  !<(versioned-state vase)
  |-
  ?-    -.old
      %0
    %=  $
        old   :*  %1
                  %.y
                  is-public.old
                  ^-  friends-1
                  %-  malt
                  %+  turn  ~(tap by friends.old)
                  |=  [=ship fren=friend-0]
                  :-  ship
                  :*  pinned.fren
                      tags.fren
                      status.fren
                      ~
    ==        ==  ==
  ::
      %1
    %=  $
        old   :*  %2
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
    ==        ==  ==
  ::
    %2  core(state old)
  ==
::
::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
::                                                                            ::
::  +poke: handle on-poke                                                     ::
::
::    Handle push requests from other ships, and our frontend to our ship.
::
::    General steps:
::    1.  Branch on mark; extract mark's type from vase to get the action.
::    2.  Branch on action type, conventionally the head of the action.
::    3.  Handle action; update state and emit effects as necessary.
::        This step is handled in our versioned core.
::
::    Error states:
::    1.  Poke is not received by the other ship (it is not running).
::        It _should_ receive it when it boots up again.
::        We will not receive a response until their next boot: the frontend
::        should set a timer and notify that the destination did not respond.
::    2.  Poke is NACKed by the other ship.  Handled in +agent.
::
::    Note that we should expect to receive N pokes of the same type.
::    Therefore receiving a poke we've already received should be idempotent,
::    and not produce any cards or effects?
::                                                                            ::
::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
::
++  poke
  |=  [=mark =vase]
  ^+  core
  ?+    mark  ~|(bad-friends-mark/mark !!)
      %friends-action-0
    (poke:core-0 !<(friends-action-0 vase))
  ==
::  +agent: handle on-agent
::
::    In +agent we will receive responses from other agents.
::    See https://developers.urbit.org/reference/arvo/gall/gall#on-agent
::    for the types of responses we can expect.
::
::    General steps (2-4 are in the versioned core):
::    1.  Check version number of incoming update.
::        By our convention, this is always the head of path.
::        Note that these are text constants and not numbers as they are in +load.
::    2.  Route on request wire.  By our convention, this is always path's tail.
::    3.  Route on sign.
::    4.  Update state and emit effects as necessary.
::
::    Error states:
::    1.  Negative poke-ack or watch-ack (NACK).  Notify the frontend that these
::        requests were rejected.
::    2.  
::
++  agent
  |=  [path=(pole knot) =sign:agent:gall]
  ^+  core
  ?+    -.path  ~|(bad-agent-version/path !!)
      %'0'
    (agent:core-0 +.path sign)
  ::
  ==
::
++  core-0
  |%
  ++  poke
  |=  act=friends-action-0
  ^+  core
  ?-    -.act
      %add-friend
    ::  A successful add-friend will result in a follow request
    ::  or an accept request, depending on our state.
    ::  We don't update state here, rather we wait for a
    ::  positive %poke-ack from the other ship.
    ::
    ::  TODO: receiving a NACK should notify the UI that the request failed.
    ::
    ::  If trying to add-friend ourselves, or issued from another ship, crash.
    ::
    ?.  =(our.bowl src.bowl)  ~|('no-foreign-add-friend' !!)
    ?:  =(our.bowl ship.act)  ~|('no-self-add-friend' !!)
    ~&  >  ['adding friend' ship.act]
    ::  Pokes to be used later
    ::
    =*  sent-friend
      %-  emit
      :*  %pass
          /0/sent-friend/(scot %p ship.act)
          %agent
          [ship.act dap.bowl]
          %poke
          friends-action-0+!>([%sent-friend ~])
      ==
    ::
    =*  accept-friend
      %-  emit
      :*  %pass
          /0/accept-friend/(scot %p ship.act)
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
        ~|(invalid-add-friend/relationship.fren !!)
      ?:  ::  if only know
          ::
          ?=(%know relationship.fren)
        ::  then send a friend request
        ::
        sent-friend
      ::  else (received) send an accept request
      ::
      accept-friend
    ::  ship is not in our friends list, so add them as know
    ::  and send a friend request
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
    sent-friend
  ::
      %edit-friend
    ?.  =(our.bowl src.bowl)  ~|('no-foreign-edit-friend' !!)
    ?:  =(our.bowl ship.act)  ~|('no-self-edit-friend' !!)
    ~&  >  ['editing friend' ship.act]
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
      %sent-friend
    core
  ::
      %accept-friend
    core
  ::
      %bye-friend
    core
  ::
  ==
  ::
  ++  agent
  |=  [path=(pole knot) =sign:agent:gall]
  ^+  core
  ::  This will be used repeatedly, so define it once.
  ::
  =*  ship  `@p`(slav %p ship.path)
  ::
  ?+    path  ~|(bad-agent-wire/path !!)
      [%sent-friend ship=@ ~]
    ::
    ?+    -.sign  ~|(bad-sent-friend-sign/sign !!)
        %poke-ack
      ::
      ?~  ::  If p.sign is null
          ::
          p.sign
        ::  Then the poke succeeded.  Verify that the ship is currently %know,
        ::  then update our relationship to %sent.
        ::
        =/  fren  (~(got by friends) ship)
        ?:  ?=(%know relationship.fren)  ~|(dont-know-cant-follow/relationship.fren !!)
        =.  relationship.fren  %sent
        ::
        =.  friends  (~(put by friends) ship fren)
        ::  TODO, emit any necessary cards
        core
      ::  Else, the poke failed (was NACKed).  Don't update state.
      ::  TODO, notify UI of failure.
      ::
      ((slog leaf/"sent-friend nack" ~) core)
    ==
  ::
      [%accept-friend ship=@ ~]
    ?+    -.sign  ~|(bad-accept-friend-sign/sign !!)
        %poke-ack
      ?~  p.sign
        ::  Poke succeeded, Verify friend is currently %sent, then set to %fren.
        ::
        =/  fren  (~(got by friends) ship)
        ?:  ?=(%sent relationship.fren)  ~|(dont-know-cant-follow/relationship.fren !!)
        =.  relationship.fren  %fren
        ::
        =.  friends  (~(put by friends) ship fren)
        ::  TODO, emit any necessary cards
        core
      ::  Poke failed
      ::
      core
    ==
  ::
  ==
  --
::
--
