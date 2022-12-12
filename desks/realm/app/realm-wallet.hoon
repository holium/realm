/-  *realm-wallet
/+  default-agent, dbug, *realm-wallet
^-  agent:gall
::
=>
  |%
  +$  card  card:agent:gall
  +$  versioned-state
    $%  state-0
    ==
  +$  state-0
    $:  %0
        =wallets
        =settings
    ==
  --
=|  state-0
=*  state  -
=<
  %-  agent:dbug
  |_  =bowl:gall
  +*  this  .
      def   ~(. (default-agent this %.n) bowl)
      core   ~(. +> [bowl ~])
  ::
  ++  on-init
    ^-  (quip card _this)
    :-  [%pass /init-wallet %agent [our.bowl %realm-wallet] %poke %realm-wallet-action !>([%initialize ~])]~
    this
  ::
  ++  on-save
    ^-  vase
    !>(state)
  ::
  ++  on-load
    |=  =vase
    ^-  (quip card:agent:gall agent:gall)
    =/  old=(unit state-0)
      (mole |.(!<(state-0 vase)))  
    ?^  old
      `this(state u.old)
    ~&  >>  'nuking old %realm-wallet state' ::  temporarily doing this for making development easierr
    =^  cards  this  on-init
    :_  this
    =-  (welp - cards)
    %+  turn  ~(tap in ~(key by wex.bowl))
    |=  [=wire =ship =term] 
    ^-  card
    [%pass wire %agent [ship term] %leave ~]
    :: |=  old-state=vase
    :: ^-  (quip card _this)
    :: =/  old  !<(versioned-state old-state)
    :: ?-  -.old
    ::   %0  `this(state old)
    :: ==
  ::
  ++  on-poke
    |=  [=mark =vase]
    ^-  (quip card _this)
    ?+  mark  (on-poke:def mark vase)
        %realm-wallet-action
      =^  cards  state
        ^-  (quip card _state)
        (handle-wallet-action:core !<(action vase))
      [cards this]
    ==
  ++  on-watch
    |=  =path
    ^-  (quip card _this)
    ?>  (team:title our.bowl src.bowl)
    ?+  path  (on-watch:def path)
        [%address =network from=@ta ~]
      =/  [%address =network from=@ta ~]  path
      =/  from=@p  (slav %p from)
      =/  wall-act=action  [%create-wallet our.bowl network (crip (scow %p our.bowl))]
      =/  task  [%poke %realm-wallet-action !>(`action`wall-act)]
      :-  [%pass /addr/(scot %p from) %agent [from dap.bowl] task]~
      this
        [%updates ~]
      :_  this
      :~  [%give %fact [/updates]~ %realm-wallet-update !>(`update`[%wallets wallets.state])]
          [%give %fact [/updates]~ %realm-wallet-update !>(`update`[%settings settings.state])]
      ==
    ==
  ++  on-leave  on-leave:def
  ++  on-peek
    |=  =path
    ^-  (unit (unit cage))
    ?>  (team:title our.bowl src.bowl)
    ?+    path  (on-peek:def path)
        [%x %wallets ~]
      :^  ~  ~  %realm-wallet-update
      !>  ^-  update
      [%wallets wallets.state]
        [%x %settings ~]
      :^  ~  ~  %realm-wallet-update
      !>  ^-  update
      [%settings settings.state]
    ==
  ++  on-agent  on-agent:def
  ++  on-arvo   on-arvo:def
  ++  on-fail   on-fail:def
  --
|_  [=bowl:gall cards=(list card)]
::
++  core  .
++  handle-wallet-action
  |=  act=action
  ^-  (quip card _state)
  ?-  -.act
      %initialize
    ?>  (team:title our.bowl src.bowl)
    =.  wallets.state
      (~(put by wallets.state) [%ethereum ~])
    =.  wallets.state
      (~(put by wallets.state) [%bitcoin ~])
    =.  wallets.state
      (~(put by wallets.state) [%btctestnet ~])
    =/  default-net-settings  [~ 0 %anybody %default]
    =.  networks.settings.state
      (~(put by networks.settings.state) [%ethereum default-net-settings])
    =.  networks.settings.state
      (~(put by networks.settings.state) [%bitcoin default-net-settings])
    =.  networks.settings.state
      (~(put by networks.settings.state) [%btctestnet default-net-settings])
    `state
    ::
      %set-xpub
    ?>  (team:title our.bowl src.bowl)
    =/  net  (~(got by networks.settings.state) network.act)
    =?  wallets
        ?&  !=(~ xpub.net)
            ?~  xpub.net
              !!
            !=(xpub.act u.xpub.net)
        ==
      =/  net-wallets  (~(got by wallets) network.act)
      (~(put by wallets) [network.act ~])
    =.  networks.settings.state
      =/  net  (~(got by networks.settings.state) network.act)
      =.  xpub.net  `xpub.act
      (~(put by networks.settings.state) [network.act net])
    `state
    ::
      %set-network-settings
    ?>  (team:title our.bowl src.bowl)
    =.  networks.settings
      =/  net-settings  (~(got by networks.settings) network.act)
      =.  default-index.net-settings  share-index.act
      =.  wallet-creation.sharing.net-settings  mode.act
      =.  who.sharing.net-settings  who.act
      (~(put by networks.settings) [network.act net-settings])
    =.  blocked.settings  blocked.act
    :_  state
    [%give %fact [/updates]~ %realm-wallet-update !>(`update`[%settings settings.state])]~
    ::
      %set-passcode-hash
    ?>  (team:title our.bowl src.bowl)
    =.  passcode-hash.settings  hash.act
    :_  state
    [%give %fact [/updates]~ %realm-wallet-update !>(`update`[%settings settings.state])]~
    ::
      %set-wallet-creation-mode
    ?>  (team:title our.bowl src.bowl)
    =/  net-settings  (~(got by networks.settings.state) network.act)
    =.  wallet-creation.sharing.net-settings  mode.act
    =.  networks.settings.state  (~(put by networks.settings.state) [network.act net-settings])
    :_  state
    [%give %fact [/updates]~ %realm-wallet-update !>(`update`[%settings settings.state])]~
    ::
      %set-sharing-mode
    ?>  (team:title our.bowl src.bowl)
    =/  net-settings  (~(got by networks.settings.state) network.act)
    =.  who.sharing.net-settings  who.act
    =.  networks.settings.state  (~(put by networks.settings.state) [network.act net-settings])
    :_  state
    [%give %fact [/updates]~ %realm-wallet-update !>(`update`[%settings settings.state])]~
    ::
      %set-sharing-permissions
    ?>  (team:title our.bowl src.bowl)
    =.  blocked.settings  (~(put in blocked.settings) who.act)
    :_  state
    [%give %fact [/updates]~ %realm-wallet-update !>(`update`[%settings settings.state])]~
    ::
      %set-default-index
    ?>  (team:title our.bowl src.bowl)
    =.  networks.settings.state
      =/  prev-set  (~(got by networks.settings.state) network.act)
      (~(put by networks.settings.state) [network.act [xpub.prev-set index.act sharing.prev-set]])
    :_  state
    [%give %fact [/updates]~ %realm-wallet-update !>(`update`[%settings settings.state])]~
    ::
      %set-wallet-nickname
    ?>  (team:title our.bowl src.bowl)
    =.  wallets.state
      =/  net-walls  (~(got by wallets.state) network.act)
      =/  wall  (~(got by net-walls) index.act)
      =.  nickname.wall  nickname.act
      =.  net-walls  (~(put by net-walls) [index.act wall])
      (~(put by wallets.state) [network.act net-walls])
    `state
    ::
      %create-wallet
    ^-  (quip card _state)
    ::  permissions
    ::
    =/  null-address-card
      =/  wall-act=action  [%receive-address network.act ~]
      =/  task  [%poke %realm-wallet-action !>(`action`wall-act)]
      [%pass /addr/(scot %p src.bowl) %agent [src.bowl dap.bowl] task]~
    =/  net-settings  (~(got by networks.settings.state) network.act)
    ?:  =(who.sharing.net-settings %nobody)
      [null-address-card state]
    ?:  (~(has in blocked.settings) src.bowl)
      [null-address-card state]
    ?:  ?&  =(who.sharing.net-settings %friends)
            =/  friends  .^((set @p) %gx /(scot %p our.bowl)/friends/(scot %da now.bowl)/ships/noun)
            !(~(has in friends) src.bowl)
        ==
      [null-address-card state]
    ::  send default wallet if requested
    ::
    =/  net-settings  (~(got by networks.settings.state) network.act)
    ?:  ?&  !(team:title our.bowl src.bowl)
            =(%default wallet-creation.sharing.net-settings)
            =/  net-wallets  ~(tap by (~(got by wallets) network.act))
            =/  num-wallets  (lent net-wallets)
            (gth num-wallets 0)
        ==
      =/  default-idx  default-index.net-settings
      =/  default-wallet  (~(get by (~(got by wallets) network.act)) default-idx)
      :_  state
      ?~  default-wallet
        ^-  (list card)
        =/  task  [%poke %realm-wallet-action !>(`action`[%receive-address network.act ~])]
        [%pass /addr/(scot %p src.bowl) %agent [src.bowl dap.bowl] task]~
      ^-  (list card)
      =/  wall-act=action  [%receive-address network.act `-:u.default-wallet]
      =/  task  [%poke %realm-wallet-action !>(`action`wall-act)]
      [%pass /addr/(scot %p src.bowl) %agent [src.bowl dap.bowl] task]~
    ::  create new wallet
    ::
    =/  idx  (lent ~(tap by (~(got by wallets.state) network.act)))
    =^  wallet=(unit wallet)  wallets.state
      =/  xpub  xpub:(~(got by networks.settings.state) network.act)
      ?~  xpub  [~ wallets.state]
      =/  wallet-info  (new-address u.xpub network.act idx)
      =/  address  -:wallet-info
      =/  path     +:wallet-info
      ~&  >  (crip (weld "generated wallet address " (z-co:co address)))
      =/  wallet
        ^-  wallet
        [address path nickname.act ~]
      =.  wallets.state
        =/  old-map  (~(got by wallets.state) network.act)
        =.  old-map  (~(put by old-map) [idx wallet])
        (~(put by wallets.state) [network.act old-map])
      :-  `wallet
      wallets.state
    ::  no xpub
    ?~  wallet
      ~&  >>  'requested wallet with no xpub set'
      :_  state
      ^-  (list card)
      ?.  (team:title our.bowl src.bowl)
        =/  task  [%poke %realm-wallet-action !>(`action`[%receive-address network.act ~])]
        [%pass /addr/(scot %p src.bowl) %agent [src.bowl dap.bowl] task]~
      ~
    ::  add wallet update and await-balance to cards
    =/  cards
      ^-  (list card)
      =/  key  [network.act `@ta`idx]
      :~  `card`[%give %fact [/updates]~ %realm-wallet-update !>(`update`[%wallet network.act (scot %ud idx) u.wallet])]
      ==
    ::  send wallet to requester if not our
    =?  cards  !(team:title our.bowl src.bowl)
      =/  send-card
        ^-  (list card)
        =/  task  [%poke %realm-wallet-action !>(`action`[%receive-address network.act `-:u.wallet])]
        [%pass /addr/(scot %p src.bowl) %agent [src.bowl dap.bowl] task]~
      (weld cards send-card)
    [cards state]
    ::
      %request-address
    =/  task  [%poke %realm-wallet-action !>(`action`[%create-wallet our.bowl network.act (crip (scow %p our.bowl))])]
    :-  [%pass /addr/(scot %p from.act) %agent [from.act dap.bowl] task]~
    state
      %receive-address
    =/  upd  `update`[%address src.bowl network.act address.act]
    =/  update-path=path  /address/[(crip (scow %tas network.act))]/[(crip (scow %p src.bowl))]
    :-
      :~  [%give %fact [update-path]~ %realm-wallet-update !>(upd)]
          [%give %kick ~[update-path] ~]
      ==
    state
    ::
      %set-transaction
    =/  tid=@ta
      :((cury cat 3) dap.bowl '--' (scot %uv eny.bowl))
    =.  wallets.state
      =/  network-map  (~(got by wallets.state) network.act)
      =/  prev-wallet  (~(got by network-map) wallet.act)
      =.  transactions.prev-wallet
        =/  net-map  (~(get by transactions.prev-wallet) net.act)
        =/  net-map
          ?~  net-map
            (my [hash.transaction.act transaction.act]~)
          (~(put by u.net-map) [hash.transaction.act transaction.act])
        (~(put by transactions.prev-wallet) [net.act net-map])
      =.  network-map  (~(put by network-map) [wallet.act prev-wallet])
      (~(put by wallets.state) [network.act network-map])
    =/  cards  *(list card)
    =?  cards
        ?&  (team:title our.bowl src.bowl)
            =/  their-patp  their-patp.transaction.act
            !=(~ their-patp)
        ==
      ?~  their-patp.transaction.act  !!
        =/  to=@p  u.their-patp.transaction.act
        =.  transaction.act
          =.  type.transaction.act  %received
          =.  their-patp.transaction.act  `our.bowl
          =/  their-address  their-address.transaction.act
          =.  their-address.transaction.act  our-address.transaction.act
          =.  our-address.transaction.act  their-address
          transaction.act
        =/  wall-act=action  [%set-transaction network.act net.act wallet.act hash.act transaction.act]
        =/  task  [%poke %realm-wallet-action !>(wall-act)]
        =/  new-card
          ^-  (list card)
          :~  `card`[%pass /addr/(scot %p to) %agent [to dap.bowl] task]
          ==
        (weld cards new-card)
    =?  cards
        !(team:title our.bowl src.bowl)
      =/  new-card
        ^-  (list card)
        :~  `card`[%give %fact ~[/updates] %realm-wallet-update !>(`update`[%transaction network.act net.act wallet.act hash.act transaction.act])]
        ==
      (weld cards new-card)
    [cards state]
    ::
      %save-transaction-notes
    =/  network-map  (~(got by wallets) %ethereum)
    =/  wall-map  (~(got by network-map) wallet.act)
    =/  net-map  (~(get by transactions.wall-map) net.act)
    =/  tx
      ?~  net-map
        =/  tx  *transaction
        =.  hash.tx  hash.act
        tx
      =/  tx  (~(get by u.net-map) hash.act)
      ?~  tx
        =/  tx  *transaction
        =.  hash.tx  hash.act
        tx
      u.tx
    =.  tx
      =.  notes.tx  notes.act
      tx
    =/  net-map
      ?~  net-map
        (my [hash.act tx]~)
      (~(put by u.net-map) [hash.act tx])
    =.  wallets
      =.  transactions.wall-map  (~(put by transactions.wall-map) [net.act net-map])
      =.  network-map  (~(put by network-map) [wallet.act wall-map])
      (~(put by wallets) [%ethereum network-map])
    :_  state
    [%give %fact ~[/updates] %realm-wallet-update !>(`update`[%transaction %ethereum net.act wallet.act hash.act tx])]~
    ::
  ==
::
--
