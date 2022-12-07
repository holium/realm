::
/-  store=realm-beacon, hark
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
    :_  this
    :~  :: [%pass /hark-store %agent [our.bowl %hark-store] %watch /updates]
        [%pass /hark %agent [our.bowl %hark] %watch /ui]
    ==
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
      %realm-beacon-action      (action:beacon:core !<(action:store vase))
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
        ~
        :: [%give %fact [/updates ~] realm-beacon-reaction+!>([%initial ~])]~
      ::
    ==
    [cards this]
  ::
  ++  on-peek
    |=  =path
    ^-  (unit (unit cage))
    ~
    :: ?+    path  (on-peek:def path)
    ::   ::
    ::   [%x @tas %latest ~]     ::  ~/scry/beacon/hark/latest
    ::     =/  prov          `@tas`i.t.path
    ::     %-  (slog leaf+"{<dap.bowl>}: scry @ {<prov>}/latest called" ~)
    ::     :: determine active provider by checking active subscriptions.
    ::     ::  first match (should only be one) will be used.
    ::     :: =/  prov=@tas  get-active-provider:helpers:core
    ::     :: =/  prov=@tas     %hark
    ::     ::
    ::     ?+  prov          (on-peek:def path)
    ::       :: scry new hark, transform notifications into beacon friendly format
    ::       :: %hark-store     (transform-hark-store:helpers:core (hark-store:scry:core /scry-path))
    ::       %hark           latest:hark:scry:beacon:core
    ::       :: %beacon         (beacon:scry:core /scry-path)
    ::     ==
    :: ==
  ::
  ++  on-agent
    |=  [=wire =sign:agent:gall]
    ^-  (quip card _this)
    =/  wirepath  `path`wire
    ?+    wire  (on-agent:def wire sign)
      :: [%hark-store ~]
      ::   ?+    -.sign  (on-agent:def wire sign)
      ::     %watch-ack
      ::       ?~  p.sign  %-  (slog leaf+"{<dap.bowl>}: subscribed to hark-store" ~)  `this
      ::       ~&  >>>  "{<dap.bowl>}: hark-store subscription failed"
      ::       `this
      :: ::
      ::     %kick
      ::       ~&  >  "{<dap.bowl>}: hark-store kicked us, resubscribing..."
      ::       :_  this
      ::       :~  [%pass /hark-store %agent [our.bowl %hark-store] %watch t.wire]
      ::       ==
      :: ::
      ::     %fact
      ::       ?+    p.cage.sign  (on-agent:def wire sign)
      ::           %hark-update
      ::             =^  cards  state
      ::               (on:hark-store-updates:core !<(=update:hark-store q.cage.sign))
      ::             [cards this]
      ::       ==
      ::   ==

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
          %fact
            ?+    p.cage.sign  (on-agent:def wire sign)
                %hark-action
                  =^  cards  state
                    (on:hark-updates:core !<(=action:hark q.cage.sign))
                  [cards this]
            ==
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
      :: %connect-provider           (on-connect-provider +.action)
      %seen                       (on-seen +.action)
    ==
    ::  'connect' to the underlying agent by subscribing to its updates
    ::   also 'activate' the provider so that scries use this provider when
    ::   retrieving data
    :: ++  on-connect-provider
    ::   |=  [prov=@tas]
    ::   ^-  (quip card _state)
    ::   ?.  (~(has in supported-providers:store) prov)
    ::     ~&  >>>  "{<dap.bowl>}: {<prov>} not supported"
    ::     `state
    ::   :: is there an active provider? if yes, disconnect/leave
    ::   =/  adios=(list card)
    ::   %-  ~(rep by wex.bowl)
    ::   |=  [[[=wire =ship =term] [acked=? =path]] acc=(list card)]
    ::   ?.  ?|  =(wire /hark-store)
    ::           =(wire /hark)
    ::           =(wire /beacon)
    ::       ==  acc
    ::     (snoc acc [%pass wire %agent [ship term] %leave ~])
    ::   ::  subscribe to new provider
    ::   :_  state
    ::   %+  weld  adios
    ::   ?+  prov   `(list card)`~
    ::     :: %hark-store    [%pass /hark-store %agent [our.bowl %hark-store] %watch /updates]~
    ::     %hark          [%pass /hark %agent [our.bowl %hark] %watch /ui]~
    ::     %beacon        [%pass /beacon %agent [our.bowl %beacon] %watch /updates]~
    ::   ==
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
      :: %seen         (on-seen +.rct)
      %new-note     (on-new-note +.rct)
    ==
    ::
    ++  on-seen
      |=  [id=@ud]
      %-  (slog leaf+"{<dap.bowl>}: seen called => {<id>}" ~)
      `state
    ::
    ++  on-new-note
      |=  [=note:store]
      %-  (slog leaf+"{<dap.bowl>}: on-new-note called => {<note>}" ~)
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
      :: ++  latest
      ::   ^-  (unit (unit cage))
      ::   ``beacon-view+!>([%latest ~])
      --
    --
  ++  helpers
    |%
    ::
    --
  --
::
:: ++  hark-store-updates
::   |%
::   ++  on
::     |=  [upd=update:hark-store]
::     ^-  (quip card _state)
::     |^
::     ?+  -.upd    `state
::       %archived        (on-archived +.upd)
::       %more            (on-more +.upd)
::       %note-read       (on-note-read +.upd)
::       %added           (on-added +.upd)
::       %timebox         (on-timebox +.upd)
::       %place-stats     (on-place-stats +.upd)
::       %all-stats       (on-all-stats +.upd)
::     ==
::     ::
::     ++  on-archived
::       |=  [=time =lid:hark-store =notification:hark-store]
::       ^-  (quip card _state)
::       %-  (slog leaf+"{<dap.bowl>}: on-archived => {<[time lid notification]>}" ~)
::       `state
::     ::
::     ++  on-more
::       |=  [more=(list update:hark-store)]
::       ^-  (quip card _state)
::       %-  (slog leaf+"{<dap.bowl>}: on-more => {<more>}" ~)
::       `state
::     ::
::     ++  on-note-read
::       |=  [=time =bin:hark-store]
::       ^-  (quip card _state)
::       %-  (slog leaf+"{<dap.bowl>}: on-note-read => {<[time bin]>}" ~)
::       `state
::     ::
::     ++  on-added
::       |=  [=notification:hark-store]
::       ^-  (quip card _state)
::       %-  (slog leaf+"{<dap.bowl>}: on-added => {<notification>}" ~)
::       `state
::     ::
::     ++  on-timebox
::       |=  [=lid:hark-store notifications=(list notification:hark-store)]
::       ^-  (quip card _state)
::       %-  (slog leaf+"{<dap.bowl>}: on-timebox => {<[lid notifications]>}" ~)
::       `state
::     ::
::     ++  on-place-stats
::       |=  [=place:hark-store =stats:hark-store]
::       ^-  (quip card _state)
::       %-  (slog leaf+"{<dap.bowl>}: on-place-stats => {<[place stats]>}" ~)
::       `state
::     ::
::     ++  on-all-stats
::       |=  [places=(map place:hark-store stats:hark-store)]
::       ^-  (quip card _state)
::       %-  (slog leaf+"{<dap.bowl>}: on-all-stats => {<places>}" ~)
::       `state
::     --
::   --
::
++  hark-updates
  |%
  ++  on
    |=  [act=action:hark]
    ^-  (quip card _state)
    |^
    ?-  -.act
      %add-yarn        (on-add-yarn +.act)
      %saw-seam        (on-saw-seam +.act)
      %saw-rope        (on-saw-rope +.act)
    ==
    ::
    ::  sample:
    ::  [%.y %.y
          :: id=0v3.u5n39.2rhgq.sg25g.hauvb.g5d4e
          :: rop=[
          ::     gop=[~ [p=~ritnys-tonnev-lodlev-migdev q=%new-group]]
          ::             can=~ des=%groups ted=/~ritnys-tonnev-lodlev-migdev/new-group/joins]
          :: tim=~2022.12.7..17.41.26..c0e8
          :: con=~[[%ship p=~lodlev-migdev] ' has joined ' [%emph p='new-group']]
          :: wer=/groups/~ritnys-tonnev-lodlev-migdev/new-group/info/members
          :: but=[~ [title='View all members'
          :: handler=/groups/~ritnys-tonnev-lodlev-migdev/new-group/info/members]]]
    ++  on-add-yarn
      |=  [all=? desk=? =yarn:hark]
      ^-  (quip card _state)
      %-  (slog leaf+"{<dap.bowl>}: on-add-yarn => {<[all desk yarn]>}" ~)
      :: =/  markdown=tape
      :: %+  roll  con.yarn
      ::   |=  [=content:hark acc=tape]
      ::   ^-  tape
      ::   %+  weld  acc
      ::   ?@  content  "{<content>}"
      ::   ?-  -.content
      ::     %ship  (scow %p p.content)
      ::     %emph  (weld "**" (weld (trip p.content) "**"))
      ::   ==
      :: %-  (slog leaf+"{<dap.bowl>}: markdown => {<(crip markdown)>}" ~)
      =|  =note:store
      =.  id.note           id.yarn
      :: =.  content.note      (crip markdown)
      =.  content.note      con.yarn
      =.  tim.note          tim.yarn
      :_  state
      :~  [%give %fact [/updates]~ realm-beacon-reaction+!>([%new-note note])]
      ==
    ::
    ++  on-saw-seam
      |=  [=seam:hark]
      ^-  (quip card _state)
      %-  (slog leaf+"{<dap.bowl>}: on-saw-seam => {<seam>}" ~)
      `state
    ::
    ::  sample:
    ::  [gop=[~ [p=~ritnys-tonnev-lodlev-migdev q=%new-group]]
    ::      can=~ des=%groups ted=/~ritnys-tonnev-lodlev-migdev/new-group/joins]
    ++  on-saw-rope
      |=  [=rope:hark]
      ^-  (quip card _state)
      %-  (slog leaf+"{<dap.bowl>}: on-saw-rope => {<rope>}" ~)
      `state
    --
  --
::
++  is-host
  |=  [=ship]
  =(our.bowl ship)
::
--