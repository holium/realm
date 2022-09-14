/-  eth-watcher, *eth-contracts-erc20
/+  eth-abi
|%
++  diff-to-json
|=  =diff:::eth-watcher
=,  enjs:format
^-  json
%+  frond  %erc20
?-  -.diff
    %history
  ^-  json
::  *json
  %+  frond  %history
::  (event-log-to-json loglist.diff)
  [%a (turn loglist.diff event-log-to-json)]
    %logs
::  =/  test  (event-log-to-json loglist.diff)
::  *json
  %+  frond  %logs
  [%a (turn loglist.diff event-log-to-json)]
    %disavow
  !!
==
:: ++  rez-to-json
::   |=  =rez
::   =,  enjs:format
:: ++  rek-to-json
::   |=  =rek
::   =,  enjs:format

++  event-log-to-json
  |=  [=event-log]
  ^-  json
  =,  enjs:format
      ?-  -.event-data.event-log
          %approval
        %-  pairs
        :*
          [%type [%s %approval]]
          [%address [%s (crip (z-co:co address.event-log))]]
          :-  %payload
          %-  pairs
          :~
          [%owner [%s (crip (z-co:co owner.event-data.event-log))]]
          [%spender [%s (crip (z-co:co spender.event-data.event-log))]]
          [%value [%n (crip ((d-co:co 1) value.event-data.event-log))]]

          ==
          ?~  mined.event-log  ~
          :~
          :-  'txHash'
          [%s (crip (z-co:co transaction-hash.u.mined.event-log))]
          :-  'block'
          [%s (crip ((d-co:co 1) block-number.u.mined.event-log))]
          ==
        ==
          %transfer
        %-  pairs
        :*
          [%type [%s %transfer]]
          [%address [%s (crip (z-co:co address.event-log))]]
          :-  %payload
          %-  pairs
          :~
          [%from [%s (crip (z-co:co from.event-data.event-log))]]
          [%to [%s (crip (z-co:co to.event-data.event-log))]]
          [%value [%n (crip ((d-co:co 1) value.event-data.event-log))]]

          ==
          ?~  mined.event-log  ~
          :~
          :-  'txHash'
          [%s (crip (z-co:co transaction-hash.u.mined.event-log))]
          :-  'block'
          [%s (crip ((d-co:co 1) block-number.u.mined.event-log))]
          ==
        ==
      ==
++  encode-ezub
  |=  =ezub
  ^-  poke:eth-watcher
  ?-  -.ezub
      %watch
      =/  =topics:eth-watcher
        ?+  -.topics.config.ezub  !!
            %approval
          :-  0x8c5b.e1e5.ebec.7d5b.d14f.7142.7d1e.84f3.dd03.14c0.f7b2.291e.5b20.0ac8.c7c3.b925
          (encode-topics:eth-abi ~[%address %address] +.topics.config.ezub)
            %transfer
          :-  0xddf2.52ad.1be2.c89b.69c2.b068.fc37.8daa.952b.a7f1.63c4.a116.28f5.5a4d.f523.b3ef
          (encode-topics:eth-abi ~[%address %address] +.topics.config.ezub)
            %approval-for-all
          :-  0x1730.7eab.39ab.6107.e889.9845.ad3d.59bd.9653.f200.f220.9204.89ca.2b59.3769.6c31
        ==
      =/  =config:eth-watcher
        :*  url=url.config.ezub
            eager=eager.config.ezub
            refresh-rate=refresh-rate.config.ezub
            timeout-time=timeout-time.config.ezub
            from=from.config.ezub
            to=~
            contracts=contracts.config.ezub
            batchers=~
            topics
        ==
      :*  %watch
          path.ezub
          config
      ==
      %clear
    ezub
  ==
++  decode-diff
  |=  =diff:eth-watcher
  ^-  ^diff
  ?-  -.diff
      %history
    :-  %history
    %+  turn  loglist.diff  decode-log
      %logs
    :-  %logs
    %+  turn  loglist.diff  decode-log
      %disavow
    diff
  ==
++  decode-rek
  |=  [name=@tas result=@t]
  ^-  rek
  ?+  name  ~|  "unexpected result in contract erc20"  !!
        %allowance
      [%allowance (decode-results:rpc:ethereum result ~[%uint])]
        %balance-of
      [%balance-of (decode-results:rpc:ethereum result ~[%uint])]
        %total-supply
      [%total-supply (decode-results:rpc:ethereum result ~[%uint])]
  ==
++  encode-send
  |=  =send:methods
  ^-  call-data:rpc:ethereum
  ?-  -.send
        %transfer-from
      :-  'transferFrom(address,address,uint256)'
      (tuple-to-eth-data:eth-abi ~[%address %address %uint] +.send)
        %approve
      :-  'approve(address,uint256)'
      (tuple-to-eth-data:eth-abi ~[%address %uint] +.send)
        %decrease-allowance
      :-  'decreaseAllowance(address,uint256)'
      (tuple-to-eth-data:eth-abi ~[%address %uint] +.send)
        %increase-allowance
      :-  'increaseAllowance(address,uint256)'
      (tuple-to-eth-data:eth-abi ~[%address %uint] +.send)
        %transfer
      :-  'transfer(address,uint256)'
      (tuple-to-eth-data:eth-abi ~[%address %uint] +.send)
  ==
++  encode-call
  |=  =call:methods
  ^-  call-data:rpc:ethereum
  ?-  -.call
        %allowance
      :-  'allowance(address,address)'
      (tuple-to-eth-data:eth-abi ~[%address %address] +.call)
        %balance-of
      :-  'balanceOf(address)'
      (tuple-to-eth-data:eth-abi ~[%address] +.call)
        %total-supply
      :-  'totalSupply()'
      ~
  ==
++  decode-log
  |=  [=event-log:rpc:ethereum]
  ^-  ^event-log
  ?:  =(i.topics.event-log 0x8c5b.e1e5.ebec.7d5b.d14f.7142.7d1e.84f3.dd03.14c0.f7b2.291e.5b20.0ac8.c7c3.b925)
    :*  mined.event-log
        address.event-log
        %+  event-data-to-tuple:eth-abi
          [%approval (decode-topics:rpc:ethereum t.topics.event-log ~[%address %address])]
        (decode-results:rpc:ethereum data.event-log ~[%uint])
    ==
  ?:  =(i.topics.event-log 0xddf2.52ad.1be2.c89b.69c2.b068.fc37.8daa.952b.a7f1.63c4.a116.28f5.5a4d.f523.b3ef)
    :*  mined.event-log
        address.event-log
        %+  event-data-to-tuple:eth-abi
          [%transfer (decode-topics:rpc:ethereum t.topics.event-log ~[%address %address])]
        (decode-results:rpc:ethereum data.event-log ~[%uint])
    ==
~|  "unexpected event in ERC721"  !!
--