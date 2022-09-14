/+  ethereum
=,  jael
|%
+$  diff  ::  gift
    $%  [%history =loglist]
        [%logs =loglist]
        [%disavow id:block]
    ==
+$  ezub  ::  poke
    $%  [%watch =path config=watch-config]
        [%clear =path]
    ==
+$  event-data  ?([%approval owner=@ux spender=@ux value=@] [%transfer from=@ux to=@ux value=@])
+$  mined
  %-  unit
  $:  input=(unit @ux)
      log-index=@ud
      transaction-index=@ud
      transaction-hash=@ux
      block-number=@ud
      block-hash=@ux
      removed=?(%.y %.n)
  ==
+$  event-log
  $:  =mined
      =address:ethereum
      =event-data ::*::(event-log-config:builders event-update)
  ==
+$  watch-config
  $:  ::  url: ethereum node rpc endpoint
      ::  eager: if true, give logs asap, send disavows in case of reorg
      ::  refresh-rate: rate at which to check for updates
      ::  timeout-time: time an update check is allowed to take
      ::  from: oldest block number to look at
      ::  to: optional newest block number to look at
      ::  contracts: contract addresses to look at
      ::  topics: event descriptions to look for
      ::
      url=@ta
      eager=?
      refresh-rate=@dr
      timeout-time=@dr
      from=number:block
      to=(unit number:block)
      contracts=(list address:ethereum)
      batchers=(list address:ethereum)
      topics=(list ?(@ (list @)))::::~[@tas address:ethereum address:ethereum]
  ==
::+$  topics   (list ?(@ux (list @ux)))
::    %-  watch-config:builders
::    watch
+$  loglist  (list event-log)
::+$  kall
::    (call:builders erc20  call:methods)
::+$  zend
::    (send-tx:builders erc20 send:methods)
+$  rek
    $%
        [%allowance out=@ud]
        [%balance-of out=@ud]
        [%total-supply out=@ud]
    ==
+$  rez
  $:  name=?(%transfer-from %approve %decrease-allowance %increase-allowance %transfer)
      =address:ethereum  txh=@ux
      status=?  block=@ud
  ==
+$  event-update
    $%
        [%approval owner=@ux spender=@ux value=@ud]
        [%transfer from=@ux to=@ux value=@ud]
    ==
+$  watch
    $%
        [%approval owner=?(@ux (list @ux)) spender=?(@ux (list @ux)) ~]
        [%transfer from=?(@ux (list @ux)) to=?(@ux (list @ux)) ~]
    ==
++  methods
  |%
  ++  send
    $%
        [%transfer-from sender=@ux recipient=@ux amount=@ud]
        [%approve spender=@ux amount=@ud]
        [%decrease-allowance spender=@ux subtracted-value=@ud]
        [%increase-allowance spender=@ux added-value=@ud]
        [%transfer recipient=@ux amount=@ud]
    ==
  ++  call
    $%
        [%allowance owner=@ux spender=@ux]
        [%balance-of account=@ux]
        [%total-supply ~]
    ==
  --
--