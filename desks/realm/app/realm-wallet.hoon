::
::  XX: todo - migrate wallets.state to use a mip.
::  %realm-wallet [realm]:
::
::  
::
::
/-  *realm-wallet
/+  default-agent, dbug, *realm-wallet
|%
+$  card  card:agent:gall
::
+$  versioned-state  $%(state-0)
+$  state-0  [%0 =wallets =settings]
--
%-  agent:dbug
=|  state-0
=*  state  -
^-  agent:gall
=<
  |_  =bowl:gall
  +*  this  .
      def   ~(. (default-agent this %.n) bowl)
      core   ~(. +> bowl ~)
  ::
  ++  on-init
    ^-  (quip card _this)
    =^  cards  state  abet:init:core
    [cards this]
  ::
  ++  on-save
    ^-  vase
    !>(state)
  ::
  ++  on-load
    |=  ole=vase
    =^  cards  state  abet:(load:core ole)
    [cards this]
  ::
  ++  on-poke
    |=  cag=cage
    =^  cards  state  abet:(poke:core cag)
    [cards this]
  ::
  ++  on-peek
    |=  pat=path
    ^-  (unit (unit cage))
    (peek:core pat)
  ::
  ++  on-watch
    |=  pat=path
    ^-  (quip card _this)
    =^  cards  state  abet:(peer:core pat)
    [cards this]
  ::
  ++  on-arvo   on-arvo:def
  ++  on-fail   on-fail:def
  ++  on-agent  on-agent:def
  ++  on-leave  on-leave:def
  --
|_  [bol=bowl:gall dek=(list card)]
+*  core  .
::
++  team  (team:title our.bol src.bol)
++  emit  |=(=card core(dek [card dek]))
++  emil  |=(lac=(list card) core(dek (welp lac dek)))
++  abet  ^-((quip card _state) [(flop dek) state])
::
::  XX: is this actually a jet registration?!?!?!?!?!?!?
::      i'm hella impressed tbh ngl. ne'er seen one wild
++  poke
  :: ~/  %on-poke
  |=  [mar=mark vaz=vase]
  ^+  core
  core
  :: ?+    mar  ~|(bad-realm-wallet-mark/mar !!)
  ::     %realm-wallet-action
  ::   (handle-wallet-action !<(action vase))
  :: ==
::
++  peek
  |=  pat=path
  ^-  (unit (unit cage))
  :: ?>  (team:title our.bol src.bol)
  ::  XX: you can't actually check src.bol in on-peek
  ::      on-peek has bunted bowl information to some
  ::      extent (src), because it's supposed to be a
  ::      transparent cached namespace.
  ::
  ::      once we get to remote scry, there will be a
  ::      mode whereby you can share secrets via scry
  ::      but that check wont work.
  ?+    pat  !!
      [%x %wallets ~]
    ``realm-wallet-update+!>(`update`wallets+wallets)
  ::
      [%x %settings ~]
    ``realm-wallet-update+!>(`update`settings+settings)
  ==
::  XX: note the pole knot trick here - it's basically
::      what you were already doing but easier.
++  peer
  |=  pol=(pole knot)
  ^+  core
  ?>  (team:title our.bol src.bol)
  ?+    pol  ~|(bad-realm-wallet-watch/pat !!)
    [%wallets ~]       core
    [%transactions ~]  core
  ::
      [%address network=@ from=@ ~]
    =+  from=(slav %p from.pol)
    ::  XX: hate this
    =+  netw=;;(network (scot %tas network.pol))
    %-  emit
    =-  [%pass /addr/[from.pol] %agent [from %realm-wallet] -]
    :+  %poke  %realm-wallet-action
    !>  ^-  action
    create-wallet+[our.bol netw (crip (scow %p our.bol))]
  ==
::
++  init
  ^+  core
  %=  core
    who.sharing.settings              %anybody
    wallet-creation.sharing.settings  %default
  ::
      wallets
    (~(gas by wallets) ~[ethereum+~ bitcoin+~ btctestnet+~])
  ::
      networks.settings
    (~(gas by networks.settings) ~[ethereum+`0 bitcoin+`0 btctestnet+`0])
  ==
::
++  load
  |=  ole=vase
  ^+  core
  :: ::  prod
  :: =/  old  !<(versioned-state ole)
  :: ?>  ?=(%0 -.old)
  :: core(state old)
  ::  test
  ?^  old=(mole |.(!<(state-0 ole)))
    core(state u.old)
  ~&  >>  'nuking old %realm-wallet state'
  %-  emil:init
  %+  turn  ~(tap in ~(key by wex.bol))
  |=([w=wire s=@p t=@t] [%pass w %agent [s t] %leave ~])
::
++  handle-wallet-action
  |=  act=action
  ^+  core
  ?-    -.act
      %initialize
    ::  XX: if this is not called by any other circumstance
    ::      other than on-init, suggest removing it.
    ?>  (team:title our.bol src.bol)
    %=  core
      who.sharing.settings              %anybody
      wallet-creation.sharing.settings  %default
    ::
        wallets
      (~(gas by wallets) ~[ethereum+~ bitcoin+~ btctestnet+~])
    ::
        networks.settings
      (~(gas by networks.settings) ~[ethereum+`0 bitcoin+`0 btctestnet+`0])
    ==
  ::
      %set-xpub
    ?>  (team:title our.bol src.bol)
    =+  net=(~(got by networks.settings) network.act)
    ::  XX: formerly, here, you had some complex check
    ::      and a call to `got:by` of wallets, unused.
    ::      i've incorporated those checks here. maybe
    ::      i didn't understand the intent of `got:by`
    ::      net-wallets. my sincerest apologies, if so
    ::     
    %=    core
        wallets
      ?.  ?&  !=(~ xpub.net)
              !=(xpub.act (need xpub.net))
              (~(has by networks.settings) network.act)
          ==
        wallets
      (~(put by wallets) network.act ~)
    ::
        networks.settings
      =.  xpub.net  `xpub.act
      (~(put by networks.settings) network.act net)
    ==
  ::
      %set-settings
    ?>  (team:title our.bol src.bol)
    =+  net=(~(got by networks.settings) network.act)
    %=    core
      who.sharing.settings              who.act
      blocked.sharing.settings          blocked.act
      wallet-creation.sharing.settings  mode.act
    ::
        networks.settings
      %-  ~(put by networks.settings)
      [network.act net(default-index share-index.act)]
    ==
  ::
        %set-wallet-creation-mode
      ?>(team core(wallet-creation.sharing.settings mode.act))
  ::
        %set-sharing-mode
      ?>(team core(who.sharing.settings who.act))
  ::
      %set-sharing-permissions
    ?>  (team:title our.bol src.bol)
    ::  XX: removed assertion of %block - will re-add if
    ::      type affords for additional types - sorry.
    %=    core
        blocked.sharing.settings
      (~(put in blocked.sharing.settings) who.act)
    ==
  ::
      %set-default-index
    ?>  (team:title our.bol src.bol)
    =+  net=(~(got by networks.settings) network.act)
    %=    core
        networks.settings
      %-  ~(put by networks.settings.state)
      [network.act [xpub.net index.act]]
    ==
  ::
      %set-wallet-nickname
    ?>  (team:title our.bol src.bol)
    =+  lines=(~(got by wallets.state) network.act)
    =+  line=(~(got by lines) index.act)
    %=    core
        wallets
      %+  ~(put by wallets)  network.act
      (~(put by lines) index.act line(nickname nickname.act))
    ==
  ::
      %create-wallet
    ::  permissions?
    |^  ^+  core
      ::  XX: describing the following conditions in the
      ::      comments would make servicing this easier.
      ::    
      ?:  =(%nobody who.sharing.settings)
        (emit null)
      ?:  (~(has in blocked.sharing.settings) src.bol)
        (emit null)
      ?:  &(!(fren src.bol) =(%friends who.sharing.settings))
        (emit null)
      ?:  ?&  !(team:title our.bol src.bol)
              =(%default wallet-creation.sharing.settings)
              !=(0 (lent ~(tap by (~(got by wallets) network.act))))
          ==
        =/  defo=(unit wallet)
          %-  ~(get by (~(got by wallets) network.act))
          default-index:(~(got by networks.settings) network.act)
        ?~  defo
          %-  emit
          =-  [%pass frap %agent dock %poke -]
          :-  %realm-wallet-action
          !>(`action`receive-address+[network.act ~])
          ::
        %-  emit
        =-  [%pass frap %agent dock %poke -]
        :-  %realm-wallet-action
        !>  ^-  action
        receive-address+[network.act `address.u.defo]
        ::
      ::  create a new wallet
      =+  idx=(lent ~(tap by (~(got by wallets.state) network.act)))
      =+  (wall network.act nickname.act idx)
      ?~  wallut
        ?>  (team:title our.bol src.bol)
        ~&  >>  'requested wallet with no xpub set'
        %-  emit
        =-  [%pass frap %agent dock %poke -]
        :-  %realm-wallet-action
        !>(`action`receive-address+[network.act ~])
      ::  XX: please confirm i got this logic right
      =/  cu=_core
        =-  (emit [%give %fact [/wallets]~ -])
        :-  %realm-wallet-update
        !>(`update`wallet+[network.act (scot %ud idx) u.wallut])
      ?:  (team:title our.bol src.bol)  cu
      %-  emit:cu
      =-  [%pass frap %agent dock %poke -]
      :-  %realm-wallet-action
      !>  ^-  action
      receive-address+[network.act `address.u.wallut]
    ::
    ++  dock
      ^-  (pair ship dude:gall)
      [src.bol %realm-wallet]
    ++  frap
      ^-  path  :: frap - friend path
      /addr/(scot %p src.bol)
    ++  null
      ^-  card
      =-  [%pass frap %agent dock %poke -]
      realm-wallet-action+!>(`action`receive-address+[network.act ~])
    ++  fren
      ^-  $-(@p ?)
      |=  p=@p
      =-  (~(has in -) p)
      .^  (set @p)
        %gx
        /(scot %p our.bol)/friends/(scot %da now.bol)/ships/noun
      ==
    ++  wall
      |=  [net=network nic=@t id=@ud]
      ^-  [wallut=(unit wallet) cure=_core]
      =+  xpub=xpub:(~(got by networks.settings) network.act)
      ?~  xpub  [~ core]
      =+  info=(new-address u.xpub network.act id)
      ~&  >  (crip (weld "generated wallet addres " (z-co:co -.info)))
      =+  neux=`wallet`[-.info +.info nic ~]
      :-  `neux
      %=    core
          wallets
        %+  ~(put by wallets)  net
        (~(put by (~(got by wallets) net)) id neux)
      ==
    --
  ::
      %request-address
    %-  emit
    =-  [%pass /addr/(scot %p from.act) %agent [from.act %realm-wallet] %poke -]
    :-  %realm-wallet-action
    !>(`action`create-wallet+[our.bol network.act (crip (scow %p our.bol))])
  ::
      %receive-address
    ::  XX: what we're doing with paths here raises my
    ::      hackles to some degree. this path strikes me
    ::      as a weak point which may fail. suggest scot
    =+  pat=/address/[(crip (scow %tas network.act))]/[(crip (scow %p src.bol))]
    %-  emil
    :~  =-  [%give %fact [pat]~ realm-wallet-update+-]
        !>(`update`address+[src.bol network.act address.act])
      ::
        [%give %kick [pat]~ ~]
    ==
  ::
      %set-transaction
    =+  tid=(rap 3 ~[%realm-wallet '--' (scot %uv eny.bol)])
    =+  net-map=(~(got by wallets) network.act)
    =+  ole-wal=(~(got by net-map) wallet.act)
    =.  transactions.ole-wal
      %+  ~(put by transactions.ole-wal)  net.act
      ^-  (map @t transaction)
      %.  [hash.transaction.act transaction.act]~
      ?~(m=(~(get by transactions.ole-wal) net.act) my ~(gas by u.m))
    =.  net-map  (~(put by net-map) wallet.act ole-wal)
    ?~  their-patp.transaction.act  !!
    =;  cad=card
      %.  cad
      emit(wallets (~(put by wallets) network.act net-map))
    ?.  (team:title our.bol src.bol)
      =-  [%give %fact [/transactions]~ -]
      :-  %realm-wallet-update
      !>  ^-  update
      transaction+[network.act net.act wallet.act hash.act transaction.act]
    =.  transaction.act
      %=    transaction.act
        type           %received
        their-patp     `our.bol
        our-address    their-address.transaction.act
        their-address  our-address.transaction.act
      ==
    =-  [%pass /addr/(scot %p u.their-patp.transaction.act) -]
    :^  %agent  [u.their-patp.transaction.act %realm-wallet]  %poke
    :-  %realm-wallet-action
    !>  ^-  action
    set-transaction+[network.act net.act wallet.act hash.act transaction.act]
  ::
      %save-transaction-notes
    ::  XX: this is a very confusing pattern. resolution
    ::      would require some deal more editing, review
    =+  net-map=(~(got by wallets) %ethereum)
    =+  wal-map=(~(got by net-map) wallet.act)
    =+  nmap=(~(get by transactions.wal-map) net.act)
    =|  tx=transaction
    =.  tx
      ?~  nmap  tx(hash hash.act)
      ?^(hmap=(~(get by u.nmap) hash.act) u.hmap tx(hash hash.act))
    =.  notes.tx  notes.act
    =/  have
      ?~(nmap (my [hash.act tx]~) (~(put by u.nmap) hash.act tx))
    =.  transactions.wal-map  (~(put by transactions.wal-map) net.act have)
    =.  net-map  (~(put by net-map) [wallet.act wal-map])
    %-  emit(wallets (~(put by wallets) %ethereum net-map))
    =-  [%give %fact [/transactions]~ -]
    :-  %realm-wallet-update
    !>  ^-  update
    transaction+[%ethereum net.act wallet.act hash.act tx]
  ==
--