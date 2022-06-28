/-  *group, group-store, act
/+  store=group-store, default-agent, resource, action-agent
|%
+$  card  card:agent:gall
+$  versioned-state
    $%  state-0
    ==
+$  state-0  [%0 store=json]
--
=|  state-0
=*  state  -
%-  action-agent:act
^-  agent:gall
=<
  |_  =bowl:gall
  +*  this  .
      def   ~(. (default-agent this %.n) bowl)
  ::
  ++  on-init  :: on-init:def
      ^-  (quip card:agent:gall agent:gall)
      `this(store [%s 'test'])
  ::
  ++  on-save  ::on-save:def
      ^-  vase
      !>(state)
  ::
  ++  on-load  ::on-load:def
      |=  old-state=vase
      ^-  (quip card:agent:gall agent:gall)
      =/  old  !<(versioned-state old-state)
      ?-  -.old
        %0  `this(state old)
      ==
  ::
  ++  on-poke  on-poke:def
  ::
  ++  on-leave  on-leave:def
  ::
  ++  on-watch  on-watch:def
  ::
  ++  on-peek  on-peek:def
  ::
  ++  on-agent  on-agent:def
  ::
  ++  on-arvo  on-arvo:def
  ::
  ++  on-fail   on-fail:def
  --
|_  =bowl:gall
::  $initialize: initialize this agent; either via on-init or thru an action
::
++  initialize
  ^-  (quip card _state)

  :_  state

  ~[]
--