/-  *min-wallet
/+  default-agent, dbug, *min-wallet
|%
+$  versioned-state
  $%  state-0
  ==
+$  state-0
  $:  %0
      =transactions
      =wallets
      =settings
  ==
+$  card  card:agent:gall
--
%-  agent:dbug
=|  state-0
=*  state  -
^-  agent:gall
=<
  |_  =bowl:gall
  +*  this  .
      def   ~(. (default-agent this %.n) bowl)
      ::core   ~(. +> bowl)
  ::
  ++  on-init
    ^-  (quip card _this)
    :-  [%pass /init-wallet %agent [our.bowl %min-wallet] %poke %wallet-action !>([%initialize ~])]~
    this
  ::
  ++  on-save
    ^-  vase
    !>(state)
  ::
  ++  on-load
    |=  old-state=vase
    ^-  (quip card _this)
    =/  old  !<(versioned-state old-state)
    ?-  -.old
      %0  `this(state old)
    ==
  ::
  ++  on-poke
    ~/  %on-poke
    |=  [=mark =vase]
    ^-  (quip card _this)
    ?+  mark  (on-poke:def mark vase)
        %wallet-action
      =^  cards  state
        ^-  (quip card _state)
        (handle-wallet-action !<(action vase))
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
      =/  task  [%poke %wallet-action !>(`action`wall-act)]
      :-  [%pass /addr/(scot %p from) %agent [from dap.bowl] task]~
      this
        [%transactions ~]
      `this
        [%wallets ~]
      `this
    ==
  ++  on-leave  on-leave:def
  ++  on-peek
    |=  =path
    ^-  (unit (unit cage))
    ?>  (team:title our.bowl src.bowl)
    ?+    path  (on-peek:def path)
        [%x %history ~]
      :^  ~  ~  %wallet-update
      !>  ^-  update
      [%history transactions.state]
        [%x %wallets ~]
      :^  ~  ~  %wallet-update
      !>  ^-  update
      [%wallets wallets.state]
    ==
  ++  on-agent  on-agent:def
  ++  on-arvo   on-arvo:def
  ++  on-fail   on-fail:def
  --
|_  =bowl:gall
::
++  handle-wallet-action
  |=  act=action
  ^-  (quip card _state)
  ?-  -.act
      %initialize
    ?>  (team:title our.bowl src.bowl)
    =.  who.sharing.settings.state  %anybody
    =.  wallet-creation.sharing.settings.state  %default
    =.  wallets.state
      (~(put by wallets.state) [%ethereum ~])
    =.  wallets.state
      (~(put by wallets.state) [%bitcoin ~])
    =.  transactions.state
      (~(put by transactions.state) [%bitcoin ~])
    =.  transactions.state
      (~(put by transactions.state) [%ethereum ~])
    =.  networks.settings.state
      (~(put by networks.settings.state) [%ethereum [~ 0]])
    =.  networks.settings.state
      (~(put by networks.settings.state) [%bitcoin [~ 0]])
    `state
    ::
      %set-xpub
    ?>  (team:title our.bowl src.bowl)
    =/  net  (~(got by networks.settings.state) network.act)
    =?  wallets  !=(xpub.act xpub.net)
      =/  net-wallets  (~(got by wallets) network.act)
      (~(put by wallets) [network.act ~])
    =.  networks.settings.state
      =/  net  (~(got by networks.settings.state) network.act)
      =.  xpub.net  `xpub.act
      (~(put by networks.settings.state) [network.act net])
    `state
    ::
      %set-settings
    ?>  (team:title our.bowl src.bowl)
    =.  networks.settings
      =/  net-settings  (~(got by networks.settings) network.act)
      =.  default-index.net-settings  share-index.act
      (~(put by networks.settings) [network.act net-settings])
    =.  wallet-creation.sharing.settings  mode.act
    =.  who.sharing.settings  who.act
    `state
    ::
      %set-wallet-creation-mode
    ?>  (team:title our.bowl src.bowl)
    `state(wallet-creation.sharing.settings mode.act)
    ::
      %set-sharing-mode
    ?>  (team:title our.bowl src.bowl)
    `state(who.sharing.settings who.act)
    ::
      %set-sharing-permissions
    ?>  (team:title our.bowl src.bowl)
    =.  sharing.settings
      ?-  type.act
        %allow
      =.  whitelist.sharing.settings  (~(put in whitelist.sharing.settings) who.act)
      sharing.settings
        %block
      =.  blocked.sharing.settings  (~(put in whitelist.sharing.settings) who.act)
      sharing.settings
      ==
    `state
    ::
      %set-default-index
    ?>  (team:title our.bowl src.bowl)
    =.  networks.settings.state
      =/  prev-set  (~(got by networks.settings.state) network.act)
      (~(put by networks.settings.state) [network.act [xpub.prev-set index.act]])
    `state
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
      =/  task  [%poke %wallet-action !>(`action`wall-act)]
      [%pass /addr/(scot %p src.bowl) %agent [src.bowl dap.bowl] task]~
    ?:  =(who.sharing.settings %nobody)
      [null-address-card state]
    ?:  (~(has in blocked.sharing.settings) src.bowl)
      [null-address-card state]
    ?:  ?&  =(who.sharing.settings %friends)
            !(~(has in whitelist.sharing.settings) src.bowl)
        ==
      [null-address-card state]
    ::  send default wallet if requested
    ::
    ?:  ?&  !(team:title our.bowl src.bowl)
            =(%default wallet-creation.sharing.settings.state)
            =/  net-wallets  (~(got by wallets) network.act)
            =/  num-wallets  (lent net-wallets)
            (gth num-wallets 0)
        ==
      =/  default-idx  default-index:(~(got by networks.settings.state) network.act)
      =/  default-wallet  (~(get by (~(got by wallets) network.act)) default-idx)
      :_  state
      ?~  default-wallet
        ^-  (list card)
        =/  task  [%poke %wallet-action !>(`action`[%receive-address network.act ~])]
        [%pass /addr/(scot %p src.bowl) %agent [src.bowl dap.bowl] task]~
      ^-  (list card)
      =/  wall-act=action  [%receive-address network.act `-:u.default-wallet]
      =/  task  [%poke %wallet-action !>(`action`wall-act)]
      [%pass /addr/(scot %p src.bowl) %agent [src.bowl dap.bowl] task]~
    ::  create new wallet
    ::
    =/  idx  (lent ~(tap by (~(got by wallets.state) network.act)))
    =?  idx  =(~ idx)  0
    =^  wallet=(unit wallet)  wallets.state
      =/  xpub  xpub:(~(got by networks.settings.state) network.act)
      ?~  xpub  [~ wallets.state]
      =/  wallet-info  (new-address u.xpub network.act idx)
      =/  address  -:wallet-info
      =/  path     +:wallet-info
      ~&  >  (crip (weld "generated wallet address " (z-co:co address)))
      =/  wallet
        ^-  wallet
        [address path nickname.act]
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
        =/  task  [%poke %wallet-action !>(`action`[%receive-address network.act ~])]
        [%pass /addr/(scot %p src.bowl) %agent [src.bowl dap.bowl] task]~
      ~
    ::  add wallet update and await-balance to cards
    =/  cards
      ^-  (list card)
      =/  key  [network.act `@ta`idx]
      :~  `card`[%give %fact [/wallets]~ %wallet-update !>(`update`[%wallet network.act `@t`idx u.wallet])]
      ==
    ::  send wallet to requester if not our
    =?  cards  !(team:title our.bowl src.bowl)
      =/  send-card
        ^-  (list card)
        =/  task  [%poke %wallet-action !>(`action`[%receive-address network.act `-:u.wallet])]
        [%pass /addr/(scot %p src.bowl) %agent [src.bowl dap.bowl] task]~
      (weld cards send-card)
    [cards state]
    ::
      %request-address
    =/  task  [%poke %wallet-action !>(`action`[%create-wallet our.bowl network.act (crip (scow %p our.bowl))])]
    :-  [%pass /addr/(scot %p from.act) %agent [from.act dap.bowl] task]~
    state
      %receive-address
    =/  upd  `update`[%address src.bowl network.act address.act]
    =/  update-path=path  /address/[(crip (scow %tas network.act))]/[(crip (scow %p src.bowl))]
    :-
      :~  [%give %fact [update-path]~ %wallet-update !>(upd)]
          [%give %kick ~[update-path] ~]
      ==
    state
    ::
      %enqueue-transaction
    =/  tid=@ta
      :((cury cat 3) dap.bowl '--' (scot %uv eny.bowl))
    =.  transactions.state
      =/  network-map  (~(got by transactions.state) network.act)
      =/  net-map  (~(get by network-map) net.act)
      ?~  net-map
        =/  net-map  `(map @t transaction)`(my [hash.transaction.act transaction.act]~)
        =.  network-map  (~(put by network-map) [net.act net-map])
        (~(put by transactions.state) [network.act network-map])
      =/  net-map  (~(put by u.net-map) [hash.transaction.act transaction.act])
      =.  network-map  (~(put by network-map) [net.act net-map])
      (~(put by transactions.state) [network.act network-map])
    =/  cards  *(list card)
    =?  cards
        ?&  (team:title our.bowl src.bowl)
            =/  their-patp
              ?-  -.transaction.act
                %eth  their-patp.transaction.act
                %erc20  their-patp.transaction.act
                %erc721  their-patp.transaction.act
              ==
            !=(~ their-patp)
        ==
        ?-  -.transaction.act
            %eth
          ?~  their-patp.transaction.act  !!
          =/  to=@p  u.their-patp.transaction.act
          =.  transaction.act
            =.  type.transaction.act  %received
            =.  their-patp.transaction.act  `our.bowl
            =/  their-address  their-address.transaction.act
            =.  their-address.transaction.act  our-address.transaction.act
            =.  our-address.transaction.act  their-address
            transaction.act
          =/  wall-act=action  [%enqueue-transaction network.act net.act hash.act transaction.act]
          =/  task  [%poke %wallet-action !>(wall-act)]
          =/  new-card  
            ^-  (list card)
            :~  `card`[%pass /addr/(scot %p to) %agent [to dap.bowl] task]
            ==
          (weld cards new-card)
            %erc20
          ?~  their-patp.transaction.act  !!
          =/  to=@p  u.their-patp.transaction.act
          =.  transaction.act
            =.  type.transaction.act  %received
            =.  their-patp.transaction.act  `our.bowl
            =/  their-address  their-address.transaction.act
            =.  their-address.transaction.act  our-address.transaction.act
            =.  our-address.transaction.act  their-address
            transaction.act
          =/  wall-act=action  [%enqueue-transaction network.act net.act hash.act transaction.act]
          =/  task  [%poke %wallet-action !>(wall-act)]
          =/  new-card  
            ^-  (list card)
            :~  `card`[%pass /addr/(scot %p to) %agent [to dap.bowl] task]
            ==
          (weld cards new-card)
            %erc721
          ?~  their-patp.transaction.act  !!
          =/  to=@p  u.their-patp.transaction.act
          =.  transaction.act
            =.  type.transaction.act  %received
            =.  their-patp.transaction.act  `our.bowl
            =/  their-address  their-address.transaction.act
            =.  their-address.transaction.act  our-address.transaction.act
            =.  our-address.transaction.act  their-address
            transaction.act
          =/  wall-act=action  [%enqueue-transaction network.act net.act hash.act transaction.act]
          =/  task  [%poke %wallet-action !>(wall-act)]
          =/  new-card  
            ^-  (list card)
            :~  `card`[%pass /addr/(scot %p to) %agent [to dap.bowl] task]
            ==
          (weld cards new-card)
        ==
    =?  cards
        !(team:title our.bowl src.bowl)
      =/  new-card
        ^-  (list card)
        :~  `card`[%give %fact ~[/transactions] %wallet-update !>(`update`[%transaction network.act net.act tid transaction.act])]
        ==
      (weld cards new-card)
    [cards state]
    ::
      %save-transaction-notes
    =/  network-map  (~(got by transactions) %ethereum)
    =/  net-map  (~(got by network-map) net.act)
    =/  tx  (~(got by net-map) hash.act)
    =/  notes
      ?-  -.tx
        %eth  notes.tx
        %erc20  notes.tx
        %erc721  notes.tx
      ==
    =.  notes  notes.act
    =.  transactions
      =.  net-map  (~(put by net-map) [hash.act tx])
      =.  network-map  (~(put by network-map) [net.act net-map])
      (~(put by transactions) [%ethereum network-map])
    :_  state
    [%give %fact ~[/transactions] %wallet-update !>(`update`[%transaction %ethereum net.act hash.act tx])]~
    ::
  ==
::
--