/-  *marshal
/+  verb, dbug, defa=default-agent
::
|%
::
+$  versioned-state  $%(state-0)
::
+$  state-0  [%0 ~]
::
::
::  boilerplate
::
+$  card  card:agent:gall
--
::
%+  verb  &
%-  agent:dbug
=|  state-0
=*  state  -
::
^-  agent:gall
::
=<
  |_  =bowl:gall
  +*  this  .
      def   ~(. (defa this %|) bowl)
      eng   ~(. +> [bowl ~])
  ++  on-init
    ^-  (quip card _this)
    ~>  %bout.[0 '%marshal +on-init']
    `this
  ::
  ++  on-save
    ^-  vase
    ~>  %bout.[0 '%marshal +on-save']
    !>(state)
  ::
  ++  on-load
    |=  vaz=vase
    ~>  %bout.[0 '%marshal +on-load']
    ^-  (quip card _this)
    =^  cards  state  abet:(load:eng vaz)
    [cards this]
  ::
  ++  on-poke
    |=  cag=cage
    ~>  %bout.[0 '%marshal +on-poke']
    ^-  (quip card _this)
    =^  cards  state  abet:(poke:eng cag)
    [cards this]
  ::
  ++  on-peek
    |=  pax=path
    ~>  %bout.[0 '%marshal +on-peek']
    ^-  (unit (unit cage))
    [~ ~]
  ::
  ++  on-agent
    |=  [wir=wire sig=sign:agent:gall]
    ~>  %bout.[0 '%marshal +on-agent']
    ^-  (quip card _this)
    =^  cards  state  abet:(dude:eng wir sig)
    [cards this]
  ::
  ++  on-arvo
    |=  [wir=wire sig=sign-arvo]
    ~>  %bout.[0 '%marshal +on-arvo']
    ^-  (quip card _this)
    `this
  ::
  ++  on-watch
    |=  pax=path
    ~>  %bout.[0 '%marshal +on-watch']
    ^-  (quip card _this)
    `this
  ::
  ++  on-fail
    ~>  %bout.[0 '%marshal +on-fail']
    on-fail:def
  ::
  ++  on-leave
    ~>  %bout.[0 '%marshal +on-init']
    on-leave:def
  --
|_  [bol=bowl:gall caz=(list card)]
+*  dat  .
++  emit  |=(c=card dat(caz [c caz]))
++  emil  |=(lc=(list card) dat(caz (welp lc caz)))
++  abet
  ^-  (quip card _state)
  [(flop caz) state]
::  +load: handle on-load
::
++  load
  |=  vaz=vase
  ^+  dat
  =/  old=(unit state-0)
    (mole |.(!<(state-0 vaz)))
  ::
  ?^  old
    dat(state u.old)
  ~&  >>  'nuking old %marshal state' ::  temporarily doing this for making development easier
  =/  leave-all
    %+  turn  ~(tap in ~(key by wex.bol))
      |=  [=wire =ship =term]
      ^-  card
      [%pass wire %agent [ship term] %leave ~]
  dat(caz (welp leave-all caz))
::  +poke: handle on-poke
::
++  poke
  |=  [mar=mark vaz=vase]
  ^+  dat
  =^  cards  state
    ?+    mar            (on-poke:def mar vaz)
        %marshal-action  
      =/  act  !<(marshal-action vaz)
      ?+    -.act  ~|(['bad-marshal-action' -.act] !!)
          %commit
        %-  (slog leaf+"{<dap.bowl>}: on-commit called. committing {<mount-point>}..." ~)
        dat(caz [[%pass /commit %arvo %c [%dirk mount-point]] caz])
      ::
      ==
    ::
    ==
  (emil cards)
::  +dude: handle on-agent
::
++  dude
  |=  [wir=wire sig=sign:agent:gall]
  ^+  dat
  =^  cards  state
    ?-    -.sign
        :: Print error if poke failed
        ::
        %poke-ack
      %-  (slog leaf+"{<dap.bowl>}: %poke-ack on wire {<wir>} => {<sig>}" ~)
      `state
        :: Print error if subscription failed
        ::
        %watch-ack
      %-  (slog leaf+"{<dap.bowl>}: %watch-ack on wire {<wir>} => {<sig>}" ~)
      `state
        :: Do nothing if unsubscribed
        ::
        %kick
      %-  (slog leaf+"{<dap.bowl>}: %kick on wire {<wir>} => {<sig>}" ~)
      `state
        :: Update remote counter when we get a subscription update
        ::
        %fact
      %-  (slog leaf+"{<dap.bowl>}: %fact on wire {<wir>} => {<sig>}" ~)
      `state
    ::
    ==
  (emil cards)
--