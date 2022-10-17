/-  *wallet, erc20=eth-contracts-erc20, watchlib=eth-watcher
/+  default-agent, dbug, *wallet, erc20lib=eth-contracts-erc20
=*  eth  ethereum
=*  eth-key  key:ethereum
!:
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
      core   ~(. +> bowl)
  ::
  ++  on-init
    ^-  (quip card _this)
    :-  [%pass /init-wallet %agent [our.bowl %wallet] %poke %wallet-action !>([%initialize ~])]~
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
        (handle-wallet-action:core !<(action vase))
      [cards this]
    ==
  ::
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
  ::
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
  ++  on-agent
    |=  [=wire =sign:agent:gall]
    ^-  (quip card _this)
    ?+  wire  (on-agent:def wire sign)
        [%eth-balance *]
      =/  network  +>-:wire
      =/  index  +>+<:wire
      =/  key  [network index]
      =/  network  (scan (trip network) (perk ~[%bitcoin %ethereum]))
      ?.  ?=(%fact -.sign)
        `this
      ?+  p.cage.sign  ~|(['unexpected sign' sign] !!)
          %thread-fail
        =+  !<([=term =tang] q.cage.sign)
        %-  =-  (slog (welp - tang))
            :~  leaf+"wallet: read eth balance failed"
                leaf+<term>
            ==
        `this
          %thread-done
        =/  network  +>-:wire
        =/  index  +>+<:wire
        =/  key  [network index]
        =/  network  (scan (trip network) (perk ~[%bitcoin %ethereum]))
        =+  !<(bal=@ud q.cage.sign)
        =/  net-walls  (~(got by wallets.state) %ethereum)
        =/  wall  (~(got by net-walls) index)
        =.  balance.wall  bal
        =.  wallets.state
          =.  net-walls  (~(put by net-walls) [index wall])
          (~(put by wallets.state) [%ethereum net-walls])
        :_  this
        [[%give %fact ~[/wallets] %wallet-update !>(`update`[%wallet %ethereum index wall])] ~]
      ==
        [%tx *]
      ?.  ?=(%fact -.sign)
        `this
      ?+  p.cage.sign  ~|(['unexpected sign' sign] !!)
          %thread-fail
        =+  !<([=term =tang] q.cage.sign)
        %-  =-  (slog (welp - tang))
            :~  leaf+"wallet: eth transaction failed"
                leaf+<term>
            ==
        `this
          %thread-done
        =+  !<([txh=@ux status=? block=@ud] q.cage.sign)
        ?:  ?=([%tx %result %eth-receipt tid=@ta hash=@t ~] wire)
          =/  tid=@ta  i.t.t.t.wire
          =/  hash=@t  i.t.t.t.t.wire
          =+  !<(rez=tx-rez q.cage.sign)
          =/  net-pend  (~(got by transactions) %ethereum)
          =/  pending-tx=transaction
            =/  old-pending-tx  (~(got by net-pend) hash)
            ?+  -.old-pending-tx  !!
                %eth
              =.  status.old-pending-tx  %succeeded
              =.  completed-at.old-pending-tx  `(crip (scow %da now.bowl))
              old-pending-tx
            ==
          =.  transactions
            =/  net-pending  (~(got by transactions) %ethereum)
            =.  net-pending
              (~(put by net-pending) [hash pending-tx])
            (~(put by transactions) [%ethereum net-pending])
          ?:  status.rez
            :_  this
            [%give %fact ~[/transactions] %wallet-update !>(`update`[%transaction %ethereum tid pending-tx status.rez])]~
          ~&  ["{(trip dap.bowl)} transaction reverted" txh.rez]
          `this
        ~&  ['unexpected thread result on' wire]
        `this
      ==
        [%wallet-eth-watcher flow=?(%from %to) idx=@t contract-address=@t ~]
      ~&  'got something from eth watcher'
      =/  [%wallet-eth-watcher flow=?(%from %to) idx=@t contract-address=@t ~]  wire
      ?.  ?=(%fact -.sign)
        `this
      ?+  p.cage.sign  (on-agent:def wire sign)
          %eth-watcher-diff
        ~&  'got a diff'
        =+  !<(sign=diff:watchlib q.cage.sign) 
        ~&  sign
        =/  diff  (decode-diff:erc20lib sign)
        ?-  diff
            [%history *]
          %-  (slog ~[leaf+"loglist" >loglist.diff<])
::          =/  hist=(unit loglist:erc20)  (~(get by history-parts) contract-id)
::          ?~  hist
::            =.  history-parts
::              (~(put by history-parts) contract-id loglist.diff)
::            `this
          =/  =loglist:erc20
            :: %+  sort  (weld loglist.diff u.hist)
            %+  sort  loglist.diff
            order-events:core
::          =.  history-parts  (~(del by history-parts) contract-id)
          =^  cards  state  (apply-events:core idx loglist)
          :_  this
          [[%give %fact ~[/primary] %eth-contracts-erc20-diff !>(diff)] ~]
            [%logs *]
          =/  =loglist:erc20
            %+  sort  loglist.diff
            order-events:core
          =^  cards  state  (apply-events:core idx loglist)
          :_  this
          [[%give %fact ~[/primary] %eth-contracts-erc20-diff !>(diff)] ~]
            [%disavow *]
          `this
        ==
      ==
    ==
  ++  on-arvo
    |=  [=wire =sign-arvo]
    ^-  (quip card _this)
    ?+  +<.sign-arvo  ~|([dap.bowl %strange-arvo-sign +<.sign-arvo] !!)
        %wake
      ?+  wire  ~|([dap.bowl %strange-behn-wire wire] !!)
          [%eth-balance *]
        =/  network  +<:wire
        =/  index  +>-:wire
        =/  key  [network index]
        =/  cards  [(await-eth-balance:core key) ~]
        =/  network  (scan (trip network) (perk ~[%bitcoin %ethereum]))
        =/  prov  provider:(~(got by networks.settings.state) network)
        ?~  prov  [cards this]
        =/  net-walls  (~(got by wallets.state) network)
        =/  mywall  (~(get by net-walls) index)
        ?~  mywall  [cards this]
        =/  addr  address:u.mywall
        :_  this
        (weld cards (get-eth-balance:core network index u.prov addr))
          [%awatch *]
        :_  this
        [(watch-eth-watcher:core t.wire) ~]
      ==
    ==
  ++  on-fail   on-fail:def
  --
|_  =bowl:gall
::
++  await-eth-balance
  |=  [key=[@ta @ta]]
  (wait [%eth-balance -.key +.key ~] ~s5)
::
++  get-eth-balance
  |=  [=network idx=@t node-url=@ta address=@ux]
  =/  tid=@ta
    :((cury cat 3) dap.bowl '--' (scot %uv eny.bowl))
  =/  args  [~ `tid byk.bowl(r da+now.bowl) %eth-get-balance !>([node-url address])]
  =/  =wire  [%eth-balance tid network idx ~]
  :~  (poke-spider wire %spider-start !>(args))
      (watch-spider wire /thread-result/[tid])
  ==
::
++  await-eth-watcher
  |=  =wire
  (wait [%awatch wire] ~m3)
::
++  watch-eth-watcher
  |=  =path
  %+  to-eth-watcher  [%wallet-eth-watcher `wire`path]
  [%watch [%logs path]]
::
++  to-eth-watcher
  |=  [=wire =task:agent:gall]
  ^-  card
  [%pass wire %agent [our.bowl %wallet-eth-watcher] task]
::
++  get-eth-transaction
  |=  [node-url=@ta txh=@ux]
  =/  tid=@ta
    :((cury cat 3) dap.bowl '--' (scot %uv eny.bowl))
  =/  args
      :^  ~  `tid  %eth-get-transaction
      !>([node-url 'eth-send' txh])
  =/  =wire  [%eth-transaction tid ~]
  :~  (poke-spider wire %spider-start !>(args))
      (watch-spider wire /thread-result/[tid])
  ==
::
++  addr-to-contract
  |=  idx=@t
  ^-  %+  map  address:ethereum
      $%  [%erc20 name=@t =contract-id balance=@ud =txn-log pending-txs=(map tid=@ta pending-tx)]
          [%erc721 name=@t =contract-id tokens=(set @ud) =txn-log pending-txs=(map tid=@ta pending-tx)]
      ==
  =/  eth-map  (~(got by wallets) %ethereum)
  =/  contracts-map  contracts-map:(~(got by eth-map) idx)
  %-  molt
  %+  turn  ~(tap by contracts-map)
  |=  $:  =contract-id
          data=contract-data
      ==
  ?-  -.data
    %erc20
      [address.data [%erc20 name.data contract-id balance.data txn-log.data pending-txs.data]]
    %erc721
      [address.data [%erc721 name.data contract-id tokens.data txn-log.data pending-txs.data]]
  ==
::
++  order-events
  |=  [a=event-log:erc20 b=event-log:erc20]
  ?>  ?=([~ *] mined.a)
  ?>  ?=([~ *] mined.b)
  =+  [ablock=block-number.u.mined.a bblock=block-number.u.mined.b]
  ?.  =(ablock bblock)  (lth ablock bblock)
  (lth log-index.u.mined.a log-index.u.mined.b)
::
++  apply-events
  |=  [idx=@t =loglist:erc20]
  ^-  (quip card _state)
  =/  cards=(list card)  ~
  |-
  ?~  loglist  [cards state]
  =^  new-cards  state  (apply-event idx i.loglist)
  ::$(state (apply-event idx i.loglist), loglist t.loglist)
  $(cards (weld cards new-cards), state state, loglist t.loglist)
::
++  apply-event
  |=  [idx=@t =event-log:erc20]
  ^-  (quip card _state)
  =/  mytxn  *txn-log
  ?-  event-data.event-log
      [%approval *]
    `state
      [%transfer *]
    =/  data
      ^-
        $%  [%erc20 name=@t =contract-id balance=@ud =txn-log pending-txs=(map tid=@ta pending-tx)]
            [%erc721 name=@t =contract-id tokens=(set @ud) =txn-log pending-txs=(map tid=@ta pending-tx)]
        ==
      =/  myaddr  (addr-to-contract idx)
      (~(got by myaddr) address.event-log)
    =/  address
      =/  wall-map  (~(got by wallets) %ethereum)
      address:(~(got by wall-map) idx)
    ?-  -.data
        %erc20
      =/  type
        ?:  &(=(to.event-data.event-log from.event-data.event-log) =(to.event-data.event-log address))
          %received
        ?:  =(address to.event-data.event-log)
          %received
        ?:  =(address from.event-data.event-log)
          %sent
        ~|  "unexpected event"  !!
      =/  new-balance=@ud
        ?:  &(=(to.event-data.event-log from.event-data.event-log) =(to.event-data.event-log address))
          balance.data
        ?:  =(address to.event-data.event-log)
          (add balance.data value.event-data.event-log)
        ?:  =(address from.event-data.event-log)
          (sub balance.data value.event-data.event-log)
        ~|  "unexpected event"  !!
      ?~  mined.event-log  ~|  "received unexpected unmined event"  !!
      =/  txh=@ux  transaction-hash.u.mined.event-log
      =/  pendings=(list [tid=@ta =pending-tx])  ~(tap by pending-txs.data)
      =/  index=(unit @ud)
        %+  find  [[~ txh] ~]
        %+  turn  pendings
        |=  [@ta =pending-tx]
        txh.pending-tx
      =.  pending-txs.data
        ?~  index  pending-txs.data
        =/  tid=@ta  tid:(snag u.index pendings)
        %-  ~(del by pending-txs.data)  tid
      =.  txn-log.data
        :_  txn-log.data
        :*  block-number.u.mined.event-log
            txh
            log-index.u.mined.event-log
            from.event-data.event-log
            to.event-data.event-log
            value.event-data.event-log
        ==
      =.  wallets
        =/  eth-map  (~(got by wallets) %ethereum)
        =/  wall  (~(got by eth-map) idx)
        =/  contracts-map  contracts-map:wall
        =.  contracts-map
          %+  ~(put by contracts-map)
            contract-id.data
            [%erc20 name.data address.event-log new-balance txn-log.data pending-txs.data]
        =.  contracts-map.wall  contracts-map
        =.  eth-map  (~(put by eth-map) [idx wall])
        (~(put by wallets) [%ethereum eth-map])
      =/  tx
        ^-  transaction
        =/  net-tx  (~(got by transactions) %ethereum)
        =/  prev-tx  (~(get by net-tx) (crip (z-co:co txh)))
        ?~  prev-tx
          ^-  transaction
          :*  %erc20
              (crip (z-co:co txh))
              0x0
              `@t`value.event-data.event-log
              %ethereum
              type
              ''
              ~
              (crip (z-co:co address))
              ~
              ?-  type
                %sent  (crip (z-co:co to.event-data.event-log))
                %received  (crip (z-co:co from.event-data.event-log))
              ==
              %succeeded
              ~
              ''
            ==
        =/  prev-tx  u.prev-tx
        ?-  -.prev-tx
            %eth
          =.  status.prev-tx  %succeeded
          prev-tx
            %erc20
          =.  status.prev-tx  %succeeded
          prev-tx
            %erc721
          =.  status.prev-tx  %succeeded
          prev-tx
        ==
      =.  transactions
        =/  net-tx  (~(got by transactions) %ethereum)
        =.  net-tx  (~(put by net-tx) [(crip (z-co:co txh)) tx])
        (~(put by transactions) [%ethereum net-tx])
      :-  [%give %fact ~[/transactions] %wallet-update !>(`update`[%transaction %ethereum (crip (z-co:co txh)) tx &])]~
        state
        %erc721
      =/  type
        ?:  &(=(to.event-data.event-log from.event-data.event-log) =(to.event-data.event-log address))
          %received
        ?:  =(address to.event-data.event-log)
          %received
        ?:  =(address from.event-data.event-log)
          %sent
        ~|  "unexpected event"  !!
      =/  new-tokens=(set @ud)
        ?:  &(=(to.event-data.event-log from.event-data.event-log) =(to.event-data.event-log address))
          tokens.data
        ?:  =(address to.event-data.event-log)
          (~(put in tokens.data) value.event-data.event-log)
          ::(add balance.data value.event-data.event-log)
        ?:  =(address from.event-data.event-log)
          (~(del in tokens.data) value.event-data.event-log)
        ::(sub balance.data value.event-data.event-log)
        ~|  "unexpected event"  !!
      ?~  mined.event-log  ~|  "received unexpected unmined event"  !!
      =/  txh=@ux  transaction-hash.u.mined.event-log
      =/  pendings=(list [tid=@ta =pending-tx])  ~(tap by pending-txs.data)
      =/  index=(unit @ud)
        %+  find  [[~ txh] ~]
        %+  turn  pendings
        |=  [@ta =pending-tx]
        txh.pending-tx
      =.  pending-txs.data
        ?~  index  pending-txs.data
        =/  tid=@ta  tid:(snag u.index pendings)
        %-  ~(del by pending-txs.data)  tid
      =.  txn-log.data
        :_  txn-log.data
        :*  block-number.u.mined.event-log
            txh
            log-index.u.mined.event-log
            from.event-data.event-log
            to.event-data.event-log
            value.event-data.event-log
        ==
      =.  wallets
        =/  eth-map  (~(got by wallets) %ethereum)
        =/  wall  (~(got by eth-map) idx)
        =/  contracts-map  contracts-map:wall
        =.  contracts-map
          %+  ~(put by contracts-map)
            contract-id.data
            [%erc721 name.data address.event-log new-tokens txn-log.data pending-txs.data]
        =.  contracts-map.wall  contracts-map
        =.  eth-map  (~(put by eth-map) [idx wall])
        (~(put by wallets) [%ethereum eth-map])
      =/  tx
        ^-  transaction
        =/  net-tx  (~(got by transactions) %ethereum)
        =/  prev-tx  (~(get by net-tx) (crip (z-co:co txh)))
        ?~  prev-tx
          ^-  transaction
          :*  %erc721
              (crip (z-co:co txh))
              0x0
              `@t`value.event-data.event-log
              %ethereum
              type
              ''
              ~
              (crip (z-co:co address))
              ~
              ?-  type
                %sent  (crip (z-co:co to.event-data.event-log))
                %received  (crip (z-co:co from.event-data.event-log))
              ==
              %succeeded
              ~
              ''
            ==
        =/  prev-tx  u.prev-tx
        ?-  -.prev-tx
            %eth
          =.  status.prev-tx  %succeeded
          prev-tx
            %erc20
          =.  status.prev-tx  %succeeded
          prev-tx
            %erc721
          =.  status.prev-tx  %succeeded
          prev-tx
        ==
      =.  transactions
        =/  net-tx  (~(got by transactions) %ethereum)
        =.  net-tx  (~(put by net-tx) [(crip (z-co:co txh)) tx])
        (~(put by transactions) [%ethereum net-tx])
      :-  [%give %fact ~[/transactions] %wallet-update !>(`update`[%transaction %ethereum (crip (z-co:co txh)) tx &])]~
        state
    ==
  ==
::
++  poke-spider
  |=  [=path =cage]
  ^-  card
  [%pass path %agent [our.bowl %spider] %poke cage]
::
++  watch-spider
  |=  [=path =sub=path]
  ^-  card
  [%pass path %agent [our.bowl %spider] %watch sub-path]
::
++  leave-spider
  |=  =path
  ^-  card
  [%pass path %agent [our.bowl %spider] %leave ~]
::
++  wait
  |=  [=wire =@dr]
  ^-  card
  [%pass wire %arvo %b %wait (add now.bowl dr)]    
::
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
      (~(put by networks.settings.state) [%ethereum [~ '0' ~]])
    =.  networks.settings.state
      (~(put by networks.settings.state) [%bitcoin [~ '0' ~]])
    `state
    ::
      %set-xpub
    ?>  (team:title our.bowl src.bowl)
    =.  networks.settings.state
      =/  net  (~(got by networks.settings.state) network.act)
      =.  xpub.net  `xpub.act
      (~(put by networks.settings.state) [network.act net])
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
      %sharing-permissions
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
      (~(put by networks.settings.state) [network.act [xpub.prev-set index.act provider.prev-set]])
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
      %set-network-provider
    ?>  (team:title our.bowl src.bowl)
    =.  networks.settings.state
      =/  prev-set  (~(got by networks.settings.state) network.act)
      (~(put by networks.settings.state) [network.act [xpub.prev-set default-index.prev-set `provider.act]])
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
    =/  idx  `@t`(scot %ud (lent ~(tap by (~(got by wallets.state) network.act))))
    =^  wallet=(unit wallet)  wallets.state
      =/  xpub  xpub:(~(got by networks.settings.state) network.act)
      ?~  xpub  [~ wallets.state]
      =/  wallet-info  (new-address u.xpub network.act idx)
      =/  address  -:wallet-info
      =/  path     +:wallet-info
      ~&  >  (crip (weld "generated wallet address " (z-co:co address)))
      =/  wallet
        ^-  wallet
        [address path nickname.act 0 *contracts-map]
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
          `card`(await-eth-balance key)
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
      =/  net-map  (~(got by transactions.state) network.act)
      =.  net-map  (~(put by net-map) [hash.transaction.act transaction.act])
      (~(put by transactions.state) [network.act net-map])
    =/  cards
      ?+  network.act  `(list card)`~
          %ethereum
        =/  =wire  [%eth-receipt tid hash.transaction.act ~]
        =/  args
          =/  node-url
            =/  provider  provider:(~(got by networks.settings) network.act)
            ?~  provider  ~
            u.provider
          ?~  node-url  ~
          :-  ~
          :^  `tid  byk.bowl(r da+now.bowl)  %eth-get-transaction-receipt
          =+  [gas=100.000 gas-price=30.000.000.000]
          !>([node-url 'tx' hash.act])
        ?~  args  `(list card)`~
        :~  (watch-spider [%tx %result wire] /thread-result/[tid])
            (poke-spider [%tx wire] %spider-start !>(args))
        ==
      ==
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
          =/  wall-act=action  [%enqueue-transaction network.act hash.act transaction.act]
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
          =/  wall-act=action  [%enqueue-transaction network.act hash.act transaction.act]
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
          =/  wall-act=action  [%enqueue-transaction network.act hash.act transaction.act]
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
        :~  `card`[%give %fact ~[/transactions] %wallet-update !>(`update`[%transaction %ethereum tid transaction.act &])]
        ==
      (weld cards new-card)
    [cards state]
    ::
      %save-transaction-notes
    =/  net-map  (~(got by transactions) %ethereum)
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
      (~(put by transactions) [%ethereum net-map])
    :_  state
    [%give %fact ~[/transactions] %wallet-update !>(`update`[%transaction %ethereum hash.act tx &])]~
    ::
      %add-smart-contract
    =^  address  wallets
      =/  wallet-map  (~(got by wallets) %ethereum)
      =/  wallet  (~(got by wallet-map) wallet-index.act)
      =/  address  address.wallet
      =.  contracts-map.wallet
        =/  contract-data
          ?-  contract-type.act
            %erc20
              [%erc20 name.act address.act 0 ~ ~]
            %erc721
              [%erc721 name.act address.act ~ ~ ~]
          ==
        (~(put by contracts-map.wallet) [(crip (z-co:co address.act)) contract-data])
      =.  wallet-map  (~(put by wallet-map) [wallet-index.act wallet])
      [address (~(put by wallets) [%ethereum wallet-map])]
    =/  node-url  (need provider:(~(got by networks.settings) %ethereum))
    =/  from-path=path  /from/[wallet-index.act]/[(crip (z-co:co address.act))]
    =/  from-me-sub=^vase
    !>  ^-  poke:watchlib
    %-  encode-ezub:erc20lib
    ^-  ezub:erc20
    :+  %watch  from-path
    :*  url=`@ta`node-url
        eager=%&
        refresh-rate=~s15
        timeout-time=~s30
        from=0
        to=~
        contracts=[address.act ~]
        batchers=~
        topics=~[%transfer address ~]
    ==
    =/  to-path=path  /to/[wallet-index.act]/[(crip (z-co:co address.act))]
    =/  to-me-sub=^vase
    !>  ^-  poke:watchlib
    %-  encode-ezub:erc20lib
    ^-  ezub:erc20
    :+  %watch  to-path
    :*  url=`@ta`node-url
        eager=%&
        refresh-rate=~s15
        timeout-time=~m1
        from=0
        to=~
        contracts=[address.act ~]
        batchers=~
        topics=~[%transfer ~ address]
    ==
    :_  state
    :~  :*  %pass
            /eth-config
            %agent
            [our.bowl %wallet-eth-watcher]
            %poke
            %eth-watcher-poke
            to-me-sub
        ==
        :*  %pass
            /eth-config
            %agent
            [our.bowl %wallet-eth-watcher]
            %poke
            %eth-watcher-poke
            from-me-sub
        ==
        (await-eth-watcher to-path)
        (await-eth-watcher from-path)
    ==
  ==
--
