/-  *realm-wallet, wallet-db
/+  bech32=bip-b173, bip32, ethereum
|%
++  bip44-codes
  ^-  (map chain @ud)
  %-  my
  :~  [%bitcoin 0]
      [%btctestnet 1]
      [%ethereum 60]
  ==
::
++  new-address
  |=  [xpub=@t =chain idx=@ud]
  =,  hmac:crypto
  =,  secp:crypto
  =+  ecc=secp256k1
  =/  code  (~(got by bip44-codes) chain)
  =/  xpub-bip32  (from-extended:bip32 (trip xpub))
  =/  path  "0/{<idx>}"
  =/  derived-pub  (derive-path:xpub-bip32 path)
  :-  ?-  chain
        %bitcoin
          (address:derived-pub %main)
        %btctestnet
          (address:derived-pub %testnet)
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
++  dejs-action
  =,  dejs:format
  |=  jon=json
  ^-  action
  %.  jon
  %-  of
  :~  [%initialize ul]
      [%set-xpub (ot ~[network+(su (perk %bitcoin %btctestnet %ethereum ~)) xpub+so])]
      [%set-chain-settings (ot ~[network+(su (perk %bitcoin %btctestnet %ethereum ~)) mode+(su (perk %default %on-demand ~)) who+(su (perk %nobody %friends %anybody ~)) blocked+(as (se %p)) share-index+ni who+(su (perk %nobody %friends %anybody ~)) mode+(su (perk %on-demand %default ~))])]
      [%set-passcode-hash (ot ~[hash+so])]
      [%set-wallet-creation-mode (ot ~[network+(su (perk %bitcoin %btctestnet %ethereum ~)) mode+(su (perk %on-demand %default ~))])]
      [%set-sharing-mode (ot ~[network+(su (perk %bitcoin %btctestnet %ethereum ~)) who+(su (perk %nobody %friends %anybody ~))])]
      [%set-sharing-permissions (ot ~[type+(su (perk %block ~)) who+(se %p)])]
      [%set-default-index (ot ~[network+(su (perk %bitcoin %btctestnet %ethereum ~)) index+ni])]
      [%create-wallet (ot ~[sndr+(se %p) network+(su (perk %bitcoin %btctestnet %ethereum ~)) nickname+so])]
      [%insert-transaction (ot ~[transaction-row+json-to-transaction-row])]
      [%complete-transaction (ot ~[txn-id+json-to-txn-id success+bo])]
      [%save-transaction-notes (ot ~[txn-id+json-to-txn-id notes+so])]
  ==
::
++  json-to-transaction-row
  =,  dejs:format
  %-  ot
  :~  :-  chain+(su (perk %ethereum %bitcoin %btctestnet ~))
        network+(su:dejs-soft:format (perk [%eth-main %eth-gorli ~]))
      wallet-index+ni
      address+so
      path+so
      nickname+so
  ==
::
++  json-to-txn-id
  =,  dejs:format
  %-  ot
  :~  chain+(su (perk %ethereum %bitcoin %btctestnet ~))
      network+%eth-main :: (su:dejs-soft:format (perk [%eth-main %eth-gorli ~]))
      hash+so
  ==
::
++  json-to-ux
  =,  dejs:format
  |=  =json
  ^-  @ux
  (scan (trip (so json)) ;~(pfix (jest '0x') hex))
::
::
++  enjs-update
  =,  enjs:format
  |=  =update
  ^-  json
  ::
  %-  pairs
  :_  ~
  :-  `cord`-.update
  ?-   -.update
      %eth-xpub
    ?~  xpub.update  ~
    [%s u.xpub.update]
  ::
      %settings
    %-  pairs
    ^-  (list [@t json])
    :~  ['passcodeHash' s+passcode-hash.update]
        :-  'chains'
        %-  pairs
        %+  turn  ~(tap by chains.update)
        |=  [=chain [xpub=(unit @t) default-index=@ud =sharing]]
        ^-  [@t json]
        :-  chain
        %-  pairs
        :~  ['defaultIndex' (numb default-index)]
            ['walletCreationMode' s+`cord`wallet-creation.sharing]
            ['sharingMode' s+`cord`who.sharing]
        ==
        =/  blocked
          ^-  (list json)
          =/  blocklist  ~(tap in blocked.update)
          %+  turn  blocklist
            |=  blocked=@p
            [%s (scot %p blocked)]
        ['blocked' a+blocked]
    ==
  ::
      %passcode-hash
    s+passcode-hash.update
  ::
      %address
    %-  pairs
    ?~  address.update
      ['address' ~]~
    ['address' [%s (crip (z-co:co u.address.update))]]~
  ==
--
