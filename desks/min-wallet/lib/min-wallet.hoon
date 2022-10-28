/-  *min-wallet
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
  |=  [xpub=@t =network idx=@ud]
  =,  hmac:crypto
  =,  secp:crypto
  =+  ecc=secp256k1
  =/  code  (~(got by bip44-codes) network)
  =/  xpub-bip32  (from-extended:bip32 (trip xpub))
  =/  path  "{<idx>}"
  =/  derived-pub  (derive-path:xpub-bip32 path)
  :-  ?-  network
        %bitcoin
          (address:derived-pub %main)
        %ethereum
          (address-from-pub:key:ethereum (serialize-point.ecc pub:derived-pub))
      ==
  =/  path  "m/44'/{<code>}'/0'/0/{<idx>}"
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
    ^-  help-transaction
    %.  json
    %-  of
    :~  [%eth [%eth (ot ~[hash+so amount+so network+(su (perk %bitcoin %ethereum ~)) type+(su (perk %sent %received ~)) initiated-at+so completed-at+so:dejs-soft:format our-address+so their-patp+so:dejs-soft:format their-address+so status+(su (perk %pending %failed %succeeded ~)) failure-reason+so:dejs-soft:format notes+so])]]
        [%erc20 [%erc20 (ot ~[hash+so contract-address+json-to-ux token+so network+(su (perk %bitcoin %ethereum ~)) type+(su (perk %sent %received ~)) initiated-at+so completed-at+so:dejs-soft:format our-address+so their-patp+so:dejs-soft:format their-address+so status+(su (perk %pending %failed %succeeded ~)) failure-reason+so:dejs-soft:format notes+so])]]
        [%erc721 [%erc721 (ot ~[hash+so contract-address+json-to-ux amount+so network+(su (perk %bitcoin %ethereum ~)) type+(su (perk %sent %received ~)) initiated-at+so completed-at+so:dejs-soft:format our-address+so their-patp+so:dejs-soft:format their-address+so status+(su (perk %pending %failed %succeeded ~)) failure-reason+so:dejs-soft:format notes+so])]]
    ==
  ?-  -.tx
      %eth
    :*  %eth
        hash.tx
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
      %erc20
    :*  %erc20
        hash.tx
        contract-address.tx
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
      %erc721
    :*  %erc721
        hash.tx
        contract-address.tx
        token.tx
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
  ==
::
++  transaction-to-json
  =,  enjs:format
  |=  =transaction
  ^-  json
  %-  pairs
  ?-  -.transaction
      %eth
    :~  ['hash' [%s hash.transaction]]
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
      %erc20
    :~  ['hash' [%s hash.transaction]]
        ['contract-address' [%s (crip (z-co:co contract-address.transaction))]]
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
      %erc721
    :~  ['hash' [%s hash.transaction]]
        ['contract-address' [%s (crip (z-co:co contract-address.transaction))]]
        ['token' [%s token.transaction]]
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
  ==
::
++  dejs-action
  =,  dejs:format
  |=  jon=json
  ^-  action
  %.  jon
  %-  of
  :~  [%set-xpub (ot ~[network+(su (perk %bitcoin %ethereum ~)) xpub+so])]
      [%set-settings (ot ~[network+(su (perk %bitcoin %ethereum ~)) mode+(su (perk %default %on-demand ~)) who+(su (perk %nobody %friends %anybody ~)) blocked+(as (se %p)) share-index+ni])]
      [%set-wallet-creation-mode (ot ~[mode+(su (perk %on-demand %default ~))])]
      [%set-sharing-mode (ot ~[who+(su (perk %nobody %friends %anybody ~))])]
      [%set-sharing-permissions (ot ~[type+(su (perk %allow %block ~)) who+(se %p)])]
      [%set-default-index (ot ~[network+(su (perk %bitcoin %ethereum ~)) index+ni])]
      [%set-wallet-nickname (ot ~[network+(su (perk %bitcoin %ethereum ~)) index+ni nickname+so])]
      [%create-wallet (ot ~[sndr+(se %p) network+(su (perk %bitcoin %ethereum ~)) nickname+so])]
      [%enqueue-transaction (ot ~[network+(su (perk %bitcoin %ethereum ~)) net+so wallet+ni hash+json-to-ux transaction+json-to-transaction])]
      [%save-transaction-notes (ot ~[network+(su (perk %bitcoin %ethereum ~)) net+so wallet+ni hash+so notes+so])]
  ==
::
++  json-to-ux
  =,  dejs:format
  |=  =json
  ^-  @ux
  (scan (trip (so json)) ;~(pfix (jest '0x') hex))
::
++  transactions-to-json
  =,  enjs:format
  |=  transactions=(map net=@t (map @t transaction))
  ^-  json
    %-  pairs
    =/  tx-list  ~(tap by transactions)
    %+  turn  tx-list
    |=  [net=@t transactions=(map @t transaction)]
    ^-  [@t json]
    :-  net
      %-  pairs
      =/  tx-list  ~(tap by transactions)
      %+  turn  tx-list
      |=  [key=@t =transaction]
      ^-  [@t json]
      [key (transaction-to-json transaction)]
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
        ['net' [%s net.update]]
        ['index' (numb +>+<.update)]
        ['key' [%s +>+>-.update]]
        ['transaction' (transaction-to-json +>+>+.update)]
    ==
  ::
      %wallet
    ^-  json
    %-  pairs
    ^-  (list [@t json])
    :~  ['network' [%s network.update]]
        ['key' [%s +>-.update]]
        ['address' [%s (crip (z-co:co address.wallet.update))]]
        ['path' [%s path.wallet.update]]
        ['nickname' [%s nickname.wallet.update]]
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
      |=  [=network wallets=(map @ud =wallet)]
      ^-  [@t json]
      |^
      =/  wallet-list
        ^-  (list [@ud =wallet])
        ~(tap by wallets)
      :-  `@t`network
        %-  pairs
        ^-  (list [@t json])
        %+  turn  wallet-list
          jsonify-wallet
      ++  jsonify-wallet
        |=  [key=@ud =wallet]
        ^-  [@t json]
        :-  (crip (scow %ud key))
            %-  pairs
            ^-  (list [@t json])
            :~  ['address' [%s (crip (z-co:co address.wallet))]]
                ['path' [%s path.wallet]]
                ['nickname' [%s nickname.wallet]]
                ['transactions' (transactions-to-json transactions.wallet)]
            ==
      --
    --
  ==
--
