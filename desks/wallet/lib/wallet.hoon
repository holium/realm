/-  *wallet
/+  bech32=bip-b173, bip32, ethereum
|%
++  bip44-codes
  ^-  (map network @ud)
  %-  my
  :~  [%bitcoin 0]
      [%ethereum 60]
  ==
::
++  new-address
  |=  [xpub=@t =network idx=@]
  =,  hmac:crypto
  =,  secp:crypto
  =+  ecc=secp256k1
  =/  code  (~(got by bip44-codes) network)
  =/  xpub-bip32  (from-extended:bip32 (trip xpub))
  =/  udidx  (slav %ud idx)
  =/  path  "{<udidx>}"
  =/  derived-pub  (derive-path:xpub-bip32 path)
  :-  ?-  network
        %bitcoin
          (address:derived-pub %main)
        %ethereum
          (address-from-pub:key:ethereum (serialize-point.ecc pub:derived-pub))
      ==
  =/  path  "m/44'/{<code>}'/0'/0/{<udidx>}"
  (crip path)
::
++  split-xpub
  |=  xpub=@
  ^-  [@ @]
  :-  (rsh 8 xpub)
  (end 8 xpub)
::
++  btc-address
  |=  [ki=@ ci=@]
  ^-  address
  *address
::
++  hex-from-cord
  |=  transaction
  0
::
++  json-to-transaction
  =,  dejs:format
  |=  =json
  ^-  transaction
  =/  tx
    ^-  help-tx
    %.  json
    (ot ~[hash+so amount+so network+(su (perk %bitcoin %ethereum ~)) type+(su (perk %sent %received ~)) initiated-at+so completed-at+so:dejs-soft:format our-address+so their-patp+so:dejs-soft:format their-address+so status+(su (perk %pending %failed %succeeded ~)) failure-reason+so:dejs-soft:format notes+so])
  :*  hash.tx
      amount.tx
      network.tx
      type.tx
      initiated-at.tx
      completed-at.tx
      our-address.tx
      ?~  their-patp.tx  ~
      [~ `@p`(slav %p u.their-patp.tx)]
      their-address.tx
      status.tx
      failure-reason.tx
      notes.tx
  ==
::
++  transaction-to-json
  =,  enjs:format
  |=  =transaction
  ^-  json
  %-  pairs
  :~  ['hash' [%s hash.transaction]]
      ['amount' [%s amount.transaction]]
      ['network' [%s network.transaction]]
      ['type' [%s type.transaction]]
      ['initiatedAt' [%s initiated-at.transaction]]
      :-  'completedAt'
        ?~  completed-at.transaction  ~
        [%s u.completed-at.transaction]
      ['ourAddress' [%s our-address.transaction]]
      :-  'theirPatp'
        ?~  their-patp.transaction  ~
        [%s (crip (scow %p u.their-patp.transaction))]
      ['theirAddress' [%s their-address.transaction]]
      ['status' [%s status.transaction]]
      :-  'failureReason'
        ?~  failure-reason.transaction  ~
        [%s u.failure-reason.transaction]
      ['notes' [%s notes.transaction]]
  ==
::
++  dejs-action
  =,  dejs:format
  |=  jon=json
  ^-  action
  |^
  %.  jon
  %-  of
  :~  [%set-xpub (ot ~[network+(su (perk %bitcoin %ethereum ~)) xpub+so])]
      [%set-wallet-creation-mode (ot ~[mode+(su (perk %on-demand %default ~))])]
      [%set-sharing-mode (ot ~[who+(su (perk %nobody %friends %anybody ~))])]
      [%sharing-permissions (ot ~[type+(su (perk %allow %block ~)) who+(se %p)])]
      [%set-default-index (ot ~[network+(su (perk %bitcoin %ethereum ~)) index+so])]
      [%set-wallet-nickname (ot ~[network+(su (perk %bitcoin %ethereum ~)) index+ni nickname+so])]
      [%set-network-provider (ot ~[network+(su (perk %bitcoin %ethereum ~)) provider+so])]
      [%create-wallet (ot ~[sndr+(se %p) network+(su (perk %bitcoin %ethereum ~)) nickname+so])]
      [%enqueue-transaction (ot ~[network+(su (perk %bitcoin %ethereum ~)) hash+json-to-ux transaction+json-to-transaction])]
      [%add-smart-contract (ot ~[contract-id+so contract-type+(su (perk %erc20 %erc721 ~)) name+so address+json-to-ux wallet-index+so])]
      [%save-transaction-notes (ot ~[network+(su (perk %bitcoin %ethereum ~)) hash+so notes+so])]
  ==
  ++  json-to-ux
    |=  =json
    ^-  @ux
    (scan (trip (so json)) ;~(pfix (jest '0x') hex))
  --
::
++  enjs-update
  =,  enjs:format
  |=  =update
  ^-  json
  ?-    -.update
      %address
    %-  pairs
    ?~  address.update
      ['address' ~]~
    :~  ['address' [%s (crip (z-co:co u.address.update))]]
    ==
  ::
      %transaction
    %-  pairs
    :~  ['network' [%s network.update]]
        ['key' [%s +>-.update]]
        ['transaction' (transaction-to-json +>+<.update)]
        ['success' [%b success.update]]
    ==
  ::
      %history
    %-  pairs
    |^
    =/  transaction-list  ~(tap by +.update)
    %+  turn  transaction-list
      jsonify-transaction-map
    ++  jsonify-transaction-map
      |=  [=network transactions=(map @t transaction)]
      ^-  [@t json]
      :-  `@t`network
        %-  pairs
::        ~(tap by transactions)
        =/  tx-list  ~(tap by transactions)
        %+  turn  tx-list
        |=  [key=@t =transaction]
        ^-  [@t json]
        :-  key
        (transaction-to-json transaction)
    --
  ::
      %wallet
    ^-  json
    %-  pairs
    ^-  (list [@t json])
    :~  ['network' [%s network.update]]
        ['key' [%s +>-.update]]
        :-  'wallet'
          %-  pairs
          :~  ['address' [%s (crip (z-co:co address.wallet.update))]]
              ['path' [%s path.wallet.update]]
              ['nickname' [%s nickname.wallet.update]]
              ['balance' (numb balance.wallet.update)]
              :-  'contracts'
              %-  pairs
              %+  turn  ~(tap by contracts-map.wallet.update)
              |=  [contract-id=@t =contract-data]
              ^-  [@t json]
              :-  contract-id
              ?-  -.contract-data
                  %erc20
                %-  pairs
                :~  ['type' [%s `@t`name.contract-data]]
                    ['name' [%s name.contract-data]]
                    ['address' [%s (crip (z-co:co address.contract-data))]]
                    ['balance' (numb balance.contract-data)]
                ==
                  %erc721
                %-  pairs
                :~  ['type' s+'erc721']
                    ['name' s+name.contract-data]
                    ['address' [%s (crip (z-co:co address.contract-data))]]
                    :-  'tokens'
                    :-  %a
                    %+  turn  ~(tap in tokens.contract-data)
                    numb
                ==
              ==
          ==
    ==
  ::
      %wallets
    %-  pairs
    ^-  (list [@t json])
    |^
    =/  wallet-list  ~(tap by +.update)
    %+  turn  wallet-list
      jsonify-wallet-map
    ++  jsonify-wallet-map
      |=  [=network wallets=(map @t =wallet)]
      ^-  [@t json]
      |^
      =/  wallet-list
        ^-  (list [@t =wallet])
        ~(tap by wallets)
      :-  `@t`network
        %-  pairs
        ^-  (list [@t json])
        %+  turn  wallet-list
          jsonify-wallet
      ++  jsonify-wallet
        |=  [key=@t =wallet]
        ^-  [@t json]
        :-  key
            %-  pairs
            ^-  (list [@t json])
            :~  ['address' [%s (crip (z-co:co address.wallet))]]
                ['path' [%s path.wallet]]
                ['nickname' [%s nickname.wallet]]
                ['balance' (numb balance.wallet)]
            ==
      --
    --
  ==
--
