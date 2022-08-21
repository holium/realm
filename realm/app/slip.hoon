:: 
::  %slip
::
/-  store=slip
/+  lib=slip
/+  dbug, default-agent
/+  agentio
|%
+$  card  card:agent:gall
+$  versioned-state
    $%  state-0
    ==
+$  state-0
  $:  %0
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
++  on-save   on-save:def
++  on-load   on-load:def
++  on-leave  on-leave:def
++  on-agent  on-agent:def
++  on-arvo   on-arvo:def
++  on-fail   on-fail:def
++  on-init   on-init:def
++  on-peek   on-peek:def
++  on-watch
  |=  =path
  ^-  (quip card _this)
  ?>  =(src.bowl our.bowl)
  ?+    path
    (on-watch:def path)
      [%slip %local ~]
    `this
  ==
++  on-poke
  |=  [=mark =vase]
  ^-  (quip card _this)
  |^
    =^  cards
        state
    ::
    ?+  mark
      (on-poke:def mark vase)
      ::
      %slip-action
      %-  action:core
        !<(action:store vase)
    ==
    ::
    [cards this]
  --
--
::
|_  [=bowl:gall cards=(list card)]
::
++  core  .
++  action
  |=  [act=action:store]
  ^-  (quip card _state)
  |^
  ?-  -.act
      %slip     (slip act)
      %slop     (slop +.act)
  ==
  ::
    ++  slip
      |=  [slip=action:store]
      :: ?<  =(src.bowl our.bowl)
      ?>  (data-limit data.slip)
      ~&  >  :-  %got-slip
                  slip
      :_  state
      :~
      (give-slip slip)
      ==
    ::
    ++  slop
      |=  [to=(list ship) data=cord]
      ?>  =(src.bowl our.bowl)
      ?>  (data-limit data)
      =/  slip=action:store
        :-  %slip
        :-  our.bowl
            data
      :_  state
      (poke-slop to slip)
  --
::
:: :: utils
++  poke-slop
  |=  [to=(list ship) slip=action:store]
  %+  turn  to
    |=  =ship
    %+  poke:pass:agentio
      [ship agent:lib]
      :-  %slip-action
      !>  slip
::
++  give-slip
  |=  [slip=action:store]
  ^-  card
  [%give %fact [/slip/local]~ %slip-action !>(slip)]
++  data-limit
  |=  [data=cord]
  ^-  ?
  ::
  :: enforce arbitrary limit on data size
  :: this is pretty large because
  :: unencoded webrtc offers/answers
  :: run to ~2k characters
  ::
  :: they should really be compressed
  :: and this limit should really be
  :: smaller
  ::
  (lte (lent (trip data)) 9.999)
::
--

