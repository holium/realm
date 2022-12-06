::
::  %friends [realm]:
::
::  friend list management
::
::
/-  store=friends, membership-store=membership
/+  dbug, default-agent, lib=friends
::
|%
+$  card     card:agent:gall
+$  f-act    action:store
+$  f-react  reaction:store
::
+$  versioned-state  $%(state-0)
+$  state-0  [%0 is-public=? =friends:store]
--
::
=|  state-0
=*  state  -
%-  agent:dbug
^-  agent:gall
=<
  |_  =bowl:gall
  +*  this  .
      def   ~(. (default-agent this %.n) bowl)
      core   ~(. +> bowl ~)
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
    =^  cards  state  abet:(load:core ole)
    [cards this]
  ::
  ++  on-poke
    |=  cag=cage
    =^  cards  state  abet:(poke:core cag)
    [cards this]
  ::
  ++  on-watch
    |=  pat=path
    ^-  (quip card _this)
    =^  cards  state  abet:(peer:core pat)
    [cards this]
  ::  +on-peek: w/ ~/scry/friends/all.json, ./ships.json
  ::
  ++  on-peek
    |=  pat=path
    ^-  (unit (unit cage))
    (peek:core pat)
  ::
  ++  on-arvo   on-arvo:def
  ++  on-fail   on-fail:def
  ++  on-agent  on-agent:def
  ++  on-leave  on-leave:def
  --
|_  [bol=bowl:gall dek=(list card)]
+*  core  .
::
++  emit  |=(=card core(dek [card dek]))
++  emil  |=(lac=(list card) core(dek (welp lac dek)))
++  abet  ^-((quip card _state) [(flop dek) state])
::
++  poke
  |=  [mar=mark vaz=vase]
  ^+  core
  ?>  ?=(%friends-action mar)
  (action !<(action:store vaz))
::
++  peer
  |=  pat=path
  ^+  core
  ?>  &(?=([%all ~] pat) =(our.bol src.bol))
  =-  (emit %give %fact [/all]~ -)
  friend-reaction+!>(`f-react`friends+friends.state)
::
++  peek
  |=  pat=path
  ^-  (unit (unit cage))
  ?+    pat  !!
      [%x %all ~]
    ?>  (team:title our.bol src.bol)
    ``noun+!>((view:enjs:lib `view:store`friends+friends.state))
  ::
      [%x %ships ~]
    ?>  (team:title our.bol src.bol)
    ``noun+!>(~(key by friends.state))
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
  ~&  >>  'nuking old %friends state'
  %-  emil:init
  %+  turn  ~(tap in ~(key by wex.bol))
  |=([w=wire s=@p t=@t] [%pass w %agent [s t] %leave ~])
::
++  init
  ^+  core
  =+  fan=friends:store
  =;  [following=fan followers=fan mutuals=fan]
    %=  core
      is-public.state  %.y
    ::
        friends
      %-  ~(uni by followers)
      (~(uni by following) mutuals)
    ==
  ::
  ::  XX: note you can cast interchangeably between a
  ::      (set (pair)) and a (map) for your purposes.
  =+  pals=/(scot %p our.bol)/pals/(scot %da now.bol)
  :+  %.  |=(p=@p [p [| ~ %following]])
      ~(run in .^((set ship) %gx (welp pals /targets/noun)))
    %.  |=(p=@p [p [| ~ %follower]])
    ~(run in .^((set ship) %gx (welp pals /leeches/noun)))
  %.  |=(p=@p [p [| ~ %fren]])
  ~(run in .^((set ship) %gx (welp pals /mutuals/noun)))
::
++  action
  |=  =action:store
  ^+  core
  ?-  -.action
    %add-friend     (add-fren +.action)
    %edit-friend    (edit-fren +.action)
    %remove-friend  (remove-fren +.action)
    %be-fren        (be-fren src.bol)
    %yes-fren       (yes-fren src.bol)
    %bye-fren       (bye-fren src.bol)
  ==
::
++  add-fren
  |=  sip=ship
  ::  checks if fren is added
  ?:  (~(has by friends.state) sip)
    ::  ole chum
    =+  ole=(~(got by friends.state) sip)
    =.  ole  ole(status %fren)
    %-  emil(friends.state (~(put by friends.state) sip ole))
    :~  =-  [%pass / %agent [sip %friends] %poke -]
        friends-action+!>([%yes-fren ~])                ::  confirms mutuality
      ::
        =-  [%give %fact [/all]~ friends-reaction+-]
        !>(`f-react`[%new-friend sip ole])
    ==
  ::  new fren
  =+  fren=`friend:store`[| ~ %following]
  %-  emil(friends.state (~(put by friends.state) sip fren))
  :~  =-  [%pass / %agent [sip %friends] %poke -]
      friends-action+!>(`f-act`[%be-fren ~])
  ::
      =-  [%give %fact [/all]~ -]
      friends-reaction+!>(`f-react`[%new-friend sip fren])
  ==
::
++  edit-fren
  |=  [sip=ship pin=? tag=friend-tags:store]
  ^+  core
  =+  ole=(~(got by friends.state) sip)
  =/  neu=friend:store  ole(pinned pin, tags tag)
  =.  friends.state  (~(put by friends.state) [sip neu])
  ::  notify watchers
  %-  emit(friends.state (~(put by friends.state) sip neu))
  [%give %fact [/all]~ friends-reaction+!>(`f-react`[%friend sip neu])]
::
++  remove-fren
  |=  sip=ship
  ^+  core
  ::  XX: this comment is not correct
  ::  ask new fren to be fren, notify watchers
  %-  emil(friends.state (~(del by friends.state) sip))
  :~  =-  [%pass / %agent [sip dap.bol] %poke -]
      friends-action+!>(`f-act`[%bye-fren ~])
    ::
      [%give %fact [/all]~ friends-reaction+!>(`f-react`[%bye-friend sip])]
  ==
::
++  yes-fren
  |=  sip=ship
  ^+  core
  ::  cant yes ourselves
  ?<  =(our.bol src.bol)
  =+  ole=(~(got by friends.state) sip)
  =/  neu=friend:store  ole(status %fren)
  %-  emit(friends.state (~(put by friends.state) sip neu))
  [%give %fact [/all]~ friends-reaction+!>(`f-react`[%friend sip neu])]
::
++  bye-fren
  |=  sip=ship
  ^+  core
  ::  cant bye yourself
  ?<  =(our.bol src.bol)
  ::  XX: this comment is strange
  ::  checks if is not fren is added
  ?.  (~(has by friends.state) sip)  core
  =+  ole=(~(got by friends.state) sip)
  =/  neu=friend:store  ole(status %following)
  ::  notify watchers
  %-  emit(friends.state (~(put by friends.state) [sip neu]))
  [%give %fact [/all]~ friends-reaction+!>([%friend sip neu])]
::
++  be-fren
  |=  sip=ship
  ^+  core
  ::  we can't be-fren ourselves
  ?<  =(our.bol src.bol)
  =+  added=(~(has by friends.state) sip)  
  :: checks if is fren is added
  ?.  added
    ::  if we don't already know you, add a follower
    =.  friends.state
      (~(put by friends.state) sip [| ~ %follower])
    ::  and notify watchers
    %-  emit
    =-  [%give %fact [/all]~ -]
    friends-reaction+!>(`f-react`[%friend sip [| ~ %follower]])
  :: if we're mutuals, confirm it
  =.  friends.state  (~(put by friends.state) sip [| ~ %fren])
  %-  emit
  [%pass / %agent [sip %friends] %poke friends-action+!>(`f-act`[%yes-fren ~])]
--