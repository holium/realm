:: A minimal "pool" membership manager.
:: A "pool" is a set of ships managed by a host.
::
:: %pools ONLY handles membership.
::
:: If you use %pools for your app:
:: - You are responsible for your own pool roles.
:: - You are responsible for your own pool metadata.
:: - You are responsible for the visiblity/discoverabilty of your pools.
:: - You are responsible for sending your own invite/request messages.
::
:: Only the host can invite/disinvite members.
:: Only the host can accept/reject membership requests.
:: Only the host can update pool settings.
:: To allow admin privileges or other kinds of permissions,
::   you must pass through another agent on the host ship.
::
/-  *pools
/+  vio=ventio, dbug, verb, default-agent
:: Import during development to force compilation
::
/=  co  /mar/pools/create-command
/=  cc  /mar/pools/crud-command
/=  ic  /mar/pools/invite-command
/=  rc  /mar/pools/request-command
/=  ig  /mar/pools/invite-gesture
/=  rg  /mar/pools/request-gesture
/=  pr  /mar/pools/process-reply
/=  pu  /mar/pools/pool-update
/=  ph  /mar/pools/home-update
/=  pk  /mar/pools/peek
/=  vq  /mar/vent-request
/=  vq  /ted/vines/pools
|%
+$  state-0
  $:  %0
      pools=(map id pool)                    :: owned or joined pools
      invites=(map id (pair time (unit ?)))  :: incoming
      requests=(map id (pair time (unit ?))) :: outgoing
  ==
+$  card     card:agent:gall
--
%-  agent:dbug
%+  verb  |
=|  state-0
=*  state  -
=<
^-  agent:gall
|_  =bowl:gall
+*  this  .
    def   ~(. (default-agent this %|) bowl)
    hc    ~(. +> [bowl ~])
    cc    |=(cards=(list card) ~(. +> [bowl cards]))
++  on-init
  ^-  (quip card _this)
  `this
++  on-save   !>(state)
::
++  on-load
  |=  ole=vase
  ^-  (quip card _this)
  =/  old=state-0  !<(state-0 ole)
  =.  state  old
  `this
::
++  on-poke
  |=  [=mark =vase]
  ^-  (quip card _this)
  :: forward vent requests directly to the vine
  ::
  ?:  ?=(%vent-request mark)  :_(this ~[(to-vine:vio vase bowl)])
  ::
  ?+    mark  (on-poke:def mark vase)
    ::
      %pools-create-command
    :: re-interpret as vent-request
    ::
    =^  cards  this
      (on-poke vent-request+!>([[our now]:bowl mark vase]))
    [cards this]
  ::
      %pools-crud-command
    =/  cmd=crud-command  !<(crud-command vase)
    :: only you can command your own agent
    ::
    ?>  =(src our):bowl
    :: you must be the host of any pool you create
    :: only the host can modify pool settings
    :: only the host of a pool can delete that pool
    ::
    ?>  =(our.bowl host.p.cmd)
    ?-    +<.cmd
        %create
      ?>  ((sane %tas) name.p.cmd)
      ?<  (~(has by pools) p.cmd)
      =|  =pool
      =?  scry.pool  ?=(^ scry.q.cmd)  u.scry.q.cmd
      =.  pool  (do-updates:hc pool fields.q.cmd)
      =.  members.pool  (~(put in members.pool) our.bowl)
      :_  this(pools (~(put by pools) p.cmd pool))
      [%give %fact ~[/home] pools-home-update+!>([%pool %& p.cmd])]~
      ::
        %update
      =^  cards  state
        abet:((drop-many:hc p.cmd) fields.q.cmd)
      [cards this]
      ::
        %delete
      :_  this(pools (~(del by pools) p.cmd))
      :~  [%give %fact ~[/home] pools-home-update+!>([%pool %| p.cmd])]
          [%give %kick ~[/pool/(scot %p host.p.cmd)/[name.p.cmd]] ~]
      ==
    ==
    ::
      %pools-invite-command
    :: only you can command your own agent
    ::
    ?>  =(src our):bowl
    =/  cmd=invite-command  !<(invite-command vase)
    ?-    +<.cmd
        ?(%invite %accept %reject)
      :: re-interpret as vent-request
      ::
      =^  cards  this
        (on-poke vent-request+!>([[our now]:bowl mark vase]))
      [cards this]
      ::
        %cancel
      :: only the host can invite
      ::
      ?>  =(our.bowl host.p.cmd)
      :: remove from invited
      ::
      =^  cards  state
        abet:((drop:hc p.cmd) [%invited | ship.q.cmd])
      :: send cancel gesture
      ::
      =/  =cage  pools-invite-gesture+!>([p.cmd %cancel])
      [[[%pass / %agent [ship.q.cmd dap.bowl] %poke cage] cards] this]
      ::
        %kick
      :: only the host can kick members
      ::
      ?>  =(our.bowl host.p.cmd)
      :: cannot remove host as a member
      ::
      ?<  =(ship.q.cmd host.p.cmd)
      :: remove from members, invited, requested
      ::
      =/  hc  ((drop:hc p.cmd) [%member %| ship.q.cmd])
      =.  hc  ((drop:hc p.cmd) [%invited %| ship.q.cmd])
      =.  hc  ((drop:hc p.cmd) [%requested %| ship.q.cmd])
      =^  cards  state  abet:hc
      :: kick from pool path
      ::
      [[[%give %kick ~[(en-path:hc p.cmd)] `ship.q.cmd] cards] this]
      ::
        %kick-blacklisted
      :: only the host can kick members
      ::
      ?>  =(our.bowl host.p.cmd)
      :: get blacklisted members
      ::
      =/  blacklist=(list ship)
        %+  murn  ~(tap in members:(~(got by pools) p.cmd))
        |=(=ship ?.(?=([~ %|] (get-auto p.cmd ship)) ~ (some ship)))
      :: recursively kick blacklisted members with on-poke
      ::
      =|  cards=(list card)
      |-  ?~  blacklist  [cards this]
      =^  new  this
        (on-poke pools-invite-command+!>([p.cmd %kick i.blacklist]))
      $(cards (welp new cards))
    ==
    ::
      %pools-request-command
    :: only you can command your own agent
    ::
    ?>  =(src our):bowl
    =/  cmd=request-command  !<(request-command vase)
    ?-    +<.cmd
        %request
      :: re-interpret as vent-request
      ::
      =^  cards  this
        (on-poke vent-request+!>([[our now]:bowl mark vase]))
      [cards this]
      ::
        %cancel
      :: remove from requests
      ::
      =.  requests  (~(del by requests) p.cmd)
      :_  this
      :~
        :: send home update
        ::
        =/  upd=home-update  [%request %| p.cmd]
        [%give %fact ~[/home] pools-home-update+!>(upd)]
        :: send cancel gesture
        ::
        =/  =cage  pools-request-gesture+!>([p.cmd %cancel])
        [%pass / %agent [host.p.cmd dap.bowl] %poke cage]
      ==
      ::
        %leave
      ?<  =(our.bowl host.p.cmd)
      :: remove pool
      ::
      :_  %=  this
            pools     (~(del by pools) p.cmd)
            invites   (~(del by invites) p.cmd)
            requests  (~(del by requests) p.cmd)
          ==
      :~
        :: leave pool path
        ::
        =/  =wire  /pool/(scot %p host.p.cmd)/[name.p.cmd]
        [%pass wire %agent [host.p.cmd dap.bowl] %leave ~]
        :: send home updates
        ::
        =/  upd=home-update  [%pool %| p.cmd]
        [%give %fact ~[/home] pools-home-update+!>(upd)]
        =/  upd=home-update  [%invite %| p.cmd]
        [%give %fact ~[/home] pools-home-update+!>(upd)]
        =/  upd=home-update  [%request %| p.cmd]
        [%give %fact ~[/home] pools-home-update+!>(upd)]
      ==
      ::
        %accept
      :: only the host can accept/reject requests
      ::
      ?>  =(our.bowl host.p.cmd)
      :: cannot accept non-existent or already-determined request
      ::
      =/  =pool           (~(got by pools) p.cmd)
      ?~  req=(~(get by requested.pool) ship.q.cmd)  ~|(%no-request-outstanding !!)
      ?^  q.u.req  ~|(%request-already-determined !!)
      :: update requested and add to members
      ::
      =/  hc  ((drop:hc p.cmd) [%requested %& ship.q.cmd [now.bowl `&]])
      =.  hc  ((drop:hc p.cmd) [%member %& ship.q.cmd])
      =^  cards  state  abet:hc
      :: send accept gesture
      ::
      =/  =cage  pools-request-gesture+!>([p.cmd %accept])
      [[[%pass / %agent [ship.q.cmd dap.bowl] %poke cage] cards] this]
      ::
        %reject
      :: only the host can accept/reject requests
      ::
      ?>  =(our.bowl host.p.cmd)
      :: cannot reject non-existent or already-determined request
      ::
      =/  =pool           (~(got by pools) p.cmd)
      ?~  req=(~(get by requested.pool) ship.q.cmd)  ~|(%no-request-outstanding !!)
      ?^  q.u.req  ~|(%request-already-determined !!)
      :: update requested
      ::
      =^  cards  state
        abet:((drop:hc p.cmd) [%requested %& ship.q.cmd [now.bowl `|]])
      :: send reject gesture
      ::
      =/  =cage  pools-request-gesture+!>([p.cmd %reject])
      [[[%pass / %agent [ship.q.cmd dap.bowl] %poke cage] cards] this]
    ==
    ::
      %pools-invite-gesture
    =/  ges=invite-gesture  !<(invite-gesture vase)
    ?-    q.ges
        %invite
      :: only the host can invite
      ::
      ?>  =(src.bowl host.p.ges)
      :: add to invites
      ::
      :_  this(invites (~(put by invites) p.ges [now.bowl ~]))
      :: send home update
      ::
      =/  upd=home-update  [%invite %& p.ges [now.bowl ~]]
      [%give %fact ~[/home] pools-home-update+!>(upd)]~
      ::
        %cancel
      :: only the host can invite
      ::
      ?>  =(src.bowl host.p.ges)
      :: remove from invites
      ::
      :_  this(invites (~(del by invites) p.ges))
      :: send home update
      ::
      =/  upd=home-update  [%invite %| p.ges]
      [%give %fact ~[/home] pools-home-update+!>(upd)]~
      ::
        %accept
      :: update invited and add to members
      ::
      =/  invitee=ship  src.bowl
      =/  =pool  (~(got by pools) p.ges)
      ?>  (~(has by invited.pool) invitee)
      =.  invited.pool
        (~(put by invited.pool) invitee [now.bowl `&])
      =.  members.pool  (~(put in members.pool) invitee)
      :_  this(pools (~(put by pools) p.ges pool))
      =/  =path  /pool/(scot %p host.p.ges)/[name.p.ges]
      :~
        :: send %invited update
        ::
        =/  upd=pool-update  [%invited %& invitee [now.bowl `&]]
        [%give %fact ~[path] pools-pool-update+!>(upd)]
        :: send %member update
        ::
        =/  upd=pool-update  [%member %& invitee]
        [%give %fact ~[path] pools-pool-update+!>(upd)]
      ==
      ::
        %reject
      :: update invited
      ::
      =/  invitee=ship  src.bowl
      =/  =pool  (~(got by pools) p.ges)
      ?>  (~(has by invited.pool) invitee)
      =.  invited.pool
        (~(put by invited.pool) invitee [now.bowl `|])
      :_  this(pools (~(put by pools) p.ges pool))
      :: send %invited update
      ::
      =/  =path  /pool/(scot %p host.p.ges)/[name.p.ges]
      =/  upd=pool-update  [%invited %& invitee [now.bowl `|]]
      [%give %fact ~[path] pools-pool-update+!>(upd)]~
    ==
    ::
      %pools-request-gesture
    =/  ges=request-gesture  !<(request-gesture vase)
    ?-    q.ges
        %request
      :: add to requested
      ::
      =/  hc  ((drop:hc p.ges) [%requested %& src.bowl [now.bowl ~]])
      :: auto-accept or auto-deny
      :: 
      =.  hc  (auto-handle-request:hc p.ges src.bowl)
      =^  cards  state  abet:hc
      [cards this]
      ::
        %cancel
      :: remove from requested
      ::
      =^  cards  state
        abet:((drop:hc p.ges) [%requested %| src.bowl])
      [cards this]
      ::
        %accept
      :: only the host can accept/reject requests
      ::
      ?>  =(src.bowl host.p.ges)
      :: update requests
      ::
      ?>  (~(has by requests) p.ges)
      :_  this(requests (~(put by requests) p.ges [now.bowl `&]))
      :~
        :: send home update
        ::
        =/  upd=home-update  [%request %& p.ges [now.bowl `&]]
        [%give %fact ~[/home] pools-home-update+!>(upd)]
        :: watch pool path
        ::
        =/  =wire  /pool/(scot %p host.p.ges)/[name.p.ges]
        [%pass wire %agent [src dap]:bowl %watch wire]
      ==
      ::
        %reject
      :: only the host can accept/reject requests
      ::
      ?>  =(src.bowl host.p.ges)
      :: update requests
      ::
      ?>  (~(has by requests) p.ges)
      :_  this(requests (~(put by requests) p.ges [now.bowl `|]))
      :: send home update
      ::
      =/  upd=home-update  [%request %& p.ges [now.bowl `|]]
      [%give %fact ~[/home] pools-home-update+!>(upd)]~
    ==
    ::
      %pools-process-reply
    :: Only you can trigger a process-reply
    ::
    ?>  =(src our):bowl
    =/  pro=process-reply  !<(process-reply vase)
    ?-    -.q.pro
        %invite-sent
      :: add to invited
      ::
      =^  cards  state
        abet:((drop:hc p.pro) [%invited %& ship.q.pro [now.bowl ~]])
      [cards this]
      ::
        %invite-accepted
      ?.  (~(has by invites) p.pro)  ~|(%not-invited-to-pool !!)
      :: update invites
      ::
      :_  this(invites (~(put by invites) p.pro [now.bowl `&]))
      :~
        :: send home update
        ::
        =/  upd=home-update  [%invite %& p.pro [now.bowl `&]]
        [%give %fact ~[/home] pools-home-update+!>(upd)]
        :: watch pool path
        ::
        =/  =path  /pool/(scot %p host.p.pro)/[name.p.pro]
        [%pass path %agent [host.p.pro dap.bowl] %watch path]
      ==
      ::
        %invite-rejected
      ?.  (~(has by invites) p.pro)  ~|(%not-invited-to-pool !!)
      :: update invites
      ::
      :_  this(invites (~(put by invites) p.pro [now.bowl `|]))
      :: send home update
      ::
      =/  upd=home-update  [%invite %& p.pro [now.bowl `|]]
      [%give %fact ~[/home] pools-home-update+!>(upd)]~
      ::
        %request-sent
      :: add to requests
      ::
      :_  this(requests (~(put by requests) p.pro [now.bowl ~]))
      :: send home update
      ::
      =/  upd=home-update  [%request %& p.pro [now.bowl ~]]
      [%give %fact ~[/home] pools-home-update+!>(upd)]~
    ==
  ==
::
++  on-watch
  |=  =(pole knot)
  ^-  (quip card _this)
  ?+    pole  (on-watch:def pole)
    [%vent @ @ ~]  `this
    [%home ~]      `this
    ::
      [%pool h=@ n=@ ~]
    =/  host=ship  (slav %p h.pole)
    ?>  =(host our.bowl)
    =/  =id        [host n.pole]
    =/  =pool      (~(got by pools) id)
    ?>  (~(has in members.pool) src.bowl)
    :: give initial update
    ::
    :_(this [%give %fact ~ pools-pool-update+!>([%pool pool])]~)
  ==
::
++  on-leave
  |=  =(pole knot)
  ?+    pole  (on-leave:def pole)
      [%pool h=@ n=@ ~]
    =/  host=ship     (slav %p h.pole)
    ?.  =(host src.bowl)  `this
    =/  =id           [host n.pole]
    :: remove from members, invited and requested
    ::
    =/  hc  ((drop:hc id) [%member %| src.bowl])
    =.  hc  ((drop:hc id) [%invited %| src.bowl])
    =.  hc  ((drop:hc id) [%requested %| src.bowl])
    =^  cards  state  abet:hc
    [cards this]
  ==
::
++  on-peek
  |=  =(pole knot)
  ^-  (unit (unit cage))
  ?+    pole  (on-peek:def pole)
    [%x %pools ~]     ``pools-peek+!>(pools+pools)
    [%x %invites ~]   ``pools-peek+!>(invites+invites)
    [%x %requests ~]  ``pools-peek+!>(requests+requests)
    ::
      [%x %pool h=@ n=@ ~]
    =/  host=ship  (slav %p h.pole)
    =/  =id        [host n.pole]
    ``pools-peek+!>(pool+(~(got by pools) id))
    ::
      [%x %has-pool h=@ n=@ ~]
    =/  host=ship  (slav %p h.pole)
    =/  =id        [host n.pole]
    ``loob+!>((~(has by pools) id))
    ::
      [%x %graylist-gate ~]
    :-  ~  :-  ~  :-  %noun  !>
    |=  [=id requester=ship]
    ^-  (unit ?)
    =+  graylist:(~(got by pools) id)
    ?^  auto=(~(get by ship) requester)  auto
    ?^  auto=(~(get by rank) (clan:title requester))  auto
    rest
  ==
::
++  on-agent
  |=  [=(pole knot) =sign:agent:gall]
  ^-  (quip card _this)
  ?+    pole  (on-agent:def pole sign)
      [%pool h=@ n=@ ~]
    =/  host=ship  (slav %p h.pole)
    ?>  =(host src.bowl)
    =/  =id        [host n.pole]
    ?+    -.sign  (on-agent:def pole sign)
        %watch-ack
      ?~  p.sign
        :_(this [%give %fact ~[/home] pools-home-update+!>([%pool %& id])]~)
      %-  (slog 'Subscribe failure.' ~)
      %-  (slog u.p.sign)
      :: clear pool from state on watch nack
      ::
      :_  %=  this
            pools     (~(del by pools) id)
            invites   (~(del by invites) id)
            requests  (~(del by requests) id)
          ==
      :~
        :: send home updates
        ::
        =/  upd=home-update  [%pool %| id]
        [%give %fact ~[/home] pools-home-update+!>(upd)]
        =/  upd=home-update  [%invite %| id]
        [%give %fact ~[/home] pools-home-update+!>(upd)]
        =/  upd=home-update  [%request %| id]
        [%give %fact ~[/home] pools-home-update+!>(upd)]
      ==
      ::
        %kick
      :: resubscribe on kick
      ::
      %-  (slog '%pools: Got kick, resubscribing...' ~)
      :_(this [%pass pole %agent [src dap]:bowl %watch pole]~)
      ::
        %fact
      ?.  =(p.cage.sign %pools-pool-update)  (on-agent:def pole sign)
      :: incorporate pool update
      ::
      =/  upd=pool-update  !<(pool-update q.cage.sign)
      =/  =pool  (~(gut by pools) id *pool)
      =.  pool   (do-update:hc upd pool)
      `this(pools (~(put by pools) id pool))
    ==
  ==
::
++  on-arvo
  |=  [=(pole knot) sign=sign-arvo]
  ^-  (quip card:agent:gall _this)
  ?.  ?=([%vent p=@ta q=@ta ~] pole)  (on-arvo:def pole sign)
  ?.  ?=([%khan %arow *] sign)        (on-arvo:def pole sign)
  %-  (slog ?:(?=(%.y -.p.sign) ~ p.p.sign))
  :_(this (vent-arow:vio pole p.sign))
::
++  on-fail   on-fail:def
--
|_  [=bowl:gall cards=(list card)]
+*  core  .
    io    ~(. agentio bowl)
++  abet  [(flop cards) state]
++  emit  |=(=card core(cards [card cards]))
++  emil  |=(cadz=(list card) core(cards (weld cadz cards)))
::
++  get-auto
  |=  [=id =ship]
  ^-  (unit ?)
  =+  scry:(~(got by pools) id) :: expose [dude path]
  =+  :(weld /(scot %p our.bowl)/[dude]/(scot %da now.bowl) path /noun)
  (.^(graylist-gate %gx -) id ship)
:: auto-accept or auto-deny
:: 
++  auto-handle-request
  |=  [=id =ship]
  ^+  core
  ?+    (get-auto id ship)  core
      [~ %&]
    =/  =cage  pools-request-command+!>([id %accept ship])
    (emit %pass / %agent [our dap]:bowl %poke cage)
    ::
      [~ %|]
    =/  =cage  pools-request-command+!>([id %reject ship])
    (emit %pass / %agent [our dap]:bowl %poke cage)
  ==
::
++  en-path  |=(=id `path`/pool/(scot %p host.id)/[name.id])
:: apply updates and emit updates
::
++  drop-many
  |=  =id 
  |=  upds=(list pool-update)
  ^+  core
  |-  ?~  upds  core
  %=  $
    upds  t.upds
    core  ((drop id) i.upds)
  ==
:: apply update and emit update
:: (helps to avoid missing update bugs)
::
++  drop
  |=  =id
  |=  *
  ^+  core
  =/  upd    ;;(pool-update +<) :: problems with +each
  =/  =pool  (~(got by pools) id)
  =.  pool   (do-update upd pool)
  =.  pools  (~(put by pools) id pool)
  (emit %give %fact ~[(en-path id)] pools-pool-update+!>(upd))
::
++  do-updates
  |=  [=pool upds=(list pool-update)]
  ^+  pool
  |-  ?~  upds  pool
  %=  $
    upds  t.upds
    pool  (do-update i.upds pool)
  ==
::
++  do-update
  |=  [upd=pool-update =pool]
  ^+  pool
  ?-    -.upd
    %pool      pool.upd
    %graylist  pool(graylist graylist.upd)
    %rest      pool(rest.graylist p.upd)
      %ship
    ?-  -.p.upd
      %&  pool(ship.graylist (~(put by ship.graylist.pool) p.p.upd))
      %|  pool(ship.graylist (~(del by ship.graylist.pool) p.p.upd))
    ==
    ::
      %rank
    ?-  -.p.upd
      %&  pool(rank.graylist (~(put by rank.graylist.pool) p.p.upd))
      %|  pool(rank.graylist (~(del by rank.graylist.pool) p.p.upd))
    ==
    ::
      %member
    ?-  -.p.upd
      %&  pool(members (~(put in members.pool) p.p.upd))
      %|  pool(members (~(del in members.pool) p.p.upd))
    ==
      %invited
    ?-  -.p.upd
      %&  pool(invited (~(put by invited.pool) p.p.upd))
      %|  pool(invited (~(del by invited.pool) p.p.upd))
    ==
      %requested
    ?-  -.p.upd
      %&  pool(requested (~(put by requested.pool) p.p.upd))
      %|  pool(requested (~(del by requested.pool) p.p.upd))
    ==
  ==
--
