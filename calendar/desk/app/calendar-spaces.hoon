/-  *calendar-spaces, p=pools, m=membership, s=spaces-store, v=visas
/+  vio=ventio, dbug, verb, default-agent
:: import to force compilation during testing
::
/=  r-  /mar/spaces/reaction
/=  c-  /mar/spaces/crud-action
/=  u-  /mar/spaces/util-action
/=  p-  /mar/spaces/pools-peek
/=  p-  /lib/calendar-spaces-json
|%
+$  state-0
  $:  %0  our=(set cid)
      almanac=(map space [=banned =calendars])
      pools=(map id:p space)
  ==
+$  card     card:agent:gall
--
=|  state-0
=*  state  -
=<
%-  agent:dbug
%+  verb  |
^-  agent:gall
|_  =bowl:gall
+*  this  .
    def   ~(. (default-agent this %|) bowl)
    hc    ~(. +> [bowl ~])
::
++  on-init
  ^-  (quip card _this)
  ?.  has-spaces:hc  ~|("ERROR: Must have %spaces installed." !!)
  :_(this [%pass /spaces %agent [our.bowl %spaces] %watch /updates]~)
::
++  on-save   !>(state)
::
++  on-load
  |=  ole=vase
  ^-  (quip card _this)
  =/  old=state-0  !<(state-0 ole)
  =.  state  old
  =/  remote-spaces
    %+  murn
      ~(tap in ~(key by almanac))
    |=(=space ?:(=(-.space our.bowl) ~ (some space)))
  =^  cards  state
    abet:(leave-and-refollow:hc remote-spaces)
  :_  this
  %+  welp  cards
  ?:  (~(has by wex.bowl) /spaces [our.bowl %spaces])  ~
  [%pass /spaces %agent [our.bowl %spaces] %watch /updates]~
::
++  on-poke
  |=  [=mark =vase]
  ^-  (quip card _this)
  :: forward vent requests directly to the vine
  ::
  ?:  ?=(%vent-request mark)  :_(this ~[(to-vine:vio vase bowl)])
  ::
  ?+    mark  (on-poke:def mark vase)
      %util
    ?>  =(src our):bowl
    =+  !<(axn=util-action vase)
    ?>  ?=(%follow-many -.axn)
    =^  cards  state
      abet:(follow-many:hc spaces.axn)
    [cards this]
    ::
      %spaces-crud-action
    =+  !<(axn=crud-action vase)
    =^  cards  state
      abet:(handle-crud-action:hc axn)
    [cards this]
    ::
      %spaces-process-our
    =+  !<(pro=process-our vase)
    =^  cards  state
      abet:(handle-process-our:hc pro)
    [cards this]
  ==
::
++  on-watch
  |=  =(pole knot)
  ^-  (quip card _this)
  ?+    pole  (on-watch:def pole)
    [%vent @ @ ~]  `this
    [%ui ~]        `this
      [%space host=@t name=@t reader=@t ~]
    =/  [=space reader=ship]  (de-space-path pole)
    ?>  =(-.space our.bowl)
    ?>  =(reader src.bowl)
    ?>  (is-member:hc space src.bowl)
    =/  rxn=reaction
      [%space %watchlist (get-readable:hc space reader)]
    :_(this [%give %fact ~ spaces-reaction+!>(rxn)]~)
    ::
      [%calendar s-host=@t s-name=@t c-host=@t c-name=@t ~]
    =/  [=space =cid]  (de-calendar-path pole)
    ?>  =(-.space our.bowl)
    ?>  (can-read:hc space cid src.bowl)
    =/  [=banned =calendars]  (~(got by almanac) space)
    =/  rxn=reaction  [%calendar %calendar (~(got by calendars) cid)]
    :_(this [%give %fact ~ spaces-reaction+!>(rxn)]~)
  ==
::
++  on-leave  on-leave:def
++  on-peek
  |=  =(pole knot)
  ^-  (unit (unit cage))
  ?+    pole  (on-peek:def pole)
    [%x %almanac ~]  ``spaces-peek+!>(almanac+almanac)
    [%x %perms ~]    ``noun+!>(|=(a=@ [a a]))
    [%x %spaces ~]   ``spaces-peek+!>(spaces+all-spaces:hc)
    ::
      [%x %our ~]
    :-  ~  :-  ~  :-  %spaces-peek
    !>  :-  %our
    %-  ~(gas by *(map cid [@t @t]))
    %+  turn  ~(tap in our)
    |=  =cid
    =/  [title=@t description=@t]
      [title description]:(get-calendar:hc cid)
    [cid title description]
    ::
      [%x %calendars host=@t name=@t ~]
    =/  host=ship  (slav %p host.pole)
    =/  =space  [host name.pole]
    =/  [banned =calendars]  (~(got by almanac) space)
    :-  ~  :-  ~  :-  %spaces-peek
    !>  :-  %calendars
    %-  ~(gas by *calendars:spaces-peek)
    %+  turn  ~(tap by calendars)
    |=  [=cid creator=ship =perms]
    =/  [title=@t description=@t]
      [title description]:(get-calendar:hc cid)
    [cid title description creator perms]
    ::
      [%x %graylist-gate ~]
    :-  ~  :-  ~  :-  %noun  !>
    |=  [=id:p requester=ship]
    ^-  (unit ?)
    `(can-read:hc (~(got by pools) id) id requester)
    ::
      [%x %roles-gate ~]
    :-  ~  :-  ~  :-  %noun  !>
    |=  [=cid =ship]
    ^-  (unit role)
    (~(get by (got-readers:hc (~(got by pools) cid) cid)) ship)
  ==
++  on-agent
  |=  [=(pole knot) =sign:agent:gall]
  ^-  (quip card _this)
  ?+    pole  (on-agent:def pole sign)
      [%spaces ~]
    ?+    -.sign  (on-agent:def pole sign)
        %watch-ack
      ?~  p.sign
        =/  tang  [leaf+"%calendar-spaces: subscribed to /updates from %spaces."]~
        ((slog tang) `this)
      =/  tang
        :_  u.p.sign
        leaf+"%calendar-spaces: failed to subscribe to /updates from %spaces."
      ((slog tang) `this)
      ::
        %kick
      :_(this [%pass pole %agent [src.bowl %spaces] %watch /updates]~)
      ::
        %fact
      ?+    p.cage.sign  `this
          %visas-reaction
        =/  rxn  !<(reaction:v q.cage.sign)
        =^  cards  state
          abet:(handle-visas-reaction:hc rxn)
        [cards this]
        ::
          %spaces-reaction
        =/  rxn  !<(reaction:s q.cage.sign)
        =^  cards  state
          abet:(handle-spaces-reaction:hc rxn)
        [cards this]
      ==
    ==
    :: updates regarding which calendars I can read
    :: 
      [%space host=@t name=@t reader=@t ~]
    ?+    -.sign  (on-agent:def pole sign)
        %watch-ack
      ?~  p.sign
        %.  `this
        %-  slog
        :_  ~  
        leaf+"%calendar-spaces: joining {(spud pole)} succeeded!"
      %.  `this
      %-  slog
      :_  u.p.sign
      leaf+"%calendar-spaces: joining {(spud pole)} failed!"
    ::
        %kick
      ~&  "{<dap.bowl>}: got kick from {(spud pole)}, resubscribing..."
      :_(this [%pass pole %agent [src.bowl dap.bowl] %watch pole]~)
    ::
        %fact
      =/  [=space reader=ship]  (de-space-path pole)
      ?.  ?=(%spaces-reaction p.cage.sign)  (on-agent:def pole sign)
      =/  rxn  !<(reaction q.cage.sign)
      ?>  ?=(%space -.rxn)
      =^  cards  state
        abet:(handle-space-reaction:hc space +.rxn)
      [cards this]
    ==
    :: updates regarding a specific calendar
    :: 
      [%calendar s-host=@t s-name=@t c-host=@t c-name=@t ~]
    ?+    -.sign  (on-agent:def pole sign)
        %watch-ack
      ?~  p.sign
        %.  `this
        %-  slog
        :_  ~  
        leaf+"%calendar-spaces: joining {(spud pole)} succeeded!"
      %-  %-  slog
          :_  u.p.sign
          leaf+"%calendar-spaces: joining {(spud pole)} failed!"
      =^  cards  state
        abet:(handle-calendar-watch-nack:hc pole)
      [cards this]
    ::
        %kick
      ~&  "{<dap.bowl>}: got kick from {(spud pole)}, resubscribing..."
      :_(this [%pass pole %agent [src.bowl dap.bowl] %watch pole]~)
    ::
        %fact
      =/  [=space =cid]  (de-calendar-path pole)
      ?.  ?=(%spaces-reaction p.cage.sign)  (on-agent:def pole sign)
      =/  rxn  !<(reaction q.cage.sign)
      ?>  ?=(%calendar -.rxn)
      =^  cards  state
        abet:(handle-calendar-reaction:hc space cid +.rxn)
      [cards this]
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
::
|_  [=bowl:gall cards=(list card)]
+*  core  .
++  abet  [(flop cards) state]
++  emit  |=(=card core(cards [card cards]))
++  emil  |=(cadz=(list card) core(cards (weld cadz cards)))
::
++  ui-emit
  |=  upd=update
  (emit %give %fact ~[/ui] spaces-update+!>(upd))
::
++  away-space-emil
  |=  [=space rxn=space-reaction:reaction]
  %-  emil
  %+  murn  ~(val by sup.bowl)
  |=  [=ship =path]
  ?.  ?=([%space host=@t name=@t reader=@t ~] path)  ~
  =/  [s=^space p=^ship]  (de-space-path path)
  ?.  =([s p] [space ship])  ~
  (some [%give %fact ~[path] spaces-reaction+!>(space+rxn)])
::
++  away-calendar-emit
  |=  [=space =cid rxn=calendar-reaction:reaction]
  =/  away  (en-calendar-path space cid) :: listeners
  (emit %give %fact ~[away] spaces-reaction+!>(calendar+rxn))
::
++  en-space-path
  |=  [=space reader=ship]
  /space/(scot %p -.space)/[+.space]/(scot %p reader)
++  de-space-path
  |=  =(pole knot)
  ^-  [space reader=ship]
  ?>  ?=([%space host=@t name=@t reader=@t ~] pole)
  [[(slav %p host) name] (slav %p reader)]:[pole .]
::
++  en-calendar-path
  |=  [=space =cid]
  /calendar/(scot %p -.space)/[+.space]/(scot %p -.cid)/[+.cid]
++  de-calendar-path
  |=  =(pole knot)
  ^-  [space =cid]
  ?>  ?=([%calendar s-host=@t s-name=@t c-host=@t c-name=@t ~] pole)
  :-  [(slav %p s-host.pole) s-name.pole]
  [(slav %p c-host.pole) c-name.pole]
::
++  create-space
  |=  =space
  ^-  _core
  ?>  =(-.space our.bowl)
  ?:  (~(has by almanac) space)  core
  =.  almanac   (~(put by almanac) space *banned *calendars)
  (ui-emit %add-space space *banned *calendars)
::
++  follow-space
|=  =space
^-  _core
?<  =(-.space our.bowl)
=/  pite  (en-space-path space our.bowl)
?:  (~(has by wex.bowl) pite -.space dap.bowl)  core
=.  almanac   (~(put by almanac) space *banned *calendars)
=.  core  (ui-emit %add-space space *banned *calendars)
(emit:core [%pass pite %agent [-.space dap.bowl] %watch pite])
::
++  create-or-follow
  |=  =space
  ^-  _core
  ?:  =(-.space our.bowl)
    (create-space space)
  (follow-space space)
::
++  delete-space
  |=  =space
  ^-  _core
  ?>  =(-.space our.bowl)
  ?.  (~(has by almanac) space)  core
  =.  almanac  (~(del by almanac) space)
  (ui-emit %del-space space)
::
++  leave-calendar-card
  |=  [=space =cid]
  ^-  card
  [%pass (en-calendar-path space cid) %agent [-.space dap.bowl] %leave ~]
::
++  leave-space
  |=  =space
  ^-  _core
  ?<  =(-.space our.bowl)
  =/  remote-calendars  ~(tap in ~(key by calendars:(~(got by almanac) space)))
  =.  core  (emil (turn remote-calendars (cury leave-calendar-card space)))
  =.  almanac  (~(del by almanac) space)
  =.  core  (ui-emit:core %del-space space)
  =/  wire  (en-space-path space our.bowl)
  (emit:core [%pass wire %agent [-.space dap.bowl] %leave ~])
::
++  delete-or-leave
  |=  =space
  ^-  _core
  ?:  =(-.space our.bowl)
    (delete-space space)
  (leave-space space)
::
++  follow-many
  |=  spaces=(list space)
  ^-  _core
  ?~  spaces  core
  $(spaces t.spaces, core (follow-space:core i.spaces))
::
++  leave-many
  |=  spaces=(list space)
  ^-  _core
  ?~  spaces  core
  $(spaces t.spaces, core (leave-space:core i.spaces))
::
++  leave-and-refollow
  |=  spaces=(list space)
  ^-  _core
  %-  emit:(leave-many spaces)
  [%pass / %agent [our dap]:bowl %poke util+!>([%follow-many spaces])]
::
++  cof-many
  |=  spaces=(list space)
  ^-  _core
  ?~  spaces  core
  $(spaces t.spaces, core (create-or-follow:core i.spaces))
::
++  relay
  |=  axn=crud-action
  ^-  _core
  ?>  =(src our):bowl
  =/  =dock  [-.space.p.axn dap.bowl]
  (emit %pass / %agent dock %poke spaces-crud-action+!>(axn))
::
++  get-readable
  |=  [=space reader=ship]
  ^-  (list cid)
  =/  [=banned =calendars]  (~(got by almanac) space)
  %+  murn  ~(tap by calendars)
  |=  [=cid ship perms]
  ?.((can-read space cid reader) ~ (some cid))
::
++  get-highest-role
  |=  roles=(set role)
  ^-  (unit role)
  ?:  (~(has in roles) %admin)   (some %admin)
  ?:  (~(has in roles) %member)  (some %member)
  ?:  (~(has in roles) %guest)   (some %guest)
  ?:  (~(has in roles) %viewer)  (some %viewer)
  ~
:: Get who is allowed to see the calendar
::
++  got-readers
  |=  [=space =cid]
  ^-  (map ship role)
  =/  [=banned =calendars]   (~(got by almanac) space)
  =/  [creator=ship =perms]  (~(got by calendars) cid)
  %-  ~(gas by *(map ship role))
  %+  murn  ~(tap in (got-members space))
  |=  =ship
  ^-  (unit [^ship role])
  =;  role=(unit role)  ?~(role ~ [~ ship u.role])
  %-  get-highest-role
  %-  ~(gas in *(set role))
  %-  zing
  :~  ?.(=(ship creator) ~ ~[%admin])
      ?.((is-admin space ship) ~ ~[admins.perms])
      ?~(member.perms ~ ~[u.member.perms])
      ?~(get=(~(get by custom.perms) ship) ~ ~[u.get])
  ==
:: Check if ship is allowed to see the calendar
::
++  can-read
  |=  [=space =cid reader=ship]
  ^-  ?
  (~(has by (got-readers space cid)) reader)
:: tell readers to watch this calendar
::
++  send-watchlist
  |=  [=space =cid]
  ^-  _core
  %-  emil
  %+  murn  ~(val by sup.bowl)
  |=  [=ship =path]
  ?.  ?=([%space host=@ta name=@ta ship=@ta ~] path)  ~
  =/  [s=^space p=^ship]  (de-space-path path)
  ?.  =([s p] [space ship])  ~
  ?.  (can-read space cid ship)  ~
  =/  rxn=reaction  [%space %watchlist ~[cid]]
  (some [%give %fact ~[path] spaces-space-reaction+!>(rxn)])
:: kick people without reader perms
::
++  kick-unwelcome
  |=  [=space =cid]
  ^-  _core
  %-  emil  %-  zing
  %+  murn  ~(val by sup.bowl)
  |=  [=ship =path]
  ^-  (unit (list card))
  ?.  ?=([%calendar s-host=@t s-name=@t c-host=@t c-name=@t ~] path)  ~
  =/  [s=^space c=^cid]  (de-calendar-path path)
  ?.  =([s c] [space cid])  ~
  ?:  (can-read s c ship)  ~
  %-  some
  =/  =cage  boxes-invite-action+!>([c %kick ship])
  :~  [%pass / %agent [our.bowl %calendar] %poke cage]
      [%give %kick ~[path] `ship]
  ==
::
++  send-all-watchlist
  |=  =space
  ^-  _core
  =/  [=banned =calendars]  (~(got by almanac) space)
  =/  cids  ~(tap in ~(key by calendars))
  |-
  ?~  cids  core
  $(cids t.cids, core (send-watchlist space i.cids))
::
++  kick-all-unwelcome
  |=  =space
  ^-  _core
  =/  [=banned =calendars]  (~(got by almanac) space)
  =/  cids  ~(tap in ~(key by calendars))
  |-
  ?~  cids  core
  $(cids t.cids, core (kick-unwelcome space i.cids))
::
++  handle-calendar-watch-nack
  |=  =wire
  =/  [=space =cid]         (de-calendar-path wire)
  =/  [=banned =calendars]  (~(got by almanac) space)
  =.  calendars             (~(del by calendars) cid)
  =.  almanac               (~(put by almanac) space banned calendars)
  =.  pools                 (~(del by pools) cid)
  (ui-emit %del-calendar space cid)
::
++  handle-process-our
  |=  pro=process-our
  ^-  _core
  ?>  =(src our):bowl
  ?-    q.pro
    %del  core(our (~(del in our) p.pro))
      %put
    ?>  (has-calendar p.pro)
    core(our (~(put in our) p.pro))
  ==
::
++  handle-crud-action
  |=  axn=crud-action
  ^-  _core
  :: relay poke to host of space
  :: (poking your agent or the host's directly yields the same result)
  ::
  ?.  =(-.p.axn our.bowl)  (relay axn)
  :: assert membership in space
  ::
  ?>  (~(has in (got-members p.axn)) src.bowl)
  :: %our space is handled separately
  ::
  ?<  ?=([ship %our] p.axn)
  ?-    -.q.axn
      %banned
    :: must be spaces admin to adjust banned
    ::
    ?>  (is-admin p.axn src.bowl)
    =/  [=banned =calendars]  (~(got by almanac) p.axn)
    =.  almanac    (~(put by almanac) p.axn banned.q.axn calendars)
    =.  core  (ui-emit %banned p.axn banned.q.axn)
    :: send update
    ::
    (away-space-emil p.axn %banned banned.q.axn)
    ::
      %create
    :: assert the calendar exists
    ::
    ?>  (has-calendar cid.q.axn)
    :: assert not banned from creating
    ::
    =/  [=banned =calendars]  (~(got by almanac) p.axn)
    ?<  (~(has in banned) src.bowl)
    :: create the calendar
    ::
    =.  calendars  (~(put by calendars) cid.q.axn src.bowl perms.q.axn)
    =.  almanac    (~(put by almanac) p.axn banned calendars)
    =.  pools      (~(put by pools) cid.q.axn p.axn)
    =.  core  (ui-emit %add-calendar p.axn cid.q.axn src.bowl perms.q.axn)
    :: tell readers to watch
    ::
    (send-watchlist p.axn cid.q.axn)
    ::
      %reperm
    :: only calendar admins can reperm
    ::
    =/  =role  (~(got by (got-readers p.axn cid.q.axn)) src.bowl)
    ?>  ?=(%admin role)
    :: reperm the calendar
    ::
    =/  [=banned =calendars]   (~(got by almanac) p.axn)
    =/  [creator=ship =perms]  (~(got by calendars) cid.q.axn)
    =.  calendars  (~(put by calendars) cid.q.axn creator perms.q.axn)
    =.  almanac    (~(put by almanac) p.axn banned calendars)
    =.  core  (kick-unwelcome p.axn cid.q.axn)
    =.  core  (send-watchlist p.axn cid.q.axn)
    =.  core  (ui-emit %perms p.axn cid.q.axn perms.q.axn)
    :: send update
    ::
    (away-calendar-emit p.axn cid.q.axn %perms perms.q.axn)
    ::
      %delete
    =/  [=banned =calendars]   (~(got by almanac) p.axn)
    =/  [creator=ship =perms]  (~(got by calendars) cid.q.axn)
    :: assert space admin or creator
    ::
    ?>  |((is-admin p.axn src.bowl) =(creator src.bowl))
    :: delete the calendar from %calendar-spaces
    ::
    =.  calendars  (~(del by calendars) cid.q.axn)
    =.  almanac    (~(put by almanac) p.axn banned calendars)
    =.  pools      (~(del by pools) cid.q.axn)
    :: send ui update
    ::
    =.  core  (ui-emit %del-calendar p.axn cid.q.axn)
    %-  emil
    :~
      :: forward to %calendar
      ::
      :*  %pass  /  %agent  [our.bowl %calendar]  %poke
          calendar-action+!>([cid.q.axn %delete ~])
      ==
      :: kick all watchers
      ::
      [%give %kick ~[(en-calendar-path p.axn cid.q.axn)] ~]
    ==
  ==
::
++  handle-space-reaction
  |=  [=space rxn=space-reaction:reaction]
  ^-  _core
  ?-    -.rxn
      %banned
    =/  [banned =calendars]  (~(got by almanac) space)
    =.  almanac  (~(put by almanac) space banned.rxn calendars)
    (ui-emit %banned space banned.rxn)
    :: 
      %watchlist
    %-  emil
    %-  zing
    %+  murn  p.rxn
    |=  =cid
    =/  pite  (en-calendar-path space cid)
    ?:  (~(has by wex.bowl) pite -.space dap.bowl)  ~
    %-  some
    :~
      :: watch the calendar for perm info
      ::
      [%pass pite %agent [-.space dap.bowl] %watch pite]
      :: auto-join the calendar
      ::
      :*  %pass  /  %agent  [our.bowl %calendar]  %poke
          calendar-join-action+!>([cid %join ~])
      ==
    ==
  ==
::
++  handle-calendar-reaction
  |=  [=space =cid rxn=calendar-reaction:reaction]
  ^-  _core
  ?-    -.rxn
      %calendar
    =/  [=banned =calendars]  (~(got by almanac) space)
    =.  calendars             (~(put by calendars) cid [creator perms]:rxn)
    =.  almanac               (~(put by almanac) space banned calendars)
    =.  pools                 (~(put by pools) cid space)
    (ui-emit %add-calendar space cid [creator perms]:rxn)
    ::
      %perms
    =/  [=banned =calendars]  (~(got by almanac) space)
    =/  [creator=ship perms]  (~(got by calendars) cid)
    =.  calendars             (~(put by calendars) cid creator perms.rxn)
    =.  almanac               (~(put by almanac) space banned calendars)
    (ui-emit %perms space cid perms.rxn)
  ==
::
++  handle-spaces-reaction
  |=  rxn=reaction:s
  ^-  _core
  ?+    -.rxn  core
      %initial
    (cof-many ~(tap in (~(del in ~(key by spaces.rxn)) [our.bowl %our])))
      %add
    ?:  =([our.bowl %our] path.space.rxn)  core
    (create-or-follow path.space.rxn)
      %replace
    ?:  =([our.bowl %our] path.space.rxn)  core
    (create-or-follow path.space.rxn)
      %remote-space
    ?:  =([our.bowl %our] path.space.rxn)  core
    (create-or-follow path.space.rxn)
      %remove
    ?:  =([our.bowl %our] path.rxn)  core
    (delete-or-leave path.rxn)
  ==
::
++  handle-visas-reaction
  |=  rxn=reaction:v
  ^-  _core
  ?+    -.rxn  core
      %invite-accepted
    =.  core  (kick-all-unwelcome path.rxn)
    (send-all-watchlist path.rxn)
    ::
      %kicked
    =.  core  (kick-all-unwelcome path.rxn)
    (send-all-watchlist path.rxn)
    ::
      %edited
    =.  core  (kick-all-unwelcome path.rxn)
    (send-all-watchlist path.rxn)
  ==
::
++  sour  (scot %p our.bowl)
++  snow  (scot %da now.bowl)
++  has-spaces    .^(? %gu /[sour]/spaces/[snow]/$)
++  is-member
  |=  [=space =ship]
  ^-  ?
  =/  ship  (scot %p ship)
  =/  host  (scot %p -.space)
  =/  view 
    .^(view:m %gx /[sour]/spaces/[snow]/[host]/[+.space]/is-member/[ship]/membership-view)
  ?>(?=(%is-member -.view) is-member.view)
++  got-member
  |=  [=space =ship]
  ^-  member:m
  =/  ship  (scot %p ship)
  =/  host  (scot %p -.space)
  =/  view 
    .^(view:m %gx /[sour]/spaces/[snow]/[host]/[+.space]/members/[ship]/membership-view)
  ?>(?=(%member -.view) member.view)
++  is-admin
  |=  [=space =ship]
  ^-  ?
  =/  =member:m  (got-member space ship)
  (~(has in roles.member) %admin)
++  got-members
  |=  =space
  ^-  (set ship)
  =/  host  (scot %p -.space)
  =/  view 
    .^(view:m %gx /[sour]/spaces/[snow]/[host]/[+.space]/members/membership-view)
  ?>(?=(%members -.view) ~(key by members.view))
++  all-spaces
  ^-  (set space)
  =+  .^(=view:s %gx /[sour]/spaces/[snow]/all/spaces-view)
  ?>(?=(%spaces -.view) ~(key by spaces.view))
++  get-calendar
  |=  =cid
  ^-  calendar
  =/  host=@t  (scot %p host.cid)
  =+  .^(=peek %gx /[sour]/calendar/[snow]/calendar/[host]/[name.cid]/calendar-peek)
  ?>(?=(%calendar -.peek) calendar.peek)
:: crashes if calendar doesn't exist
::
++  has-calendar  |=(=cid `?`=-(& (get-calendar cid)))
--
