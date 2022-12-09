::
::  agent: realm-beacon
::  purpose:
::    Notifications hub for realm.
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
    ?+    path  (on-peek:def path)
      :: get all seen and unseen
      [%x %all ~]     ::  ~/scry/beacon/all
        :: grab the carpet to determine stitch
        =/  car=carpet:hark  scry-latest:harken:core
        :: use the stitch to grab the blanket
        =/  blan             (scry-blanket:harken:core stitch.car)
        :: stitch together seen/unseen
        =/  weave            (stitch:harken:core car blan)
        :: return all yarns
        ``realm-beacon-view+!>([%all weave])

      :: get all unseen
      [%x %unseen ~]      ::  ~/scry/beacon/unseen
        :: http://localhost/~/scry/hark/all/latest.json
        =/  car=carpet:hark  scry-latest:harken:core
        :: %-  (slog leaf+"{<dap.bowl>}: {<car>}" ~)
        ``realm-beacon-view+!>([%unseen yarns.car])

      :: get all seen
      [%x %seen ~]     ::  ~/scry/beacon/seen
        :: grab the carpet to determine stitch
        =/  car=carpet:hark  scry-latest:harken:core
        :: use the stitch to grab the blanket
        =/  blan             (scry-blanket:harken:core stitch.car)
        ::  if blanket not exist, return empty json object
        ?~  blan  ``json+!>([%o ~])
        ::  return seen
        ``realm-beacon-view+!>([%seen yarns.u.blan])
    ==
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
                    (on:harken:core !<(=action:hark q.cage.sign))
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
    ::
    ::  $on-seen: scry hark for notification by id and use the resulting
    ::   yarn to poke hark with the corresponding rope.
    ::
    ++  on-seen
      |=  [=id:hark]
      %-  (slog leaf+"{<dap.bowl>}: seen called" ~)
      :: sample:
      ::  http://localhost/~/scry/hark/yarn/0v1.31ngs.h064p.c6u00.1m9n6.pk9ho.json
      =/  yar=yarn:hark  .^(yarn:hark %gx /(scot %p our.bowl)/hark/(scot %da now.bowl)/yarn/(scot %uv id)/noun)
      :_  state
      :~  [%pass / %agent [our.bowl %hark] %poke hark-action+!>([%saw-rope rop.yar])]
      ==
    ::
    --
  ++  reaction
    |=  [rct=reaction:store]
    ^-  (quip card _state)
    :: `state
    |^
    ?-  -.rct
      %seen         (on-seen +.rct)
      %new-note     (on-new-note +.rct)
    ==
    ::
    ++  on-seen
      |=  [=id:hark]
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
::  hark utils and helpers
++  harken
  |%
  ++  to-notes
    |=  [yarns=(map id:hark yarn:hark) seen=?]
    ^-  (map id:hark note:store)
    %-  ~(rep by yarns)
    |=  [[=id:hark =yarn:hark] acc=(map id:hark note:store)]
    (~(put by acc) id [id con.yarn tim.yarn seen])

  ::  combine yarns in carpet with yarns in blanket
  ::  note we want a map, but instead of using mop to sort
  ::   sort by time on front-end for now
  ++  stitch
    |=  [=carpet:hark blan=(unit blanket:hark)]
    ^-  (map id:hark note:store)
    ::  convert yarns to notes
    ::   carpet yarns are marked unseen
    =/  unseen-notes  (to-notes yarns.carpet %.n)
    ?~  blan  unseen-notes
    ::  convert yarns to notes
    ::   blanket yarns are marked unseen
    =/  seen-notes    (to-notes yarns.u.blan %.y)
    (~(uni by seen-notes) unseen-notes)
    :: ((mop id:hark yarn:hark) lte)
    :: %-  my
    :: %-  sort
    :: :-  ~(tap by (~(uni by yarns.u.blan) yarns.carpet))
    :: |=  [a=[=id:hark =yarn:hark] b=[=id:hark =yarn:hark]]
    :: %+  gth  (ni:dejs:format (time:enjs:format tim.yarn.b))
    :: (ni:dejs:format (time:enjs:format tim.yarn.a))
  ::
  ++  scry-latest
    .^(carpet:hark %gx /(scot %p our.bowl)/hark/(scot %da now.bowl)/all/latest/noun)
  ::
  ++  scry-blanket
    |=  [stitch=@ud]
    ^-  (unit blanket:hark)
    ?:  =(stitch 0)  ~
      :: http://localhost/~/scry/hark/all/quilt/5.json
      =/  stch  (crip (en-json:html (numb:enjs:format stitch)))
      =/  pth  /(scot %p our.bowl)/hark/(scot %da now.bowl)/all/quilt/[stch]/noun
      :: %-  (slog leaf+"{<dap.bowl>}: {<pth>}" ~)
      (some .^(blanket:hark %gx pth))
  ::
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
      =.  seen.note         %.n
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
      =/  yar=(unit yarn:hark)       (find-yarn rope)
      ?~  yar  ~|('on-saw-rope find-yarn unexpected result' !!)
      :_  state
      :~  [%give %fact [/updates]~ realm-beacon-reaction+!>([%seen id.u.yar])]
      ==
    ::  $find-yarn: locate a hark yarn by its rope
    ++  find-yarn
      |=  [=rope:hark]
      ^-  (unit yarn:hark)
      ?~  gop.rope  ~
      =/  par  u.gop.rope
      %-  (slog leaf+"{<dap.bowl>}: {<par>}" ~)
      :: http://localhost/~/scry/hark/group/~lodlev-migdev/remote-group-1/quilt/1.json
      :: =/  num  (crip (en-json:html (numb:enjs:format -.par)))
      =/  blan=blanket:hark  .^(blanket:hark %gx /(scot %p our.bowl)/hark/(scot %da now.bowl)/group/(scot %p -.par)/(scot %tas +.par)/noun)
      :: locate the yarn in the blanket
      =/  elems=(list [=id:hark =yarn:hark])
      %+  skim  ~(tap by yarns.blan)
        |=  [=id:hark =yarn:hark]
        ?:  =(ted.rop.yarn ted.rope)  %.y  %.n
      ?:  (gth (lent elems) 0)
        =/  elem  (snag 0 elems)
        (some yarn.elem)
      ~
    --
  --
::
++  is-host
  |=  [=ship]
  =(our.bowl ship)
::
--