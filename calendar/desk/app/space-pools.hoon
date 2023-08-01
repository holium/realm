:: The space host hosts "subspaces" or space-pools
:: whose membership is a subset of the space membership
::
/-  *space-pools, m=membership, v=visas
/+  vio=ventio, dbug, verb, default-agent
:: import to force compilation during testing
::
/=  r-  /mar/spaces/reaction
/=  c-  /mar/spaces/crud-action
/=  u-  /mar/spaces/util-action
/=  p-  /mar/spaces/pools-peek
/=  p-  /lib/calendar-spaces-json
|%
+$  state-0  [%0 space-pools=(map space apps)]
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
  :: I don't remember why we leave and refollow old spaces....
  ::
  =/  remote-spaces
    %+  murn  ~(tap in ~(key by space-pools))
    |=(=space ?:(=(-.space our.bowl) ~ (some space)))
  =^  cards  state
    abet:(leave-and-refollow:hc remote-spaces)
  :_  this
  %+  welp  cards
  :: follow spaces updates if you haven't already
  ::
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
  ==
::
++  on-watch
  |=  =(pole knot)
  ^-  (quip card _this)
  ?+    pole  (on-watch:def pole)
    [%vent @ @ ~]  `this
      [%space host=@t name=@t reader=@t ~]
    =/  [=space reader=ship]  (de-space-path pole)
    :: assert we are the space host
    ::
    ?>  =(-.space our.bowl)
    :: assert the reader is who they say they are
    ::
    ?>  =(reader src.bowl)
    :: assert the reader is a member of the space
    ::
    ?>  (is-member:hc space src.bowl)
    ::
    =/  rxn=reaction
      [%space %watchlist (get-readable:hc space reader)]
    :_(this [%give %fact ~ spaces-reaction+!>(rxn)]~)
  ==
::
++  on-leave  on-leave:def
++  on-peek   on-peek:def
::
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
      ?.  ?=(%space-pools-update p.cage.sign)  (on-agent:def pole sign)
      =+  !<(upd=update q.cage.sign)
      =^  cards  state
        abet:(handle-update:hc space upd)
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
++  en-space-path
  |=  [=space reader=ship]
  /space/(scot %p -.space)/[+.space]/(scot %p reader)
++  de-space-path
  |=  =(pole knot)
  ^-  [space reader=ship]
  ?>  ?=([%space host=@t name=@t reader=@t ~] pole)
  [[(slav %p host) name] (slav %p reader)]:[pole .]
::
++  create-space
  |=  =space
  ^-  _core
  ?>  =(-.space our.bowl)
  ?:  (~(has by space-pools) space)  core
  core(space-pools (~(put by space-pools) space ~))
::
++  follow-space
|=  =space
^-  _core
?<  =(-.space our.bowl)
=/  pite  (en-space-path space our.bowl)
?:  (~(has by wex.bowl) pite -.space dap.bowl)  core
=.  space-pools   (~(put by space-pools) space ~)
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
  ?.  (~(has by space-pools) space)  core
  core(space-pools (~(del by space-pools) space))
::
++  leave-space
  |=  =space
  ^-  _core
  ?<  =(-.space our.bowl)
  =.  space-pools  (~(del by space-pools) space)
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
:: Check if ship is allowed to see the pool
::
++  can-read
  |=  [=space =app =id:p reader=ship]
  ^-  ?
  =/  =path  /space-pools/reader-gate
  =+  :(weld /(scot %p our.bowl)/[app]/(scot %da now.bowl) path /noun)
  (.^(reader-gate %gx -) id reader)
:: Check if ship is allowed to create a pool
::
++  can-make
  |=  [=space =app creator=ship]
  ^-  ?
  =/  =path  /space-pools/creator-gate
  =+  :(weld /(scot %p our.bowl)/[app]/(scot %da now.bowl) path /noun)
  (.^(creator-gate %gx -) space creator)
:: space members who can read
::
++  got-readers
  |=  [=space =app =id:p]
  %+  turn  ~(tap in (got-members space))
  |=(=ship (can-read space app id ship))
:: pools which a space member can read in a space
::
++  get-readable
  |=  [=space =app reader=ship]
  ^-  (list id:p)
  =/  =apps  (~(got by space-pools) space)
  %+  murn  ~(tap in (~(get ju apps) app))
  |=(=id:p ?.((can-read space app id reader) ~ (some id)))
::
++  send-pool-list
  |=  [=space =app =id:p]
  ^-  _core
  %-  emil
  :: iterate over incoming subs
  ::
  %+  murn  ~(val by sup.bowl)
  |=  [=ship =path]
  :: ignore non-space subs
  ::
  ?.  ?=([%space host=@ta name=@ta ship=@ta ~] path)  ~
  =/  [s=^space p=^ship]  (de-space-path path)
  :: ignore subs for other spaces
  ::
  ?.  =([s p] [space ship])  ~
  :: ignore ships who can't read this pool
  ::
  ?.  (can-read space app id ship)  ~
  :: give a reader the app and id
  ::
  (some [%give %fact ~[path] space-pools-update+!>([app id]~)])
:: kick people without reader perms
::
++  kick-unwelcome
  |=  [=space =app =id:p]
  ^-  _core
  %-  emil  %-  zing
  :: iterate over incoming subs
  ::
  %+  murn  ~(val by sup.bowl)
  |=  [=ship =path]
  ^-  (unit (list card))
  ?:  (can-read space app id ship)  ~
  %-  some
  :~
      [%give %kick ~[path] `ship]
      =/  =cage  pools-invite-command+!>([id %kick ship])
      [%pass / %agent [our.bowl %calendar] %poke cage]
  ==
::
++  send-all-pool-list
  |=  =space
  ^-  _core
  =/  =apps     (~(got by space-pools) space)
  =/  app-list  ~(tap in ~(key by apps))
  |-  ?~  app-list  core
  =/  id-list   ~(tap in (~(got by apps) i.app-list))
  |-  ?~  id-list  ^$(app-list t.app-list)
  $(id-list t.id-list, core (send-pool-list space i.app-list i.id-list))
::
++  kick-all-unwelcome
  |=  =space
  ^-  _core
  =/  [=banned =calendars]  (~(got by space-pools) space)
  =/  cids  ~(tap in ~(key by calendars))
  |-
  ?~  cids  core
  $(cids t.cids, core (kick-unwelcome space i.cids))
::
++  handle-update
  |=  [=space upd=update]
  ^-  _core
  ?~  upd  core
  =/  =apps        (~(got by space-pools) space)
  =.  apps         (~(put ju apps) i.upd)
  =.  space-pools  (~(put by space-pools) space apps)
  $(upd t.upd)
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
    (send-all-pool-list path.rxn)
    ::
      %kicked
    =.  core  (kick-all-unwelcome path.rxn)
    (send-all-pool-list path.rxn)
    ::
      %edited
    =.  core  (kick-all-unwelcome path.rxn)
    (send-all-pool-list path.rxn)
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
++  got-members
  |=  =space
  ^-  (set ship)
  =/  host  (scot %p -.space)
  =/  view 
    .^(view:m %gx /[sour]/spaces/[snow]/[host]/[+.space]/members/membership-view)
  ?>(?=(%members -.view) ~(key by members.view))
--
