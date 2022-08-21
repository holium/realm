/-  sur=slip
=<  [sur .]
=,  sur
|%
++  agent  %slip
::
:: welcome to the fun part
:: ;}
++  enjs
  =,  enjs:format
  |%
  ++  action
    |=  act=^action
    ^-  json
    %+  frond  %slip-action
    %-  pairs
    :_  ~
    ^-  [cord json]
    :-  -.act
    ?-  -.act
    %slip
      %-  pairs
      :~
      ['from' %s (scot %p from.act)]
      ['data' %s data.act]
      ==
    %slop
      %-  pairs
      :~
        :-  'to'
          :-   %a
          %+  turn  to.act
            |=  her=@p
            [%s (scot %p her)]
        ['data' %s data.act]
      ==
    ==
  --
::
++  dejs
  =,  dejs:format
  |%
  ++  action
    |=  jon=json
    ^-  ^action
    =<  (decode jon)
    |%
    ++  decode
      %-  of
      :~  [%slip slip]
          [%slop slop]
      ==
    ++  patp
      (su ;~(pfix sig fed:ag))
    :: ::
    ++  slip
      %-  ot
      :~  [%from patp]
          [%data so]
      ==
    ++  slop
      %-  ot
      :~  [%to (ar patp)]
          [%data so]
      ==
    --
  --
--

