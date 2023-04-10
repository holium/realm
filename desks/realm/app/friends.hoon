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
::    Block comments (think docstrings) are better than inline comments.      ::
::    (minus the "boxed in" comments, they are for this guide only).          ::
::  - Follow rune choice, file structure, and other style guidelines in       ::
::    https://www.ajlamarc.com/blog/2023-02-26-urbit-style/.                  ::
::    If another code structure could serve better, discuss with the team.    ::
::  - Don't =. the state directly.  Update it with `%=  core...`              ::
::    when emitting cards.  See below for examples.                           ::
::  - Consistency over all else.  The only thing harder to read               ::
::    than Hoon is someone else's Hoon.                                       ::
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
    =^  cards  state  abet:init:core
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
::  to the correct versioned core for handling.             (´◕o◕｀)          ::
::                                                                            ::
::  Versioned cores are of name +core-<version>                               ::
::  Put older ones further down, so that they can be ignored                  ::
::  for the probably bad code that they are.                                  ::
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
::  +init: handle on-init                                                     ::
::                                                                            ::
::    Called once, on agent's first boot.                                     ::
::    Initialize state here and any other one-time setup.                     ::
::    On a version upgrade, update as necessary.                              ::
::                                                                            ::
::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
::
++  init
  ^+  core
  ::
  =/  us
    :*  pinned=%.n
        tags=*tags
        created-at=now.bowl
        updated-at=now.bowl
        phone-number=~
        relationship=%our
        contact-info=~
    ==
  ::
  core(friends (~(put by friends) our.bowl us))
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
::  i.e. action-0, update-0, scry /~/[ver]/<...>, etc.                        ::
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
::                                                                            ::                                                                    ::
::  +poke: handle on-poke                                                     ::
::                                                                            ::
::                                                                            ::
::    General steps (2-3 are in the versioned core):                          ::
::    1.  Branch on mark; extract mark's type from vase to get the action.    ::
::    2.  Branch on action type, conventionally the head of the action.       ::
::    3.  Handle action; update state and emit effects as necessary.          ::
::        This step is handled in our versioned core.                         ::
::                                                                            ::
::    Error states:                                                           ::
::    1.  Poke is not received by the other ship (it is not running).         ::
::        It _should_ receive it when it boots up again.                      ::
::        We will not receive a response until their next boot: the frontend  ::
::        should set a timer and notify that the destination did not respond. ::
::    2.  Poke is NACKed by the other ship.  Handled in +agent.               ::
::                                                                            ::
::    Note that we should expect to receive N pokes of the same type.         ::
::    Therefore receiving a poke we've already received should be idempotent, ::
::    and not produce any state changes, here or downstream.                  ::
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
::
::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
::                                                                            ::
::  +agent: handle on-agent                                                   ::
::                                                                            ::
::    In +agent we receive responses from other agents.                       ::
::    See https://developers.urbit.org/reference/arvo/gall/gall#on-agent      ::
::    for the types of responses we can expect.                               ::
::                                                                            ::
::    General steps (2-4 are in the versioned core):                          ::
::    1.  Check version number of incoming update.                            ::
::        By our convention, this is always the head of path.  Note that      ::
::        these are text constants and not numbers, as they are in +load.     ::
::    2.  Route on request wire.  By our convention,                          ::
::        this is always path's tail.                                         ::
::    3.  Route on sign.                                                      ::
::    4.  Update state and emit effects as necessary.                         ::
::                                                                            ::
::    Error states:                                                           ::
::    1.  Negative poke-ack or watch-ack (NACK).                              ::
::        Notify the frontend that these requests were rejected.              ::
::                                                                            ::
::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
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
  ++  ver  %'0'
  ++  poke
    |=  act=friends-action-0
    ^+  core
    ?-    -.act
        %add-friend
      ::  A successful add-friend will result in a follow request
      ::  or an accept request, depending on our state.
      ::  We don't directly update state here, rather we wait for a
      ::  positive %poke-ack from the other ship.
      ::
      ::  TODO: receiving a NACK should notify the UI that the request failed.
      ::
      ::  If trying to add-friend ourselves, or issued from another ship, crash.
      ::
      ?.  =(our.bowl src.bowl)  ~|('no-foreign-add-friend' !!)
      ?:  =(our.bowl ship.act)  ~|('no-self-add-friend' !!)
      ::  Pokes to be used later
      ::
      =*  sent-friend
        :*  %pass
            /[ver]/sent-friend/(scot %p ship.act)
            %agent
            [ship.act dap.bowl]
            %poke
            friends-action-0+!>([%sent-friend ~])
        ==
      ::
      =*  accept-friend
        :*  %pass
            /[ver]/accept-friend/(scot %p ship.act)
            %agent
            [ship.act dap.bowl]
            %poke
            friends-action-0+!>([%accept-friend ~])
        ==
      ::
      ?:  (~(has by friends) ship.act)
        =/  fren  (~(got by friends) ship.act)
        ::  Already sent, do nothing.
        ::  Only know, send request.
        ::  Already received, accept request.
        ::
        ?+  relationship.fren  ~|(invalid-add-friend/relationship.fren !!)
          %sent      core
          %know      (emit sent-friend)
          %received  (emit accept-friend)
        ==
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
      ::
      %=  core
        friends  (~(put by friends) ship.act fren)
        cards    [sent-friend cards]
      ==
    ::
        %edit-friend
      ?.  =(our.bowl src.bowl)  ~|('no-foreign-edit-friend' !!)
      ?:  =(our.bowl ship.act)  ~|('no-self-edit-friend' !!)
      core
    ::
        %remove-friend
      ::  If friends, sent, or received a friend request
      ::  %remove-friend will emit a %bye-friend poke.
      ::
      ::  Unlike %add-friend, we don't wait for a response before
      ::  updating state - the ship may not exist any more.
      ::
      ::  Use for unfriending, cancelling friend request, or declining.
      ::
      ?.  =(our.bowl src.bowl)          ~|('no-foreign-remove-friend' !!)
      ?:  =(our.bowl ship.act)          ~|('no-self-remove-friend' !!)
      ?.  (~(has by friends) ship.act)  ~|('no-remove-unknown-friend' !!)
      ::
      =*  bye-friend
        :*  %pass
            /[ver]/bye-friend/(scot %p ship.act)
            %agent
            [ship.act dap.bowl]
            %poke
            friends-action-0+!>([%bye-friend ~])
        ==
      ::
      =/  fren  (~(got by friends) ship.act)
      ::  Only remove if friends or received.
      ::
      ?.  ?=(?(%sent %received %fren) relationship.fren)
        ~|(invalid-remove-friend/relationship.fren !!)
      ::
      =/  fren-upd
        :*  pinned=pinned.fren
            tags=tags.fren
            created-at=created-at.fren
            updated-at=now.bowl
            phone-number=phone-number.fren
            relationship=%know
            contact-info=contact-info.fren
        ==
      ::
      %=  core
        friends  (~(put by friends) ship.act fren-upd)
        cards    [bye-friend cards]
      ==
    ::
        %block-friend
      ?.  =(our.bowl src.bowl)  ~|('no-foreign-block-friend' !!)
      core
    ::
        %unblock-friend
      ?.  =(our.bowl src.bowl)  ~|('no-foreign-unblock-friend' !!)
      core
    ::
        %save-passport
      ?.  =(our.bowl src.bowl)  ~|('no-foreign-save-passport' !!)
      core
    ::
        %sent-friend
      ::  Receive a new friend request from another ship.
      ::
      ?:  =(our.bowl src.bowl)  ~|('no-self-sent-friend' !!)
      ::
      ?:  (~(has by friends) src.bowl)
        =/  fren  (~(got by friends) src.bowl)
        ::  Already received, do nothing.
        ::  Only know, update to received.
        ::
        ?+  relationship.fren  ~|(invalid-sent-friend/relationship.fren !!)
          %received  core
        ::
            %know
          =/  fren-upd
            :*  pinned=pinned.fren
                tags=tags.fren
                created-at=created-at.fren
                updated-at=now.bowl
                phone-number=phone-number.fren
                relationship=%received
                contact-info=contact-info.fren
            ==
          core(friends (~(put by friends) src.bowl fren-upd))
        ::
        ==
      ::  Ship not on our list, so add them as received
      ::
      =/  fren
        :*  pinned=%.n
            tags=*tags
            created-at=now.bowl
            updated-at=now.bowl
            phone-number=~
            relationship=%received
            contact-info=~
        ==
      core(friends (~(put by friends) src.bowl fren))
    ::
        %accept-friend
      ::  Receive a friend request acceptance from another ship.
      ::
      ?:  =(our.bowl src.bowl)  ~|('no-self-accept-friend' !!)
      ::
      =/  fren  (~(got by friends) src.bowl)
      ::  We should currently be in %sent to be accepted.
      ::
      ?+  relationship.fren  ~|(invalid-accept-friend/relationship.fren !!)
          %sent
        ::
        =/  fren-upd
          :*  pinned=pinned.fren
              tags=tags.fren
              created-at=created-at.fren
              updated-at=now.bowl
              phone-number=phone-number.fren
              relationship=%fren
              contact-info=contact-info.fren
          ==
        core(friends (~(put by friends) src.bowl fren-upd))
      ==
    ::
        %bye-friend
      ::  Receive an unfriend request from another ship.
      ::
      ?:  =(our.bowl src.bowl)          ~|('no-self-bye-friend' !!)
      ?.  (~(has by friends) src.bowl)  ~|('no-bye-unknown-friend' !!)
      ::
      =/  fren  (~(got by friends) src.bowl)
      ::  We should be friends, sent, or received.
      ::
      ?.  ?=(?(%sent %received %fren) relationship.fren)
        ~|(invalid-bye-friend/relationship.fren !!)
      ::
      =/  fren-upd
        :*  pinned=pinned.fren
            tags=tags.fren
            created-at=created-at.fren
            updated-at=now.bowl
            phone-number=phone-number.fren
            relationship=%know
            contact-info=contact-info.fren
        ==
      ::
      core(friends (~(put by friends) src.bowl fren-upd))
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
        ::  This checks if poke succeeded or failed.
        ::
        ?~  p.sign
          ::  Poke succeeded.  Verify that the ship is currently %know,
          ::  then update state.
          ::
          =/  fren  (~(got by friends) ship)
          ?+  relationship.fren  ~|(dont-know-cant-sent/relationship.fren !!)
              %know
            ::
            =/  fren-upd
              :*  pinned=pinned.fren
                  tags=tags.fren
                  created-at=created-at.fren
                  updated-at=now.bowl
                  phone-number=phone-number.fren
                  relationship=%sent
                  contact-info=contact-info.fren
              ==
            ::  TODO, emit any necessary cards
            core(friends (~(put by friends) ship fren-upd))
          ==
        ::  Poke failed - don't update state.
        ::  TODO, notify UI of failure.
        ::
        ((slog leaf/"sent-friend nack" ~) core)
      ::
      ==
    ::
        [%accept-friend ship=@ ~]
      ::
      ?+    -.sign  ~|(bad-accept-friend-sign/sign !!)
          %poke-ack
        ::
        ?~  p.sign
          =/  fren  (~(got by friends) ship)
          ::  We should be in %received to be accepted.
          ::
          ?+  relationship.fren  ~|(dont-know-cant-accept/relationship.fren !!)
              %received
            ::
            =/  fren-upd
              :*  pinned=pinned.fren
                  tags=tags.fren
                  created-at=created-at.fren
                  updated-at=now.bowl
                  phone-number=phone-number.fren
                  relationship=%fren
                  contact-info=contact-info.fren
              ==
            ::  TODO, emit any necessary cards
            core(friends (~(put by friends) ship fren-upd))
          ==
        ::  Poke failed
        ::
        ((slog leaf/"accept-friend nack" ~) core)
      ::
      ==
    ::
        [%bye-friend ship=@ ~]
      ?+    -.sign  ~|(bad-accept-friend-sign/sign !!)
          %poke-ack
        ?~  p.sign
          core
        ((slog leaf/"bye-friend nack" ~) core)
      ::
      ==
    ::
    ==
  --
::
::  "when they see the Realm of the Gods, they will tremble in fear
::  and they will know that I am the Lord - and they will know that I am"
::  - Github Copilot
::
:: ⠀⠀⠀⠀⠀⠀⠀⠀⣀⣤⣴⠶⠾⠟⠛⠛⠛⠿⠶⣶⣤⣀⠀⠀⠀⠀⠀⠀⠀⠀
:: ⠀⠀⠀⠀⠀⣠⣴⠿⠋⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠉⠰⠆⠀⠀⠀⠀⠀⠀
:: ⠀⠀⠀⣠⣾⠟⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
:: ⠀⠀⣴⡟⠁⠀⠀⠀⢀⣴⡾⠛⠛⠛⢷⣦⡀⠀⠀⠀⢀⣴⠿⠛⠛⠻⢷⣦⡀⠀
:: ⠀⣼⡏⠀⠀⠀⠀⠀⣾⠋⠀⠀⠀⠀⠀⠘⣿⡀⠀⢠⣿⠃⠀⠀⠀⠀⠀⠹⣷⠀
:: ⢰⡟⠀⠀⠀⠀⠀⠘⣿⠀⠀⠀⠘⠛⠀⠀⣿⠇⠀⢸⣿⠀⠀⠀⠘⠛⠀⢀⣿⣇
:: ⣾⠇⠀⠀⠀⠀⠀⠀⠹⣧⣀⠀⠀⠀⣀⣼⠟⠀⠀⠀⢻⣦⡀⠀⠀⠀⣠⣾⠟⣿
:: ⣿⠀⠀⠀⠀⠀⠀⠀⠀⠈⠛⠻⠿⠿⠛⠁⠀⠀⠀⠀⠀⠉⠛⠿⠿⠟⠋⠁⠀⣿
:: ⢿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣿
:: ⠸⣧⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣠⣤⣤⣤⣤⣤⣤⣤⣄⡀⠀⠀⠀⠀⣸⡏
:: ⠀⢻⣆⠀⠀⠀⠀⠀⠀⠀⠀⠀⢰⡿⠉⠁⠀⠀⠀⠀⠀⠈⠉⢿⡆⠀⠀⣰⡿⠀
:: ⠀⠀⢻⣦⡀⠀⠀⠀⠀⠀⠀⠀⠘⣿⣄⣀⣀⣀⣀⣀⣀⣀⣠⣾⠃⠀⣰⡿⠁⠀
:: ⠀⠀⠀⠙⢿⣄⡀⠀⠀⠀⠀⠀⠀⠀⠉⠉⠉⠉⠉⠉⠉⠉⠉⠀⣠⡾⠋⠀⠀⠀
:: ⠀⠀⠀⠀⠀⠙⠿⣦⣄⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣠⣴⡿⠋⠀⠀⠀⠀⠀
:: ⠀⠀⠀⠀⠀⠀⠀⠀⠉⠛⠿⠶⣶⣤⣤⣤⣤⣴⡶⠾⠛⠋⠁⠀⠀⠀⠀⠀⠀⠀
::
--