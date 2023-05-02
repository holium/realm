/-  *realm-wallet, db=wallet-db
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
        [%address =chain from=@ta ~]
      =/  [%address =chain from=@ta ~]  path
      =/  from=@p  (slav %p from)
      =/  wall-act=action  [%create-wallet our.bowl chain (crip (scow %p our.bowl))]
      =/  task  [%poke %realm-wallet-action !>(`action`wall-act)]
      :-  [%pass /addr/(scot %p from) %agent [from dap.bowl] task]~
      this
        [%updates ~]
      `this
    ==
  ++  on-leave  on-leave:def
  ++  on-peek
    |=  =path
    ^-  (unit (unit cage))
    ?>  (team:title our.bowl src.bowl)
    ?+    path  (on-peek:def path)
        [%x %eth-xpub ~]
      :^  ~  ~  %realm-wallet-update
      !>  ^-  update
      [%eth-xpub xpub:(~(got by chains.settings) %ethereum)]
        [%x %settings ~]
      :^  ~  ~  %realm-wallet-update
      !>  ^-  update
      [%settings settings.state]
        [%x %passcode-hash ~]
      :^  ~  ~  %realm-wallet-update
      !>  ^-  update
      [%passcode-hash passcode-hash.settings.state]
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
    =/  default-net-settings  [~ 0 %anybody %default]
    =.  chains.settings.state
      (~(put by chains.settings.state) [%ethereum default-net-settings])
    =.  chains.settings.state
      (~(put by chains.settings.state) [%bitcoin default-net-settings])
    =.  chains.settings.state
      (~(put by chains.settings.state) [%btctestnet default-net-settings])
    `state
    ::
      %set-xpub
    ?>  (team:title our.bowl src.bowl)
    =/  net  (~(got by chains.settings.state) chain.act)
    =.  chains.settings.state
      =/  net  (~(got by chains.settings.state) chain.act)
      =.  xpub.net  `xpub.act
      (~(put by chains.settings.state) [chain.act net])
    `state
    ::
      %set-chain-settings
    ?>  (team:title our.bowl src.bowl)
    =.  chains.settings
      =/  net-settings  (~(got by chains.settings) chain.act)
      =.  default-index.net-settings  share-index.act
      =.  wallet-creation.sharing.net-settings  mode.act
      =.  who.sharing.net-settings  who.act
      (~(put by chains.settings) [chain.act net-settings])
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
    =/  net-settings  (~(got by chains.settings.state) chain.act)
    =.  wallet-creation.sharing.net-settings  mode.act
    =.  chains.settings.state  (~(put by chains.settings.state) [chain.act net-settings])
    :_  state
    [%give %fact [/updates]~ %realm-wallet-update !>(`update`[%settings settings.state])]~
    ::
      %set-sharing-mode
    ?>  (team:title our.bowl src.bowl)
    =/  net-settings  (~(got by chains.settings.state) chain.act)
    =.  who.sharing.net-settings  who.act
    =.  chains.settings.state  (~(put by chains.settings.state) [chain.act net-settings])
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
    =.  chains.settings.state
      =/  prev-set  (~(got by chains.settings.state) chain.act)
      (~(put by chains.settings.state) [chain.act [xpub.prev-set index.act sharing.prev-set]])
    :_  state
    [%give %fact [/updates]~ %realm-wallet-update !>(`update`[%settings settings.state])]~
    ::
      %create-wallet
    ^-  (quip card _state)
    ::  permissions
    ::
    =/  null-address-card
      =/  wall-act=action  [%receive-address chain.act ~]
      =/  task  [%poke %realm-wallet-action !>(`action`wall-act)]
      [%pass /addr/(scot %p src.bowl) %agent [src.bowl dap.bowl] task]~
    =/  net-settings  (~(got by chains.settings.state) chain.act)
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
    =/  net-settings  (~(got by chains.settings.state) chain.act)
    =/  num-wallets  .^(@ud %gx /(scot %p our.bowl)/wallet-db/(scot %da now.bowl)/num-wallets/[chain.act]/noun)
    ?:  ?&  !(team:title our.bowl src.bowl)
            =(%default wallet-creation.sharing.net-settings)
            (gth num-wallets 0)
        ==
      =/  default-idx  default-index.net-settings
      =/  default-wallet  .^(wallet-row:db %gx /(scot %p our.bowl)/wallet-db/(scot %da now.bowl)/num-wallets/[chain.act]/[default-idx]/noun)
      :_  state
      ^-  (list card)
      =/  wall-act=action  [%receive-address chain.act `address.default-wallet]
      =/  task  [%poke %realm-wallet-action !>(`action`wall-act)]
      [%pass /addr/(scot %p src.bowl) %agent [src.bowl dap.bowl] task]~
    ::  create new wallet
    ::
    =/  wallet=(unit wallet-row)
      =/  xpub  xpub:(~(got by chains.settings.state) chain.act)
      ?~  xpub  ~
      =/  wallet-info  (new-address u.xpub chain.act num-wallets)
      =/  address  -:wallet-info
      =/  path     +:wallet-info
      ~&  >  (crip (weld "generated wallet address " (z-co:co address)))
      =/  wallet
        ^-  wallet-row
        :*  chain.act
            num-wallets
            path
            address
            nickname.act
        ==
      `wallet
    ::  no xpub
    ?~  wallet
      ~&  >>  'requested wallet with no xpub set'
      :_  state
      ^-  (list card)
      ?.  (team:title our.bowl src.bowl)
        =/  task  [%poke %realm-wallet-action !>(`action`[%receive-address chain.act ~])]
        [%pass /addr/(scot %p src.bowl) %agent [src.bowl dap.bowl] task]~
      ~
    =/  cards
      =/  task  [%poke %realm-wallet-db-action !>(`action:db`[%set-wallet u.wallet])]
      [%pass / %agent [src.bowl %wallet-db] task]~
    ::  send wallet to requester if not our
    ?:  !(team:title our.bowl src.bowl)
      =/  task  [%poke %realm-wallet-action !>(`action`[%receive-address chain.act `address:u.wallet])]
      :_  state
      (welp cards [%pass /addr/(scot %p src.bowl) %agent [src.bowl dap.bowl] task]~)
    [cards state]
    ::
      %request-address
    =/  task  [%poke %realm-wallet-action !>(`action`[%create-wallet our.bowl chain.act (crip (scow %p our.bowl))])]
    :-  [%pass /addr/(scot %p from.act) %agent [from.act dap.bowl] task]~
    state
      %receive-address
    =/  upd  `update`[%address src.bowl chain.act address.act]
    =/  update-path=path  /address/[(crip (scow %tas chain.act))]/[(crip (scow %p src.bowl))]
    :-
      :~  [%give %fact [update-path]~ %realm-wallet-update !>(upd)]
          [%give %kick ~[update-path] ~]
      ==
    state
    ::
  ==
::
--
