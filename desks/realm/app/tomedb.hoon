::  Tome DB - a Holium collaboration
::  by ~larryx-woldyr
::  see https://holium.gitbook.io/tomedb/ for docs
::   
/-  *tomedb, s-p=spaces-path, m=membership
/+  verb, dbug, defa=default-agent
/+  *mip
::
|%
::
+$  versioned-state  $%(state-0)
::
+$  state-0  [%0 =realm-kv tome=(mip path:s-p app tome-data) subs=(set path)] :: subs is data paths we are subscribed to
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
      def  ~(. (defa this %|) bowl)
      eng   ~(. +> [bowl ~])
  ++  on-init
    ^-  (quip card _this)
    ~>  %bout.[0 '%tomedb +on-init']
    =^  cards  state
      abet:init:eng
    [cards this]
  ::
  ++  on-save
    ^-  vase
    ~>  %bout.[0 '%tomedb +on-save']
    !>(state)
  ::
  ++  on-load
    |=  ole=vase
    ~>  %bout.[0 '%tomedb +on-load']
    ^-  (quip card _this)
    =^  cards  state
      abet:(load:eng ole)
    [cards this]
  ::
  ++  on-poke
    |=  cag=cage
    ~>  %bout.[0 '%tomedb +on-poke']
    ^-  (quip card _this)
    =^  cards  state  abet:(poke:eng cag)
    [cards this]
  ::
  ++  on-peek
    |=  =path
    ~>  %bout.[0 '%tomedb +on-peek']
    ^-  (unit (unit cage))
    [~ ~]
    :: (peek:eng path)
  ::
  ++  on-agent
    |=  [pol=(pole knot) sig=sign:agent:gall]
    ~>  %bout.[0 '%tomedb +on-agent']
    ^-  (quip card _this)
    =^  cards  state  abet:(dude:eng pol sig)
    [cards this]
  ::
  ++  on-arvo
    |=  [wir=wire sig=sign-arvo]
    ~>  %bout.[0 '%tomedb +on-arvo']
    ^-  (quip card _this)
    `this
  ::
  ++  on-watch
  |=  =path
  ~>  %bout.[0 '%tomedb +on-watch']
  ^-  (quip card _this)
  =^  cards  state  abet:(watch:eng path)
  [cards this]
  ::
  ++  on-fail
    ~>  %bout.[0 '%tomedb +on-fail']
    on-fail:def
  ::
  ++  on-leave
    ~>  %bout.[0 '%tomedb +on-leave']
    on-leave:def
  --
|_  [bol=bowl:gall dek=(list card)]
+*  dat  .
++  emit  |=(=card dat(dek [card dek]))
++  emil  |=(lac=(list card) dat(dek (welp lac dek)))
++  abet
  ^-  (quip card _state)
  [(flop dek) state]
::
++  init
  ^+  dat
  dat
::
++  load
  |=  vaz=vase
  ^+  dat
  ?>  ?=([%0 *] q.vaz)
  dat(state !<(state-0 vaz))
::  +watch: handle on-watch
::
++  watch
  |=  pol=(pole knot)
  ^+  dat
  ?+    pol  ~|(bad-watch-path/pol !!)
      [%kv ship=@ space=@ app=@ bucket=@ rest=*]
    =/  ship   `@p`(slav %p ship.pol)
    =/  space  (woad space.pol)
    =^  cards  state
      kv-abet:(kv-watch:(kv-abed:kv [ship space app.pol bucket.pol]) rest.pol)
    (emil cards)
  ::
  ::  %since: get all updates from now on (used by Realm, in coordination with scry.)
  ::
      :: [%kv ~]
    
  ::
  ==
::  +dude: handle on-agent
::
++  dude
  |=  [pol=(pole knot) sig=sign:agent:gall]
  ^+  dat
  =^  cards  state
    ?+    pol  ~|(bad-dude-wire/pol !!)
      :: ship-to-ship update (by bucket)
      ::
        [%kv ship=@ space=@ app=@ bucket=@ rest=*]
      ::
      =/  ship  `@p`(slav %p ship.pol)
      ?+  -.sig  `state
        %fact  kv-abet:(kv-dude:(kv-abed:kv [ship space.pol app.pol bucket.pol]) cage.sig)
      ::
          %kick
        =.  subs  (~(del in subs) pol)
        kv-abet:(kv-view:(kv-abed:kv [ship space.pol app.pol bucket.pol]) rest.pol)
      ::
          %watch-ack
        ?+    rest.pol  ~|(bad-kv-watch-ack-path/rest.pol !!)
            [%data %all ~]
          ?~  p.sig
            ::  sub success, store that we're subscribed
            =.  subs  (~(put in subs) pol)
            `state
          ((slog leaf/"kv-watch nack" ~) `state)          
        ::
            [%perm ~]
          %.  `state
          ?~(p.sig same (slog leaf/"kv-watch nack" ~))
        ::
        ==
      ::
      ==
    ::
    ==
  (emil cards)
::  +poke: handle on-poke
::
++  poke
  |=  [mar=mark vaz=vase]
  ^+  dat
  =^  cards  state
    ?+    mar  ~|(bad-tome-mark/mar !!)
        %tomedb-action
      =/  act     !<(tomedb-action vaz)
      =/  ship    `@p`(slav %p ship.act)
      ?-    -.act
          %init-tome
        ?.  =(our.bol src.bol)  ~|('no-foreign-init-tome' !!)
        ?:  (~(has bi tome) [ship space.act] app.act)
          `state
        `state(tome (~(put bi tome) [ship space.act] app.act *tome-data))
      ::
      ::  the following init pokes expect an %init-tome to already have been done.
          %init-kv
        ?.  =(our.bol src.bol)  ~|('no-foreign-init-kv' !!)
        =+  tod=(~(got bi tome) [ship space.act] app.act)
        ?:  (~(has by store.tod) bucket.act)
          `state
        =.  store.tod  (~(put by store.tod) bucket.act [perm.act *invited *kv-meta *kv-data])
        `state(tome (~(put bi tome) [ship space.act] app.act tod))
      ::
      ==
    ::
        %tomedb-kv-action
      =/  act   !<(tomedb-kv-action vaz)
      =/  ship  `@p`(slav %p ship.act)
      =*  do    kv-abet:(kv-poke:(kv-abed:kv [ship space.act app.act bucket.act]) act)
      ?-  -.act
        %set-value     do
        %remove-value  do
        %clear-kv      do
        %verify-kv     do
          %perm-kv
        ?.  =(our.bol ship)  ~|('no-perm-foreign-kv' !!)
        do
          %invite-kv
        ?.  =(our.bol ship)  ~|('no-invite-foreign-kv' !!)
        do
          %team-kv
        ?:  =(our.bol ship)  ~|('no-team-local-kv' !!)
        kv-abet:(kv-view:(kv-abed:kv [ship space.act app.act bucket.act]) [%perm ~])
          %watch-kv
        ?:  =(our.bol ship)  ~|('no-watch-local-kv' !!)
        kv-abet:(kv-view:(kv-abed:kv [ship space.act app.act bucket.act]) [%data %all ~])
      ==
    ::
    ==
  (emil cards)
::  +peek: handle on-peek
::
:: ++  peek
::   |=  pol=(pole knot)
::   ^-  (unit (unit cage))
::   ?+    pol  ~|(bad-tome-peek-path/pol !!)
::       [%x %kv ship=@ space=@ app=@ bucket=@ rest=*]
::     =/  ship   `@p`(slav %p ship.pol)
::     =/  space  (woad space.pol)
::     (kv-peek:(kv-abed:kv [ship space app.pol bucket.pol]) rest.pol)
::   ::
::   ==
::
::  +kv: keyvalue engine
::
++  kv
  |_  $:  shi=ship
          spa=space
          =app
          buc=bucket
          tod=tome-data
          per=perm
          inv=invited
          meta=kv-meta
          data=kv-data
          caz=(list card)
          data-pax=path
          perm-pax=path
      ==
  +*  kv  .
  ++  kv-emit  |=(c=card kv(caz [c caz]))
  ++  kv-emil  |=(lc=(list card) kv(caz (welp lc caz)))
  ++  kv-abet
    ^-  (quip card _state)
    =.  store.tod  (~(put by store.tod) buc [per inv meta data])
    [(flop caz) state(tome (~(put bi tome) [shi spa] app tod))]
  ::  +kv-abed: initialize nested core.  only works when the map entries already exist
  ::
  ++  kv-abed
    |=  [p=ship s=space a=^app b=bucket]
    =/  tod       (~(got bi tome) [p s] a)
    =/  sto       (~(got by store.tod) b)
    =/  pp        `@tas`(scot %p p)
    =/  suv       (wood s)
    %=  kv
      shi       p
      spa       s
      app       a
      buc       b
      tod       tod
      per       perm.sto
      inv       invites.sto
      meta      meta.sto
      data      data.sto
      data-pax  /kv/[pp]/[suv]/[a]/[b]/data/all
      perm-pax  /kv/[pp]/[suv]/[a]/[b]/perm
    ==
  ::  +kv-dude: handle foreign kv updates (facts)
  ::
  ++  kv-dude
    |=  cag=cage
    ^+  kv
    ?<  =(our.bol shi)
    ?+    p.cag  ~|('bad-kv-dude' !!)
        %tomedb-kv-reaction
      =/  upd       !<(tomedb-kv-reaction q.cag)
      ?-    -.upd   ::  ~|('bad-tomedb-kv-reaction' !!)
          %set
        %=  kv
          data  (~(put by data) key.upd value.upd)
          caz   [[%give %fact ~[data-pax] %tomedb-kv-reaction !>(upd)] caz]
        ==
      ::
          %remove
        %=  kv
          data  (~(del by data) key.upd)
          caz   [[%give %fact ~[data-pax] %tomedb-kv-reaction !>(upd)] caz]
        ==
      ::
          %clear
        %=  kv
          data  *kv-data
          caz   [[%give %fact ~[data-pax] %tomedb-kv-reaction !>(upd)] caz]
        ==
      ::
          %all
        %=  kv
          data  data.upd
          caz   [[%give %fact ~[data-pax] %tomedb-kv-reaction !>(upd)] caz]
        ==
      ::
          %perm
        =/  lc  :~  [%give %fact ~[perm-pax] %tomedb-kv-reaction !>(upd)]
                    [%pass perm-pax %agent [shi %tomedb] %leave ~]
                ==
        %=  kv
          per   [read=%yes +.upd]
          caz   (welp lc caz)
        ==
      ::
      ==
    ==
  ::  +kv-watch: handle incoming kv watch requests
  ::
  ++  kv-watch
    |=  rest=(pole knot)
    ^+  kv
    ?>  (kv-perm %read)
    ?+    rest  ~|(bad-kv-watch-path/rest !!)
        [%perm ~]
      %-  kv-emit
      [%give %fact ~ %tomedb-kv-reaction !>(`tomedb-kv-reaction`kv-team)]
    ::
        [%data %all ~]
      %-  kv-emit
      [%give %fact ~ %tomedb-kv-reaction !>(`tomedb-kv-reaction`[%all data])]
    ::
    ==
  ::  +kv-poke: handle kv poke requests
  ::  cm = current metadata
  ::  nm = new metadata
  ::
  ++  kv-poke
    |=  act=tomedb-kv-action
    ^+  kv
    ::  right now live updates only go to the subscribeAll endpoint
    ?+    -.act  ~|('bad-tomedb-kv-action' !!)
        %set-value
      =+  cm=(~(gut by meta) key.act ~)
      =*  lvl
        ?~  cm
          %create
        ?:(=(src.bol created-by.cm) %create %overwrite)
      ?>  (kv-perm lvl)
      ::  equivalent value is already set, do nothing.
      ?:  =(value.act (~(gut by data) key.act ~))  kv
      ::
      =/  nm
        ?~  cm
          ::  this value is new, so create new metadata entry alongside it
          [src.bol now.bol]
        ::  this value already exists, so update its metadata
        [created-by.cm now.bol]
      ::
      %=  kv
        meta  (~(put by meta) key.act nm)
        data  (~(put by data) key.act value.act)
        caz   [[%give %fact ~[data-pax] %tomedb-kv-reaction !>(`tomedb-kv-reaction`[%set key.act value.act])] caz]
      ==
    ::
        %remove-value
      =+  cm=(~(gut by meta) key.act ~)
      =*  lvl
        ?~  cm
          %create
        ?:(=(src.bol created-by.cm) %create %overwrite)
      ?>  (kv-perm lvl)
      :: value doesn't exist, do nothing
      ?~  cm
        kv
      ::
      %=  kv
        meta  (~(del by meta) key.act)
        data  (~(del by data) key.act)
        caz   [[%give %fact ~[data-pax] %tomedb-kv-reaction !>(`tomedb-kv-reaction`[%remove key.act])] caz]
      ==
    ::
        %clear-kv
      ::  could check if all values are ours for %create perm level, but that's overkill
      ?>  (kv-perm %overwrite)
      ?~  meta  kv  :: nothing to clear
      %=  kv
        meta  *kv-meta
        data  *kv-data
        caz   [[%give %fact ~[data-pax] %tomedb-kv-reaction !>(`tomedb-kv-reaction`[%clear ~])] caz]
      ==
    ::
        %verify-kv
      :: The bucket must exist to get this far, so we just need to verify read permissions.
      ?>  (kv-perm %read)
      kv
    ::
        %perm-kv
      :: force everyone to re-subscribe
      kv(per perm.act, caz [[%give %kick ~[data-pax] ~] caz])
    ::
        %invite-kv
      =/  guy  `@p`(slav %p guy.act)
      %=  kv
        inv  (~(put by inv) guy level.act)
        caz  [[%give %kick ~[data-pax] `guy] caz]
      ==
    ::
    ==
  ::  +kv-peek: handle kv peek requests
  ::
  :: ++  kv-peek
  ::   |=  rest=(pole knot)
  ::   ^-  (unit (unit cage))
  ::   ::  no perms check since no remote scry
  ::   ?+    rest  ~|(bad-kv-peek-path/rest !!)
  ::       [%data %all ~]
  ::     ``tomedb-kv-reaction+!>(`tomedb-kv-reaction`[%all data])
  ::   ::
  ::       [%data %key key=@t ~]
  ::     ``tomedb-kv-reaction+!>(`tomedb-kv-reaction`[%get (~(gut by data) key.rest ~)])
  ::   ::
  ::   ==
  ::  +kv-view: start watching foreign kv (permissions or path)
  ::
  ++  kv-view
    |=  rest=(pole knot)
    ^+  kv
    ?+    rest  ~|(bad-kv-watch-path/rest !!)
        [%perm ~]
      (kv-emit [%pass perm-pax %agent [shi %tomedb] %watch perm-pax])
    ::
        [%data %all ~]
      ?:  (~(has in subs) data-pax)  kv
      (kv-emit [%pass data-pax %agent [shi %tomedb] %watch data-pax])
    ::
    ==
  ::  +kv-perm: check a permission level, return true if allowed
  ::
  ++  kv-perm
    |=  [lvl=?(%read %create %overwrite)]
    ^-  ?
    ?:  =(src.bol our.bol)  %.y :: always allow local
    =/  bro  (~(gut by inv) src.bol ~)
    ?-    lvl
        %read
      ?~  bro
        ?-  read.per
          %unset    %.n
          %no       %.n
          %our      %.n :: it's not us, so no.
          %open     %.y
          %yes      %.y
            %space
          =/  memb  .^(view:m %gx /(scot %p our.bol)/spaces/(scot %da now.bol)/(scot %p shi)/[spa]/is-member/(scot %p our.bol)/noun)
          ?>  ?=(%is-member -.memb)
          is-member.memb
        ==
      :: use invite level to determine
      ?:(?=(%block bro) %.n %.y)
    ::
        %create
      ?~  bro
        ?-  write.per
          %unset    %.n
          %no       %.n
          %our      %.n
          %open     %.y
          %yes      %.y
            %space
          =/  memb  .^(view:m %gx /(scot %p our.bol)/spaces/(scot %da now.bol)/(scot %p shi)/[spa]/is-member/(scot %p our.bol)/noun)
          ?>  ?=(%is-member -.memb)
          is-member.memb
        ==
      ?:(?=(?(%block %read) bro) %.n %.y)
    ::
        %overwrite
      ?~  bro
        ?-  admin.per
          %unset    %.n
          %no       %.n
          %our      %.n
          %open     %.y
          %yes      %.y
            %space
          =/  memb  .^(view:m %gx /(scot %p our.bol)/spaces/(scot %da now.bol)/(scot %p shi)/[spa]/is-member/(scot %p our.bol)/noun)
          ?>  ?=(%is-member -.memb)
          is-member.memb
        ==
      ?:(?=(?(%block %read %write) bro) %.n %.y)
    ::
    ==
  ::  +kv-team: get write/admin permissions for a ship
  ::
  ++  kv-team
    =/  write   ?:((kv-perm %create) %yes %no)
    =/  admin   ?:((kv-perm %overwrite) %yes %no)
    [%perm write admin]
  ::
  --
::
--