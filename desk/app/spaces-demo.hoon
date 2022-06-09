:: ***********************************************************
::
::  @author  : ~lodlev-migdev
::  @purpose :
::    Realm spaces agent demo app
::
:: ***********************************************************
/+  default-agent, dbug
|%
+$  card  card:agent:gall
+$  versioned-state
    $%  state-0
    ==
+$  state-0  [%0 store=(map @t json)]
--
%-  agent:dbug
=|  state-0
=*  state  -
^-  agent:gall
|_  =bowl:gall
+*  this  .
    def   ~(. (default-agent this %.n) bowl)
++  on-init  on-init:def
::
++  on-save
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