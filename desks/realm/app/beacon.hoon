::
/-  store=beacon :: ha=hark
/+  default-agent, verb, dbug
::
=>
  |%
  +$  card  card:agent:gall
  +$  versioned-state
      $%  state-0
      ==
  +$  state-0
    $:  %0
    ==
  --
=|  state-0
=*  state  -
=<
  %+  verb  &
  %-  agent:dbug
  |_  =bowl:gall
  +*  this    .
      def     ~(. (default-agent this %|) bowl)
      core    ~(. +> [bowl ~])
  ::
  ++  on-init
    ^-  (quip card _this)
    `this
  ::
  ++  on-save
    ^-  vase
    !>(state)
  ::
  ++  on-load
    |=  =vase
    ^-  (quip card _this)
    =/  old=(unit state-0)
      (mole |.(!<(state-0 vase)))
    ?^  old
      `this(state u.old)
    ~&  >>  'nuking old %beacon state' ::  temporarily doing this for making development easier
    =^  cards  this  on-init
    :_  this
    =-  (welp - cards)
    %+  turn  ~(tap in ~(key by wex.bowl))
    |=  [=wire =ship =term]
    ^-  card
    [%pass wire %agent [ship term] %leave ~]
  ::
  ++  on-poke
    |=  [=mark =vase]
    ^-  (quip card _this)
    =^  cards  state
    ?+  mark                    (on-poke:def mark vase)
      %beacon-action            (action:beacon:core !<(action:store vase))
    ==
    [cards this]
  ::
  ++  on-watch
    |=  =path
    ^-  (quip card _this)
    =/  cards=(list card)
    ?+  path                  (on-watch:def path)
      [%updates ~]
        ~&  >>  "{<dap.bowl>}: [on-watch]. {<src.bowl>} subscribing to updates..."
        ?>  (is-host:core src.bowl)
        [%give %fact [/updates ~] beacon-reaction+!>([%initial ~])]~
      ::
    ==
    [cards this]
  ::
  ++  on-peek
    |=  =path
    ^-  (unit (unit cage))
    ?+    path  (on-peek:def path)
      ::
      [%x %latest ~]     ::  ~/scry/beacon/latest
        :: determine active provider by checking active subscriptions.
        ::  first match (should only be one) will be used.
        :: =/  prov=@tas  get-active-provider:helpers:core
        =/  prov=@tas     %hark
        ::
        ?+  prov          (on-peek:def path)
          :: scry new hark, transform notifications into beacon friendly format
          :: %hark-store     (transform-hark-store:helpers:core (hark-store:scry:core /scry-path))
          %hark           latest:hark:scry:beacon:core
          :: %beacon         (beacon:scry:core /scry-path)
        ==
    ==
  ::
  ++  on-agent
    |=  [=wire =sign:agent:gall]
    ^-  (quip card _this)
    =/  wirepath  `path`wire
    ?+    wire  (on-agent:def wire sign)
      [%hark-store ~]
        ?+    -.sign  (on-agent:def wire sign)
          %watch-ack
            ?~  p.sign  %-  (slog leaf+"{<dap.bowl>}: subscribed to hark-store" ~)  `this
            ~&  >>>  "{<dap.bowl>}: hark-store subscription failed"
            `this
      ::
          %kick
            ~&  >  "{<dap.bowl>}: hark-store kicked us, resubscribing..."
            :_  this
            :~  [%pass /hark-store %agent [our.bowl %hark-store] %watch t.wire]
            ==
      ::
          %fact  (on-agent:def wire sign)
        ==

      [%hark ~]
        ?+    -.sign  (on-agent:def wire sign)
          %watch-ack
            ?~  p.sign  %-  (slog leaf+"{<dap.bowl>}: subscribed to hark" ~)  `this
            ~&  >>>  "{<dap.bowl>}: hark subscription failed"
            `this
      ::
          %kick
            ~&  >  "{<dap.bowl>}: hark kicked us, resubscribing..."
            :_  this
            :~  [%pass /hark %agent [our.bowl %hark] %watch t.wire]
            ==
      ::
          %fact  (on-agent:def wire sign)
        ==
    ==
  ::
  ++  on-arvo   |=([wire sign-arvo] !!)
  ++  on-leave  |=(path `..on-init)
  ++  on-fail ::  |=([term tang] `..on-init)
    |=  [=term =tang]
    ^-  (quip card _this)
    %-  (slog leaf+"error in {<dap.bowl>}" >term< tang)
    `this
  :: |=([term tang] `..on-init)
--
|_  [=bowl:gall cards=(list card)]
::
++  core  .
++  beacon
  |%
  ++  action
    |=  =action:store
    ^-  (quip card _state)
    |^
    ?-  -.action
      %connect-provider           (on-connect-provider +.action)
      %seen                       (on-seen +.action)
    ==
    ::  'connect' to the underlying agent by subscribing to its updates
    ::   also 'activate' the provider so that scries use this provider when
    ::   retrieving data
    ++  on-connect-provider
      |=  [prov=@tas]
      ^-  (quip card _state)
      ?.  (~(has in supported-providers:store) prov)
        ~&  >>>  "{<dap.bowl>}: {<prov>} not supported"
        `state
      :: is there an active provider? if yes, disconnect/leave
      =/  adios=(list card)
      %-  ~(rep by wex.bowl)
      |=  [[[=wire =ship =term] [acked=? =path]] acc=(list card)]
      ?.  ?|  =(wire /hark-store)
              =(wire /hark)
              =(wire /beacon)
          ==  acc
        (snoc acc [%pass wire %agent [ship term] %leave ~])
      ::  subscribe to new provider
      :_  state
      %+  weld  adios
      ?+  prov   `(list card)`~
        %hark-store    [%pass /hark-store %agent [our.bowl %hark-store] %watch /updates]~
        %hark          [%pass /hark %agent [our.bowl %hark] %watch /ui]~
        %beacon        [%pass /beacon %agent [our.bowl %beacon] %watch /updates]~
      ==
    ::
    ++  on-seen
      |=  [id=@ud]
      %-  (slog leaf+"{<dap.bowl>}: seen called" ~)
      `state
    ::
    --
  ++  reaction
    |=  [rct=reaction:store]
    ^-  (quip card _state)
    :: `state
    |^
    ?-  -.rct
      %seen    (on-seen +.rct)
    ==
    ::
    ++  on-seen
      |=  [id=@ud]
      %-  (slog leaf+"{<dap.bowl>}: seen called" ~)
      `state
    --
  ::  interactions not yet supported
  :: ++  interaction
  ::   |=  [itc=interaction:store]
  ::   ^-  (quip card _state)
  ::   `state
  ::
  ++  scry
    |%
    ::
    ++  hark
      |%
      ::
      ++  latest
        ^-  (unit (unit cage))
        ``beacon-view+!>([%latest ~])
      --
    --
  ++  helpers
    |%
    ::
    --
  --
++  is-host
  |=  [=ship]
  =(our.bowl ship)
::
--