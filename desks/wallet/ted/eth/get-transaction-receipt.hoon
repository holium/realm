/-  *wallet, spider
/+  ethio, strandio, ethereum
::
=,  strand=strand:spider
=*  eth  ethereum-types
=*  eth-rpc  rpc:ethereum
=*  eth-key  key:ethereum
::
|%
++  tape-to-ux
  |=  =tape
  ^-  @ux
  %+  scan  tape
  ;~(pfix (jest '0x') hex)
++  need-call-data
  |=  =mark
  =/  m  (strand:strandio ,~)
  ^-  form:m
  |=  tin=strand-input:strand
  ?.  =(mark %eth-call-data)
    `[%fail [%unexpected-mark >mark< ~]]
  `[%done ~]
++  need-atom
  |=  wut=*
  =/  m  (strand:strandio ,@)
  ^-  form:m
  |=  tin=strand-input:strand
  ?.  ?=(@tas wut)
    `[%fail [%head-of-noun-not-an-atom >mark< ~]]
  `[%done wut]
++  need-ux-from-json
  |=  wut=json
  =/  m  (strand:strandio ,@ux)
  ^-  form:m
  |=  tin=strand-input:strand
  ?.  ?=([%s *] wut)
    `[%fail [%expected-json-string-got >wut< ~]]
  `[%done (tape-to-ux (trip p.wut))]
++  json-to-ux
  |=  =json
  %-  tape-to-ux
  %-  sa:dejs:format
  json
++  json-hex-to-bool  ::  unsafe on unexpected values
  |=  =json
  ^-  ?
  =(1 (json-to-ux json))
++  parse-receipt
  =,  dejs:format
  %-  ot
  :~  status+json-hex-to-bool
      ['blockNumber' json-to-ux]
      :: ['transactionHash' json-to-ux]
  ==
++  give-txh
  |=  txh=@ux
  =/  m  (strand ,~)
  ^-  form:m
  :: =/  =(list card:agent:gall)
  %-  send-raw-cards:strandio
  :~  [%give %fact ~[/txh] %txh !>(txh)]
      [%give %kick ~[/txh] ~]
  ==
--
|=  args=vase
=+  !<  $:  url=@t
            id=@t
            txh=@ux
        ==
    args
=/  m  (strand:strandio ,vase)
^-  form:m
=|  tries=@ud
|-
=*  confirm-loop  $
=/  =request:eth-rpc  [%eth-get-transaction-receipt txh]
;<  res=json  bind:m  (request-rpc:ethio url [~ (cat 3 id '-rec')] request)
?~  res
  ;<  ~  bind:m
     ?.  (lth tries 60)
       (strand-fail:strandio %tx-too-long-to-mine leaf+"hash" >txh< ~)
    (sleep:strandio ~s30)
  confirm-loop(tries +(tries))
=/  txr=[status=? block=@ux]  (parse-receipt res)
(pure:m !>(`tx-rez`[txh status.txr `@ud`block.txr]))