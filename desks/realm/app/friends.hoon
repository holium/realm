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
::  - List the potential "unsynced" states / potential bugs in a comment      ::
::    at the top of the agent.  These can then be triaged.                    ::
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
::  TODO: consider rolling a lot of this boilerplate into an
::  agent transformer.  The transformer could track incoming
::  and outgoing to be logged somewhere.
::  It would shuttle pokes / scries / etc to the correct
::  versioned core.
::
::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
::
:: Potential bugs list (04/10/2023):
:: - If I remove a friend but their ship is down, then they won't for sure know
::   about it.  Urbit should "cover" this with retries.  Too bad!
::
:: Other ideas:
:: - Can split "friends" into "friend-meta" and "friend-data",
::   with separate updated time maps.  This way we would be retrieving 
::   less duplicate information on each boot.
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
+$  state-2  [%2 =friends =friend-times =friend-statuses]
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
    (on-load:def vase)
    :: =^  cards  state
    ::   abet:(load:core vase)
    :: [cards this]
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
    =^  cards  state  abet:(watch:core path)
    [cards this]
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
::  Only +watch, +poke, and +peek use the versioned cores.                    ::
::  This is because they interface with the frontend.                         ::
::  Ship-to-ship (push / pull) have no concept of versioning.                 ::
::                                                                            ::
::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
::
|_  [=bowl:gall cards=(list card)]
+*  core  .
    latest  %'0'
::
++  abet  [(flop cards) state]
++  emit  |=(=card core(cards [card cards]))
++  emil  |=(new-cards=(list card) core(cards (welp new-cards cards)))
::
::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
::                                                                            ::
::  LIBRARY FUNCTIONS
::    With mop maximalism, we still want to be able to get values via
::    ship only rather than ship + time.  So make necessary library functions
::    to do so - and potentially others.
::                                                                            ::
::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
::
++  got-friend
  |=  =ship
  ^-  friend
  (got:fon friends [ship (~(got by friend-times) ship)])
::  +put-friend: atomically replaces friend from previous timestamp
::  with friend at current timestamp.  Returns friend list / friend times
::  for updating state.
::
++  put-friend
  |=  [=ship =friend]
  :: ^-  [friends friend-times]
  ?:  (~(has by friend-times) ship)
    ::  Already have, need to delete and reinsert from ordered map.
    ::
    =*  wiped  (del:fon friends [ship (~(got by friend-times) ship)])
    ::
    :-  %:  put:fon
            +.wiped
            [ship updated-at.friend]
            friend
        ==
        (~(put by friend-times) ship updated-at.friend)
  ::  No record, just insert new ones.
  ::
  :-  (put:fon friends [ship updated-at.friend] friend)
      (~(put by friend-times) ship updated-at.friend)
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
    :*  version=latest
        pinned=%.n
        tags=*tags
        created-at=now.bowl
        updated-at=now.bowl
        nickname=~
        phone-number=~
        relationship=%our
        contact-info=~
    ==
  ::
  =/  data  (put-friend our.bowl us)
  ::
  %=  core
    friends          -.data
    friend-times     +.data
    friend-statuses  (~(put by friend-statuses) our.bowl %offline)
  ==
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
  =/  old  !<(state-2 vase)
  core(state old)
  :: ::
  :: core(state old)
  :: |-
  :: ?-    -.old
  ::     %0
  ::   %=  $
  ::       old   :*  %1
  ::                 %.y
  ::                 is-public.old
  ::                 ^-  friends-1
  ::                 %-  malt
  ::                 %+  turn  ~(tap by friends.old)
  ::                 |=  [=ship fren=friend-0]
  ::                 :-  ship
  ::                 :*  pinned.fren
  ::                     tags.fren
  ::                     status.fren
  ::                     ~
  ::   ==        ==  ==
  ::  TODO: handle state migration to ordered map
    ::   %1
    :: %=  $
    ::     old   :*  %2
    ::               ^-  ^friends
    ::               %-  malt
    ::               %+  turn  ~(tap by friends.old)
    ::               |=  [=ship fren=friend-1]
    ::               :-  ship
    ::               ^-  friend
    ::               :*  pinned.fren
    ::                   tags.fren
    ::                   now.bowl
    ::                   now.bowl
    ::                   ~
    ::                   ?-  status.fren
    ::                     %fren       %fren
    ::                     %following  %sent
    ::                     %follower   %received
    ::                     %contact    %know
    ::                     %our        %our
    ::                   ==
    ::                   %offline
    ::                   ~
    :: ==        ==  ==
    ::   %2
    :: core(state old)
  :: ==
::
::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
::                                                                            ::
::  +agent: handle on-agent                                                   ::
::                                                                            ::
::    In +agent we receive responses from other agents.                       ::
::    See https://developers.urbit.org/reference/arvo/gall/gall#on-agent      ::
::    for the types of responses we can expect.                               ::
::
::    Note that we are always subbed to their current version.
::    When they upgrade, we will be kicked from current subs (minus version).
::    We will re-sub to the paths we want.
::    
::    When we upgrade first, we will leave old sub paths and join new ones.   ::
::                                                                            ::
::    1.  Route on request wire and then route on sign.                       ::
::    3.  Update state and emit effects as necessary.                         ::
::                                                                            ::
::    Error states:                                                           ::
::    1.  Negative poke-ack or watch-ack (NACK).                              ::
::        Notify the frontend that these requests were rejected.              ::
::    2.  Recieve a %fact that we don't understand.
::        They are on an incompatible version, ignore for now.                ::
::                                                                            ::
::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
::
++  agent
  |=  [path=(pole knot) =sign:agent:gall]
  ^+  core
  =*  dock  [src.bowl dap.bowl]
  ::
  ?+    path  ~|(bad-agent-wire/path !!)
    ::  Check poke-acks first.
    ::
      [%sent-friend ~]
    ::
    ?+    -.sign  ~|(bad-sent-friend-sign/sign !!)
        %poke-ack
      ::  This checks if poke succeeded or failed.
      ::
      ?~  p.sign
        ::  Poke succeeded.  Verify that the ship is currently %know,
        ::  then update state.
        ::
        =/  fren  (got-friend src.bowl)
        ?+  relationship.fren  ~|(dont-know-cant-sent/relationship.fren !!)
            %know
          ::
          =/  fren-upd
            :*  version=version.fren
                pinned=pinned.fren
                tags=tags.fren
                created-at=created-at.fren
                updated-at=now.bowl
                nickname=nickname.fren
                phone-number=phone-number.fren
                relationship=%sent
                contact-info=contact-info.fren
            ==
          ::  TODO, emit any necessary cards
          =/  data  (put-friend src.bowl fren-upd)
          core(friends -.data, friend-times +.data)
        ==
      ::  Poke failed - don't update state.
      ::  TODO, notify UI of failure.
      ::
      ((slog leaf/"sent-friend nack" ~) core)
    ::
    ==
  ::
      [%accept-friend ~]
    ::
    ?+    -.sign  ~|(bad-accept-friend-sign/sign !!)
        %poke-ack
      ::
      ?~  p.sign
        ::  We should be in %received to be accepted.
        ::
        =/  fren  (got-friend src.bowl)
        ?+  relationship.fren  ~|(dont-know-cant-accept/relationship.fren !!)
            %received
          ::
          =/  fren-upd
            :*  version=version.fren
                pinned=pinned.fren
                tags=tags.fren
                created-at=created-at.fren
                updated-at=now.bowl
                nickname=nickname.fren
                phone-number=phone-number.fren
                relationship=%fren
                contact-info=contact-info.fren
            ==
          ::  TODO, emit any necessary cards
          =/  data  (put-friend src.bowl fren-upd)
          core(friends -.data, friend-times +.data)
        ==
      ::  Poke failed TODO, notify UI of failure.
      ::
      ((slog leaf/"accept-friend nack" ~) core)
    ::
    ==
  ::
      [%bye-friend ~]
    ::
    ?+    -.sign  ~|(bad-accept-friend-sign/sign !!)
        %poke-ack
      ::
      ?~  p.sign
        core
      ((slog leaf/"bye-friend nack" ~) core)
    ::
    ==
  ::  Check subscription paths next.  Can be %fact, %watch-ack, or %kick.
  ::
      [%status ~]
    ::
    ?+    -.sign  ~|(bad-status-sign/sign !!)
      ::  Always just resubscribe on kick.
      ::
        %kick
      core(cards [[%pass /status %agent dock %watch /status] cards])
    ::
        %watch-ack
      ?~  p.sign
        core
      ((slog leaf/"watch-status nack" ~) core)
    ::
        %fact
      ::
      ?+    p.cage.sign  !!:: (on-agent:def `wire`path sign)
          %friends-pull
        =/  act   !<(friends-pull q.cage.sign)
        ?.  ?=(%status -.act)  ~|(bad-friends-pull-act/act !!)
        =/  curr-status  (~(got by friend-statuses) src.bowl)
        ::
        ?:  =(curr-status status.act)  core
        ::  TODO emit any necessary cards.
        ::
        core(friend-statuses (~(put by friend-statuses) src.bowl status.act))
      ::
      ==
    ::
    ==
  ::
        [%contact-info ~]
    ::
    ?+    -.sign  ~|(bad-contact-info-sign/sign !!)
      ::  Always just resubscribe on kick.
      ::
        %kick
      core(cards [[%pass /contact-info %agent dock %watch /contact-info] cards])
    ::
        %watch-ack
      ?~  p.sign
        core
      ((slog leaf/"watch-contact-info nack" ~) core)
    ::
        %fact
      ::
      ?+    p.cage.sign  !!  ::(on-agent:def `wire`path sign)  cant find def
          %friends-pull
        =/  act   !<(friends-pull q.cage.sign)
        ?.  ?=(%contact-info -.act)  ~|(bad-friends-pull-act/act !!)
        =/  fren  (got-friend src.bowl)
        ::
        ?:  =(contact-info.fren contact-info.act)  core
        ::
        =/  fren-upd
          :*  version=version.fren
              pinned=pinned.fren
              tags=tags.fren
              created-at=created-at.fren
              updated-at=now.bowl
              nickname=nickname.fren
              phone-number=phone-number.fren
              relationship=relationship.fren
              ::
              contact-info=contact-info.act
              ::
          ==
        ::  TODO emit any necessary cards.
        ::
        =/  data  (put-friend src.bowl fren-upd)
        core(friends -.data, friend-times +.data)
      ::
      ==
    ::
    ==
  ::
      [%version ~]
    ::
    ?+    -.sign  ~|(bad-watch-version-sign/sign !!)
      ::  Always just resubscribe on kick.
      ::
        %kick
      core(cards [[%pass /version %agent dock %watch /version] cards])
    ::
        %watch-ack
      ?~  p.sign
        core
      ((slog leaf/"watch-version nack" ~) core)
    ::
        %fact
      ::
      ?+    p.cage.sign  !!  ::(on-agent:def `wire`path sign)  cant find def
          %realm-pull
        =/  act   !<(realm-pull q.cage.sign)
        =/  fren  (got-friend src.bowl)
        ::
        ?:  =(version.fren version.act)  core
        ::
        =/  fren-upd
          :*  version=version.act
              ::
              pinned=pinned.fren
              tags=tags.fren
              created-at=created-at.fren
              updated-at=now.bowl
              nickname=nickname.fren
              phone-number=phone-number.fren
              relationship=relationship.fren
              contact-info=contact-info.fren
          ==
        ::  Here's where we issue subs to the other paths.  Can make changes
        ::  as necessary depending on the version.
        ::
        =/  data  (put-friend src.bowl fren-upd)
        =/  subs  :~  [%pass /status %agent dock %watch /status]
                      [%pass /contact-info %agent dock %watch /contact-info]
                  ==
        ::
        %=  core
          friends       -.data
          friend-times  +.data
          cards         (welp subs cards)
        ==
      ::
      ==
    ::
    ==
  ::
  ==
::
::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
::                                                                            ::                                                                    ::
::  +poke: handle on-poke                                                     ::
::                                                                            ::
::                                                                            ::
::    General steps:                                                          ::
::    1.  Branch on mark; extract mark's type from vase to get the action.    ::
::    2.  Branch on action type, conventionally the head of the action.       ::
::    3.  Handle action; update state and emit effects as necessary.          ::

::    Note, this arm handles both `action` and `push` pokes.                  ::
::    `action` is sent by the frontend and has a version.                     ::
::    `push` is sent by another ship and has no version, it is handled here.  ::
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
  ::  First, check for version upgrade.
  ::
      %realm-action
    =/  act  !<(realm-action vase)
    ::
    ::  TODO, upgrade to current.  Leave _all_ subscriptions and kick everyone.
    ::  Start subbing for everyone's version again.
    ::  Version %facts are our cue to reissue our other subscriptions.
    ::
    ~|('upgrade-not-supported' !!)
  ::  Then, check for versioned pokes.
  ::
      %friends-action-0
    (poke:core-0 !<(friends-action-0 vase))
  ::  Now check for pushes.
  ::
      %friends-push
    =/  act  !<(friends-push vase)
    =*  dock  [src.bowl dap.bowl]
    ::
    ?-    -.act
        %sent-friend
      ::  Receive a new friend request from another ship.
      ::
      ?:  =(our.bowl src.bowl)  ~|('no-self-sent-friend' !!)
      ::
      ?:  (~(has by friend-times) src.bowl)
        ::  Already received, do nothing.
        ::  Only know, update to received.
        ::
        =/  fren  (got-friend src.bowl)
        ?+  relationship.fren  ~|(invalid-sent-friend/relationship.fren !!)
          %received  core
        ::
            %know
          =/  fren-upd
            :*  version=version.fren
                pinned=pinned.fren
                tags=tags.fren
                created-at=created-at.fren
                updated-at=now.bowl
                nickname=nickname.fren
                phone-number=phone-number.fren
                relationship=%received
                contact-info=contact-info.fren
            ==
          ::
          =/  data  (put-friend src.bowl fren-upd)
          core(friends -.data, friend-times +.data)
        ::
        ==
      ::  Ship not on our list, so add them as received
      ::  and start watching their version.
      ::
      =*  watch-version
        :*  %pass  /version  %agent
            dock  %watch  /version
        ==
      ::
      =/  fren
        :*  version=%unset
            pinned=%.n
            tags=*tags
            created-at=now.bowl
            updated-at=now.bowl
            nickname=~
            phone-number=~
            relationship=%received
            contact-info=~
        ==
      ::
      =/  data  (put-friend src.bowl fren)
      ::
      %=  core
        friends          -.data
        friend-times     +.data
        friend-statuses  (~(put by friend-statuses) src.bowl %offline)
        cards            [watch-version cards]
      ==
    ::
        %accept-friend
      ::  Receive a friend request acceptance from another ship.
      ::
      ?:  =(our.bowl src.bowl)  ~|('no-self-accept-friend' !!)
      ::  We should currently be in %sent to be accepted.
      ::
      =/  fren  (got-friend src.bowl)
      ?+  relationship.fren  ~|(invalid-accept-friend/relationship.fren !!)
          %sent
        ::
        =/  fren-upd
          :*  version=version.fren
              pinned=pinned.fren
              tags=tags.fren
              created-at=created-at.fren
              updated-at=now.bowl
              nickname=nickname.fren
              phone-number=phone-number.fren
              relationship=%fren
              contact-info=contact-info.fren
          ==
        ::
        =/  data  (put-friend src.bowl fren-upd)
        core(friends -.data, friend-times +.data)
      ==
    ::
        %bye-friend
      ::  Receive an unfriend request from another ship.
      ::
      ?:  =(our.bowl src.bowl)               ~|('no-self-bye-friend' !!)
      ?.  (~(has by friend-times) src.bowl)  ~|('no-bye-unknown-friend' !!)
      ::
      =/  fren  (got-friend src.bowl)
      ::  We should be friends, sent, or received.
      ::  We can also be %know, which means we were probably blocked.
      ::
      ?.  ?=(?(%sent %received %fren) relationship.fren)
        ?:  ?=(%know relationship.fren)
          core
        ~|(invalid-bye-friend/relationship.fren !!)
      ::
      =/  fren-upd
        :*  version=version.fren
            pinned=pinned.fren
            tags=tags.fren
            created-at=created-at.fren
            updated-at=now.bowl
            nickname=nickname.fren
            phone-number=phone-number.fren
            relationship=%know
            contact-info=contact-info.fren
        ==
      ::
      =/  data  (put-friend src.bowl fren-upd)
      core(friends -.data, friend-times +.data)
    ::
    ==
  ::
  ==
::
::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
::                                                                            ::
::  +watch: handle on-watch                                                   ::
::                                                                            ::
::    In +watch we receive subscription requests from other agents or
::    the frontend.  Frontend requests will have version at the head
::    and will be handled in the nested core.
::    Requests from other agents will not have a version and are handled
::    here directly.
::   
::
::    General steps (2-4 are in the versioned core):                          ::
::    1.  Check head of path, branching on `pull` type or version number.     ::
::        Note that versions are strings, i.e. %'1' instead of %1.            ::
::    2.  Route on request wire.                                              ::
::    3.  Crash if invalid path or permissions.                               ::
::    4.  Update state and emit effects as necessary.                         ::
::        For initial updates these are on the `~` path.                      ::
::                                                                            ::
::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
::
++  watch
  |=  path=(pole knot)
  ^+  core
  =*  dock  [src.bowl dap.bowl]
  ::
  =*  us    (got-friend our.bowl)
  =*  fren  (got-friend src.bowl)
  ::
  ?+    -.path  ~|(bad-watch-path/path !!)
  ::  First check for version requests.
  ::
      %version
    %-  emit
    [%give %fact ~ %realm-pull !>(`realm-pull`[%version version.us])]
  ::  Then, check for versions we support to the frontend.
  ::
      %'0'
    (watch:core-0 +.path)
  ::  Now check for pull paths.
  ::
  ::  We choose to be resilient here.  If a subbing ship is still
  ::  unknown, add them as know and start watching back.
  ::
      %status
    ::
    =/  curr-status  (~(got by friend-statuses) our.bowl)
    =/  pull-status
      :*  %give  %fact  ~  %friends-pull
          !>(`friends-pull`[%status curr-status])
      ==
    ::
    =*  watch-version
      :*  %pass  /version  %agent
          dock  %watch  /version
      ==
    ::
    ?:  (~(has by friend-times) src.bowl)
      (emit pull-status)
    ::  Add friend as %know
    ::
    =/  fren
      :*  version=%unset
          pinned=%.n
          tags=*tags
          created-at=now.bowl
          updated-at=now.bowl
          nickname=~
          phone-number=~
          relationship=%know
          contact-info=~
      ==
    ::  Send them our status, and start watching their version.
    ::
    =/  data  (put-friend src.bowl fren)
    ::
    %=  core
      friends          -.data
      friend-times     +.data
      friend-statuses  (~(put by friend-statuses) src.bowl %offline)
      cards            [pull-status watch-version cards]
    ==
  ::
      %contact-info
    ::
    %-  emit
    [%give %fact ~ %friends-pull !>(`friends-pull`[%contact-info contact-info.us])]
  ::
  ==
::
++  core-0
  |%
  ++  ver  %'0'
  ::
  ++  action-type        friends-action-0
  :: ++  action-mark        %friends-action-0
  ::
  :: ++  update-type        friends-update-0
  :: ++  update-mark        %friends-update-0
  ::
  ++  poke
    |=  act=action-type
    ^+  core
    =*  dock  [ship.act dap.bowl]
    ::  Deferred pokes that may be used below.
    ::
    =*  bye-friend
      :*  %pass
          /bye-friend
          %agent  dock  %poke
          [%friends-push !>(`friends-push`[%bye-friend ~])]
      ==
    ::
    =*  sent-friend
      :*  %pass
          /sent-friend
          %agent  dock  %poke
          [%friends-push !>(`friends-push`[%sent-friend ~])]
      ==
    ::
    =*  accept-friend
      :*  %pass
          /accept-friend
          %agent  dock  %poke
          [%friends-push !>(`friends-push`[%accept-friend ~])]
      ==
    ::
    ?-    -.act
        %add-friend
      ::  A successful add-friend will result in a follow request
      ::  or an accept request, depending on our state.
      ::  We don't directly update state here, rather we wait for a
      ::  positive %poke-ack from the other ship.
      ::
      ::  If trying to add-friend ourselves, or issued from another ship, crash.
      ::
      ?.  =(our.bowl src.bowl)  ~|('no-foreign-add-friend' !!)
      ?:  =(our.bowl ship.act)  ~|('no-self-add-friend' !!)
      ::
      ?:  (~(has by friend-times) ship.act)
        ::  Already sent, do nothing.
        ::  Only know, send request.
        ::  Already received, accept request.
        ::
        =/  fren  (got-friend ship.act)
        ?+  relationship.fren  ~|(invalid-add-friend/relationship.fren !!)
          %sent      core
          %know      (emit sent-friend)
          %received  (emit accept-friend)
        ==
      ::  ship is not in our friends list, so add them as know
      ::  and send a friend request.  Start watching for updates.
      ::
      =*  watch-version
        :*  %pass  /version  %agent
            dock  %watch  /version
        ==
      ::
      =/  new-fren
        :*  version=%unset
            pinned=%.n
            tags=*tags
            created-at=now.bowl
            updated-at=now.bowl
            nickname=~
            phone-number=~
            relationship=%know
            contact-info=~
        ==
      ::
      =/  data  (put-friend ship.act new-fren)
      ::
      %=  core
        friends          -.data
        friend-times     +.data
        friend-statuses  (~(put by friend-statuses) ship.act %offline)
        cards            [sent-friend watch-version cards]
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
      ?.  =(our.bowl src.bowl)               ~|('no-foreign-remove-friend' !!)
      ?:  =(our.bowl ship.act)               ~|('no-self-remove-friend' !!)
      ?.  (~(has by friend-times) ship.act)  ~|('no-remove-unknown-friend' !!)
      ::
      =/  fren  (got-friend ship.act)
      ::  Only remove if friends or received.
      ::
      ?.  ?=(?(%sent %received %fren) relationship.fren)
        ~|(invalid-remove-friend/relationship.fren !!)
      ::
      =/  fren-upd
        :*  version=version.fren
            pinned=pinned.fren
            tags=tags.fren
            created-at=created-at.fren
            updated-at=now.bowl
            nickname=nickname.fren
            phone-number=phone-number.fren
            relationship=%know
            contact-info=contact-info.fren
        ==
      ::
      =/  data  (put-friend src.bowl fren-upd)
      %=  core
        friends       -.data
        friend-times  +.data
        cards         [bye-friend cards]
      ==
    ::
        %block-friend
      ::  Emits a %bye-friend poke to unfriend the ship.
      ::  The other ship doesn't know it's been blocked.
      ::
      ?.  =(our.bowl src.bowl)  ~|('no-foreign-block-friend' !!)
      ?:  =(our.bowl ship.act)  ~|('no-self-block-friend' !!)
      ::
      =/  fren  (got-friend ship.act)
      ::
      ?:  ?=(%blocked relationship.fren)
        ~|(invalid-block-friend/relationship.fren !!)
      ::
      =/  fren-upd
        :*  version=version.fren
            pinned=pinned.fren
            tags=tags.fren
            created-at=created-at.fren
            updated-at=now.bowl
            nickname=nickname.fren
            phone-number=phone-number.fren
            relationship=%blocked
            contact-info=contact-info.fren
        ==
      ::
      =/  data  (put-friend ship.act fren-upd)
      %=  core
        friends       -.data
        friend-times  +.data
        cards         [bye-friend cards]
      ==
    ::
        %unblock-friend
      ::  For internal bookkeeping only.
      ::
      ?.  =(our.bowl src.bowl)  ~|('no-foreign-unblock-friend' !!)
      ?:  =(our.bowl ship.act)  ~|('no-self-unblock-friend' !!)
      ::
      =/  fren  (got-friend ship.act)
      ::
      ?+    relationship.fren  ~|(invalid-unblock-friend/relationship.fren !!)
          %blocked
      ::
        =/  fren-upd
          :*  version=version.fren
              pinned=pinned.fren
              tags=tags.fren
              created-at=created-at.fren
              updated-at=now.bowl
              nickname=nickname.fren
              phone-number=phone-number.fren
              relationship=%know
              contact-info=contact-info.fren
          ==
        ::
        =/  data  (put-friend ship.act fren-upd)
        core(friends -.data, friend-times +.data)
      ==
    ::
        %set-contact-info
      ?.  =(our.bowl src.bowl)  ~|('no-foreign-set-contact-info' !!)
      =/  us  (got-friend our.bowl)
      ::
      =/  us-upd
        :*  version=version.us
            pinned=pinned.us
            tags=tags.us
            created-at=created-at.us
            updated-at=now.bowl
            nickname=nickname.us
            phone-number=phone-number.us
            relationship=%our
            ::
            contact-info=contact-info.act
            ::
        ==
      ::
      =*  pull-contact-info
        :*  %give  %fact  ~[/contact-info]  %friends-pull
            !>(`friends-pull`[%contact-info contact-info.act])
        ==
      ::
      =/  data  (put-friend our.bowl us-upd)
      ::
      %=  core
        friends       -.data
        friend-times  +.data
        cards         [pull-contact-info cards]
      ==
    ::
        %set-status
      ?.  =(our.bowl src.bowl)  ~|('no-foreign-set-status' !!)
      =/  curr-status  (~(got by friend-statuses) our.bowl)
      ?:  =(status.act curr-status)  core
      ::
      =*  pull-status
        :*  %give  %fact  ~[/status]  %friends-pull
            !>(`friends-pull`[%status status.act])
        ==
      ::
      %=  core
        friend-statuses  (~(put by friend-statuses) our.bowl status.act)
        cards            [pull-status cards]
      ==
    ::
    ==
  ::
  ++  watch
    |=  path=(pole knot)
    ^+  core
    !!
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