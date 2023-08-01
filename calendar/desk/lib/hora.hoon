|%
:: optional date
::
+$  moment  (unit @da)
:: ordinal numbers for weekday in a month
::
+$  ord  ?(%first %second %third %fourth %last)
:: days of the week
::
+$  wkd      ?(%mon %tue %wed %thu %fri %sat %sun)
+$  wkd-num  ?(%0 %1 %2 %3 %4 %5 %6)
:: months of year
::
+$  mnt      ?(%jan %feb %mar %apr %may %jun %jul %aug %sep %oct %nov %dec)
+$  mnt-num  ?(%1 %2 %3 %4 %5 %6 %7 %8 %9 %10 %11 %12)
::
+$  dext     [i=@ud d=@da] :: indexed time
+$  delta    [sign=? d=@dr] :: positive or negative offset
+$  span     [l=@da r=@da] :: UTC datetime pair
+$  fullday  @da
::
+$  rule-exception
  $%  [%skip ~]
      [%rule-error msg=@t]
  ==
:: Should never abandon support for any of these...
:: If need to update an arg, add a version like %ud-1...
::
+$  arg
  $%  [%ud p=@ud]
      [%od p=ord]
      [%da p=@da]
      [%dr p=@dr]
      [%dl p=delta]
      [%dx p=dext]
      [%wl p=(list wkd-num)]
  ==
::
++  wkd-to-num
  |=(=wkd `@ud`?-(wkd %mon 0, %tue 1, %wed 2, %thu 3, %fri 4, %sat 5, %sun 6))
::
++  mnt-to-num
  |=  =mnt
  ^-  @ud
  ?-  mnt
    %jan  1
    %feb  2
    %mar  3
    %apr  4
    %may  5
    %jun  6
    %jul  7
    %aug  8
    %sep  9
    %oct  10
    %nov  11
    %dec  12
  ==
::
++  num-to-wkd
  |=  num=@ud
  ^-  wkd
  ?:  =(0 num)  %mon
  ?:  =(1 num)  %tue
  ?:  =(2 num)  %wed
  ?:  =(3 num)  %thu
  ?:  =(4 num)  %fri
  ?:  =(5 num)  %sat
  ?:  =(6 num)  %sun
  !!
:: ~2000.1.1 was a saturday
:: 0, 1, 2, 3, 4, 5, 6
:: m, t, w, t, f, s, s
::
++  get-weekday
  |=  d=@da
  ^-  @
  %-  (curr mod 7)  %+  add  5  :: center on saturday
  ?:  (gth d ~2000.1.1)
    (mod (div (sub d ~2000.1.1) ~d1) 7)
  (sub 7 (mod +((div (sub ~2000.1.1 d) ~d1)) 7))
::
++  days-in-month
  |=  [[a=? y=@ud] m=@ud]
  `@ud`?>(a (snag (dec m) ?:((yelp y) moy:yo moh:yo)))
::
++  sub-wkd
  |=  [a=@ud b=@ud]
  ^-  @ud
  ?>  &((lth a 7) (lth b 7))
  ?:  (gte a b)  (sub a b)
  (add a (sub 7 b))
::
++  btwn
  |=  [=@da s=moment e=moment]
  ^-  ?
  ?&  ?~(e & (lth da u.e))
      ?~(s & (gte da u.s))
  ==
::
++  sane-fd  |=(fd=@da ~|(%insane-fullday ?>(=(0 (mod fd ~d1)) fd)))
::
++  apply-delta  |=([=@da =delta] `@da`(?:(sign.delta add sub) da d.delta))
::
++  days-of-week
  |=  [start=@da weekdays=(list wkd-num)]
  |=  idx=@ud
  |^  ^-  @da
  =.  start               (sane-fd start)
  =/  cycle-count=@ud     (div idx (lent weekdays))
  =/  cycle-offset=@ud    (mod idx (lent weekdays))
  =/  total-offset=@ud    (add (mul 7 cycle-count) (snag cycle-offset shifted-days))
  (add start (mul ~d1 total-offset))
  ++  start-wkd     `wkd-num`(wkd-num (get-weekday start))
  ++  on            ((^on @ @) lth)
  ++  shift         |=(w=@ :_(~ (sub-wkd w start-wkd)))
  ++  weekdays-mop
    ^-  ((mop @ @) lth)
    (gas:on *((mop @ @) gth) (turn weekdays shift))
  ++  shifted-days  (turn (tap:on weekdays-mop) head)
  --
::
++  monthly-nth-weekday
  |=  [start=@da =ord w=@]
  |=  idx=@ud
  ^-  (unit @da) :: null if does not exist
  =.  start            (sane-fd start)
  =/  start-year=@ud   y:(yore start)
  =/  start-month=@ud  (dec m:(yore start)) :: 0-indexed
  =/  curr-year=@ud    (add (div (add idx start-month) 12) start-year)
  =/  curr-month=@ud   +((mod (add idx start-month) 12))
  =/  nwkd=date        [[& curr-year] curr-month 1 0 0 0 ~]
  :: shift to first w
  ::
  =/  v  (get-weekday (year nwkd))
  =.  d.t.nwkd  (add d.t.nwkd (sub-wkd w v))
  =.  nwkd
    ?-    ord
      %first   nwkd
      %second  nwkd(d.t (add 7 d.t.nwkd))
      %third   nwkd(d.t (add 14 d.t.nwkd))
      %fourth  nwkd(d.t (add 21 d.t.nwkd))
      ::
        %last
      ?.  (lte (add 28 d.t.nwkd) (days-in-month [[a y] m]:nwkd))
        nwkd(d.t (add 21 d.t.nwkd))
      nwkd(d.t (add 28 d.t.nwkd))
    ==
  ?.(=(nwkd (yore (year nwkd))) ~ `(year nwkd))
::
++  monthly-on-day
  |=  start=@da
  |=  idx=@ud
  ^-  (unit @da) :: null if does not exist
  =.  start            (sane-fd start)
  =/  start-year=@ud   y:(yore start)
  =/  start-month=@ud  (dec m:(yore start)) :: 0-indexed
  =/  day=@ud          d.t:(yore start)
  =/  curr-year=@ud    (add (div (add idx start-month) 12) start-year)
  =/  curr-month=@ud   +((mod (add idx start-month) 12))
  =/  datetime=@da     (year [[& curr-year] curr-month day 0 0 0 ~])
  ?.(=(day d.t:(yore datetime)) ~ `datetime)
::
++  yearly-on-date
  |=  start=@da
  |=  idx=@ud
  ^-  (unit @da) :: null if does not exist
  =.  start            (sane-fd start)
  =/  start-year=@ud   y:(yore start)
  =/  [m=@ud d=@ud]    [m d.t]:(yore start)
  =/  curr-year=@ud    (add idx start-year)
  =/  datetime=@da     (year [[& curr-year] m d 0 0 0 ~])
  ?~(=([m d] [m d.t]:(yore datetime)) ~ `datetime)
--
