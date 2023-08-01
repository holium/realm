/-  *calendar, b=boxes, p=pools
/+  r=rules
=>  |%
    +$  state-0
      $:  %0
          rules=(map rid rule)
          calendars=(map cid calendar)
          boxes:b
      ==
    +$  cache
      $:  to-to-boths=(map rid to-to-both)
          to-to-lefts=(map rid to-to-left)
          to-to-fulldays=(map rid to-to-fullday)
      ==
    +$  inflated-state  [state-0 =cache]
    +$  card  card:agent:gall
    +$  sign  sign:agent:gall
    --
=|  cards=(list card)
|_  [=bowl:gall inflated-state]
+*  this   .
    state  +<+<
    rul    ~(. r [bowl rules])
++  abet  [(flop cards) state]
++  emit  |=(=card this(cards [card cards]))
++  emil  |=(cadz=(list card) this(cards (weld cadz cards)))
++  emil-cal
  |=  [cards=(list card) =cid cal=calendar]
  (emil(calendars (~(put by calendars) cid cal)) cards)
::
++  en-path  |=(=cid `path`/calendar/[(scot %p host.cid)]/[name.cid])
::
++  follow-calendar
  |=  =cid
  ^-  _this
  =/  =wire  (en-path cid)
  =/  =dock  [host.cid dap.bowl]
  ?:  (~(has by wex.bowl) wire dock)  this
  (emit %pass wire %agent dock %watch wire)
::
++  leave-calendar
  |=  =cid
  ^-  _this
  =/  =wire  (en-path cid)
  =/  =dock  [host.cid dap.bowl]
  ?.  (~(has by wex.bowl) wire dock)  this
  (emit %pass wire %agent dock %leave ~)
::
++  get-role
  |=  [=cid =ship]
  ^-  (unit role)
  =+  scry:(~(got by calendars) cid)
  =+  :(weld /(scot %p our.bowl)/[dude]/(scot %da now.bowl) path /noun)
  (.^(roles-gate %gx -) cid ship)
::
++  is-admin
  |=  [=cid =ship]
  ^-  ?
  =/  r=(unit role)  (get-role cid ship)
  |(=(ship host.cid) ?~(r %| =(%admin u.r)))
::
++  get-to-fullday
  |=  [=rid =kind =args]
  ^-  to-fullday
  ?>  ?=(%fuld q.rid)
  ?>  ?=(%fuld -.kind)
  =/  =to-to-fullday
    (~(got by to-to-fulldays.cache) rid)
  (to-to-fullday args)
::
++  get-to-span
  |=  [=rid =kind =args]
  ^-  to-span
  ?>  ?=(?(%both %left) q.rid)
  ?-    q.rid
      %both
    ?>  ?=(%both -.kind)
    |=  idx=@ud
    ^-  span-instance
    =/  =to-to-both  (~(got by to-to-boths.cache) rid)
    =/  =to-both     (to-to-both args)
    =/  out=(each [l=dext r=dext] rule-exception)  (to-both idx)
    ?:  ?=(%| -.out)  [%| p.out]
    =/  letz=tz-to-utc  |=(dext `d) :: get from lz.kind
    =/  ritz=tz-to-utc  |=(dext `d) :: get from rz.kind
    =/  l  (letz l.p.out)
    =/  r  (ritz r.p.out)
    ?:  ?&(?=(^ l) ?=(^ r))
      ?:  (lte u.l u.r)
        [%& u.l u.r]
      :^  %|  %out-of-order
        [[lz.kind l.p.out] u.l]
      [[rz.kind r.p.out] u.r]
    :^  %|  %bad-index
      ?^(l ~ `[lz.kind l.p.out])
    ?^(r ~ `[rz.kind r.p.out])
    ::
      %left
    ?>  ?=(%left -.kind)
    |=  idx=@ud
    ^-  span-instance
    =/  =to-to-left  (~(got by to-to-lefts.cache) rid)
    =/  =to-left     (to-to-left args)
    =/  out=(each dext rule-exception)  (to-left idx)
    ?:  ?=(%| -.out)  [%| p.out]
    =/  =tz-to-utc  |=(dext `d)       :: get from tz.kind
    =/  =utc-to-tz  |=(d=@da [~ 0 d]) :: get from tz.kind
    =/  l  (tz-to-utc p.out)
    ?~  l  [%| %bad-index `[tz.kind p.out] ~]
    =/  r=@da  (add u.l d.kind)
    ?^  (utc-to-tz r)  [%& u.l r]
    [%| %out-of-bounds tz.kind r]
  ==
:: TODO: check permissions on these things
::
++  create-calendar
  |=  [=cid title=@t description=@t scry=(unit roles-scry)]
  ^-  _this
  ?>  (has-pool cid)
  =|  =calendar
  =?  scry.calendar  ?=(^ scry)  u.scry
  =.  calendars  (~(put by calendars) cid calendar)
  =/  core  (init:(abed:ca cid) title description)
  =.  this  (emil-cal abot:(do-updates:core [%role %& host.cid %admin]~))
  :: send calendar creation update on /home
  ::
  =/  =cage  calendar-home-update+!>([%calendar %& cid])
  =.  this  (emit %give %fact ~[/home] cage)
  :: watch pool path
  ::
  =/  =wire  /pool/(scot %p host.cid)/[name.cid]
  (emit %pass wire %agent [our.bowl %pools] %watch wire)
::
++  update-calendar
  |=  [=cid fields=(list calendar-field)]
  ^-  _this
  (emil-cal abot:(do-updates:(abed:ca cid) fields))
::
++  update-graylist
  |=  [=cid fields=(list field:p)]
  :: only an admin can update the graylist
  ::
  ?>  (is-admin cid src.bowl)
  :: forward to %pools
  ::
  =/  axn  pools-crud-command+!>([cid %update fields])
  (emit %pass / %agent [our.bowl %pools] %poke axn)
::
++  delete-calendar
  |=  =cid
  ^-  _this
  :: only you, the host, can delete your calendar pool
  ::
  ?>  =(src our):bowl
  ?>  =(src.bowl host.cid)
  :: delete calendar and send update
  ::
  =.  calendars  (~(del by calendars) cid)
  :: kick all watchers
  ::
  =.  this  (emit %give %kick ~[(en-path cid)] ~)
  :: leave pool
  ::
  =/  =wire  /pool/(scot %p host.cid)/[name.cid]
  =.  this  (emit %pass wire %agent [src.bowl %pools] %leave ~)
  :: send calendar deletion update on /home
  ::
  =/  =cage  calendar-home-update+!>([%calendar %| cid])
  =.  this  (emit %give %fact ~[/home] cage)
  :: forward to %pools
  ::
  =/  axn  pools-crud-command+!>([cid %delete ~])
  (emit %pass / %agent [our.bowl %pools] %poke axn)
::
++  create-event
  |=  [=cid =eid =dom =aid =rid =kind =args =mid =meta]
  ^-  _this
  (emil-cal abot:(create-event:(abed:ca cid) eid dom aid rid kind args mid meta))
::
++  create-event-until
  |=  [=cid =eid start=@ud until=@da =aid =rid =kind =args =mid =meta]
  ^-  _this
  (emil-cal abot:(create-event-until:(abed:ca cid) eid start until aid rid kind args mid meta))
::
++  create-event-rule
  |=  [=cid =eid =aid =rid =kind =args]
  ^-  _this
  (emil-cal abot:(create-event-rule:(abed:ca cid) eid aid rid kind args))
::
++  update-event-rule
  |=  [=cid =eid =aid =rid =kind =args]
  ^-  _this
  (emil-cal abot:(update-event-rule:(abed:ca cid) eid aid rid kind args))
::
++  delete-event-rule
  |=  [=cid =eid =aid]
  ^-  _this
  (emil-cal abot:(delete-event-rule:(abed:ca cid) eid aid))
::
++  create-event-metadata
  |=  [=cid =eid =mid =meta]
  ^-  _this
  (emil-cal abot:(create-event-metadata:(abed:ca cid) eid mid meta))
::
++  update-event
  |=  [=cid =eid fields=(list event-field)]
  ^-  _this
  (emil-cal abot:(update-event:(abed:ca cid) eid fields))
::
++  update-event-instances
  |=  [=cid =eid =dom fields=(list instance-field)]
  ^-  _this
  (emil-cal abot:(update-event-instances:(abed:ca cid) eid dom fields))
::
++  update-event-domain
  |=  [=cid =eid =dom]
  ^-  _this
  (emil-cal abot:(update-event-domain:(abed:ca cid) eid dom))
::
++  update-event-metadata
  |=  [=cid =eid =mid fields=(list meta-field)]
  ^-  _this
  (emil-cal abot:(update-event-metadata:(abed:ca cid) eid mid fields))
::
++  delete-event-metadata
  |=  [=cid =eid =mid]
  ^-  _this
  (emil-cal abot:(delete-event-metadata:(abed:ca cid) eid mid))
::
++  delete-event
  |=  [=cid =eid]
  ^-  _this
  (emil-cal abot:(delete-event:(abed:ca cid) eid))
::
++  create-date
  |=  [=cid date=[m=@ud d=@ud] =meta]
  ^-  _this
  (emil-cal abot:(create-date:(abed:ca cid) date meta))
::
++  delete-date
  |=  [=cid =eid]
  ^-  _this
  (emil-cal abot:(delete-date:(abed:ca cid) eid))
::
++  handle-calendar-update
  |=  [=cid upd=calendar-update]
  ^-  _this
  =.  this  (emil-cal abot:(do-update:(abed:ca cid) upd))
  :: follow any rules shared by others
  ::
  (emil -:abet:(follow-rules:rul ~(tap in get-all-rules:(abed:ca cid))))
::
++  ca
  =|  [upds=(list calendar-update) old=calendar]
  |_  [=cid cal=calendar]
  +*  this  .
      mem   members:(get-pool cid)
  ++  abed
    |=  =^cid
    ^-  _this
    =/  cal=calendar
      (~(got by calendars) cid)
    this(cid cid, cal cal, old cal)
  ++  abet
    :_  [cid cal]
    %+  turn  (flop upds)
    |=  upd=calendar-update
    [%give %fact ~[(en-path cid)] calendar-update+!>(upd)]
  ++  emit  |=(upd=calendar-update this(upds [upd upds]))
  ++  emil  |=(upds=(list calendar-update) this(upds (weld upds ^upds)))
  ++  emil-event
    |=  [upds=(list calendar-update) =eid ven=event]
    (emil(events.cal (~(put by events.cal) eid ven)) upds)
  ++  emil-rdate
    |=  [upds=(list calendar-update) =eid ven=rdate]
    (emil(rdates.cal (~(put by rdates.cal) eid ven)) upds)
  ++  abot
    =.  upds  (flop upds)
    =/  new=calendar  cal:(do-updates:this(cal old) upds)
    :: ?:  =(cal new)
      abet
    :: ~|("non-equivalent-updates" !!)
  ::
  ++  init
    |=  [title=@t description=@t]
    ^-  _this
    =.  cal        *calendar :: initialize with bunt
    %=  this
      title.cal        title
      description.cal  description
    ==
  ::
  ++  spans-in-subdomain
    |=  [l=@da r=@da]
    ^-  range
    ?>  (lte l r)
    %-  ~(gas by *range)
    %+  turn
      ^-  (list iref)
      %-  zing  %+  turn
        (tap:son:so (lot:son:so span-order.cal `r `l))
      |=  [key=@da val=(set mome)]
      (turn ~(tap in val) tail)
    |=  =iref
    =/  ven=event  (~(got by events.cal) eid.iref)
    [iref (~(get-full-row vn eid.iref ven) i.iref)]
  ::
  ++  fulldays-in-subdomain
    |=  [l=@da r=@da]
    ^-  range
    ?>  (lte l r)
    %-  ~(gas by *range)
    %+  turn
      ^-  (list iref)
      %-  zing  %+  turn
        (tap:fon:fo (lot:fon:fo fullday-order.cal `r `l))
      |=([key=@da val=(set iref)] ~(tap in val))
    |=  =iref
    =/  ven=event  (~(got by events.cal) eid.iref)
    [iref (~(get-full-row vn eid.iref ven) i.iref)]
  ::
  ++  get-range
    |=  [l=@da r=@da]
    ^-  range
    ?>  (lte l r)
    %-  ~(uni by (spans-in-subdomain l r))
    (fulldays-in-subdomain l r)
  ::
  ++  get-all-rules
    ^-  (set rid)
    %-  ~(gas in *(set rid))  
    %-  zing
    %+  turn  ~(tap by events.cal)
    |=  [eid ven=event]
    %+  turn  ~(tap by rules.ven)
    |=([aid =rid kind args] rid)
  ::
  ++  create-event
    |=  [=eid =dom =aid =rid =kind =args =mid =meta]
    ^-  _this
    =|  ven=event
    =.  events.cal  (~(put by events.cal) eid ven)
    =.  this  (emit %event %c eid ven)
    (emil-event abet:(init:(abed:vn eid) dom aid rid kind args mid meta))
  ::
  ++  create-event-until
    |=  [=eid start=@ud until=@da =aid =rid =kind =args =mid =meta]
    ^-  _this
    =|  ven=event
    =.  events.cal  (~(put by events.cal) eid ven)
    =.  this  (emit %event %c eid ven)
    (emil-event abet:(init-until:(abed:vn eid) start until aid rid kind args mid meta))
  ::
  ++  update-event
    |=  [=eid fields=(list event-field)]
    ^-  _this
    (emil-event abet:(update:(abed:vn eid) fields))
  ::
  ++  update-event-domain
    |=  [=eid =dom]
    ^-  _this
    (emil-event abet:(update-domain:(abed:vn eid) dom))
  ::
  ++  update-event-instances
    |=  [=eid =dom fields=(list instance-field)]
    ^-  _this
    (emil-event abet:(update-instances:(abed:vn eid) dom fields))
  ::
  ++  delete-event  |=(=eid (do-update %event %d eid))
  ::
  ++  create-event-rule
    |=  [=eid =aid =rid =kind =args]
    ^-  _this
    (emil-event abet:(create-rule:(abed:vn eid) aid rid kind args))
  ::
  ++  update-event-rule
    |=  [=eid =aid =rid =kind =args]
    ^-  _this
    (emil-event abet:(update-rule:(abed:vn eid) aid rid kind args))
  ::
  ++  delete-event-rule
    |=  [=eid =aid]
    ^-  _this
    (emil-event abet:(delete-rule:(abed:vn eid) aid))
  ::
  ++  create-event-metadata
    |=  [=eid =mid =meta]
    ^-  _this
    (emil-event abet:(create-metadata:(abed:vn eid) mid meta))
  ::
  ++  update-event-metadata
    |=  [=eid =mid fields=(list meta-field)]
    ^-  _this
    (emil-event abet:(update-metadata:(abed:vn eid) mid fields))
  ::
  ++  delete-event-metadata
    |=  [=eid =mid]
    ^-  _this
    (emil-event abet:(delete-metadata:(abed:vn eid) mid))
  ::
  ++  create-date
    |=  [date=[m=@ud d=@ud] =meta]
    ^-  _this
    =/  =eid            (scot %uv (sham eny.bowl))
    =/  ven=rdate  [date meta]
    =.  rdates.cal       (~(put by rdates.cal) eid ven)
    (do-update %rdate %c eid ven)
  ::
  ++  delete-date   |=(=eid (do-update %rdate %d eid))
  :: span-order core
  ::
  ++  so
    |_  ord=((mop @da (set mome)) gth)
    ++  son  ((on @da (set mome)) gth)
    ++  get-time
      |=  =mome
      ^-  (unit time)
      =/  ven=event     (~(got by events.cal) eid.iref.mome)
      ?~  row=(~(get by instances.ven) i.iref.mome)  ~
      ?.  ?=(%span -.i.u.row)  ~
      ?+    -.p.i.u.row  ~
          %&
        ?-  -.mome
          %l  (some l.p.p.i.u.row)
          %r  (some r.p.p.i.u.row)
        ==
      ==
    ::
    ++  del-mome
      |=  =mome
      ^+  ord
      =/  time=(unit time)  (get-time mome)
      ?~  time  ord
      ~|  time+time
      =/  mom=(set ^mome)   (got:son ord u.time)
      =.  mom               (~(del in mom) mome)
      ?:  =(~ mom)
        +:(del:son ord u.time)
      (put:son ord u.time mom)
    ::
    ++  del
      |=  =iref
      ^+  ord
      =.  ord  (del-mome %l iref)
      (del-mome %r iref)
    ::
    ++  put-mome
      |=  [=mome =time]
      ^+  ord
      =/  mom=(set ^mome)
        ?^  umom=(get:son ord time)
          (~(put in u.umom) mome)
        (~(put in *(set ^mome)) mome)
      (put:son ord time mom)
    ::
    ++  put
      |=  [=iref [l=@da r=@da]]
      ^+  ord
      =.  ord  (put-mome l+iref l)
      (put-mome r+iref r)
    :: replace
    ::
    ++  rep-mome
      |=  [=mome =time]
      ^+  ord
      =.  ord  (del-mome mome)
      (put-mome mome time)
    ::
    ++  rep
      |=  [=iref [l=@da r=@da]]
      =.  ord  (rep-mome l+iref l)
      (rep-mome r+iref r)
    :: replace many
    ::
    ++  rap-mome
      |=  =(list [mome time])
      ^+  ord
      ?~  list  ord
      $(list t.list, ord (rep-mome i.list))
    ::
    ++  rap
      |=  =(list [iref [@da @da]])
      ^+  ord
      ?~  list  ord
      $(list t.list, ord (rep i.list))
    --
  :: fullday-order core
  ::
  ++  fo
    |_  ord=((mop @da (set iref)) gth)
    ++  fon  ((on @da (set iref)) gth)
    ++  get-time
      |=  =iref
      ^-  (unit time)
      =/  ven=event  (~(got by events.cal) eid.iref)
      ?~  row=(~(get by instances.ven) i.iref)  ~
      ?.  ?=(%fuld -.i.u.row)  ~
      ?-  -.p.i.u.row
        %|  ~
        %&  (some p.p.i.u.row)
      ==
    ::
    ++  del
      |=  =iref
      ^+  ord
      =/  time=(unit time)  (get-time iref)
      ?~  time  ord
      =/  ref=(set ^iref)   (got:fon ord u.time)
      =.  ref               (~(del in ref) mome)
      ?:  =(~ ref)
        +:(del:fon ord u.time)
      (put:fon ord u.time ref)
    ::
    ++  put
      |=  [=iref =fullday]
      ^+  ord
      =/  ref=(set ^iref)
        ?^  uref=(get:fon ord fullday)
          (~(put in u.uref) iref)
        (~(put in *(set ^iref)) iref)
      (put:fon ord fullday ref)
    :: replace
    ::
    ++  rep
      |=  [=iref =fullday]
      ^+  ord
      =.  ord  (del iref)
      (put iref fullday)
    :: replace many
    ::
    ++  rap
      |=  =(list [iref fullday])
      ^+  ord
      ?~  list  ord
      $(list t.list, ord (rep i.list))
    --
  ::
  ++  reorder
    |=  [=eid upd=event-update]
    ^-  calendar
    ?.  ?=(%instance -.upd)  cal :: ignore non-instance updates
    ?-    -.p.upd
        %|
      :: delete an instance
      ::
      %=  cal
        span-order     (~(del so span-order.cal) [eid p.p.upd])
        fullday-order  (~(del fo fullday-order.cal) [eid p.p.upd])
      ==
        %&
      ?-    -.i.row.p.p.upd
          %skip
        %=  cal
          span-order     (~(del so span-order.cal) [eid idx.p.p.upd])
          fullday-order  (~(del fo fullday-order.cal) [eid idx.p.p.upd])
        ==
        ::
          %fuld
        ?.  ?=(%& -.p.i.row.p.p.upd)  cal :: ignore exceptions
        :: replace this instance in span-order
        ::
        %=    cal
          span-order  (~(del so span-order.cal) [eid idx.p.p.upd])
            fullday-order
          %-  ~(rep fo fullday-order.cal)
          :-  [eid idx.p.p.upd]
          p.p.i.row.p.p.upd
        ==
        ::
          %span
        ?.  ?=(%& -.p.i.row.p.p.upd)  cal :: ignore exceptions
        :: replace this instance in span-order
        ::
        %=    cal
          fullday-order  (~(del fo fullday-order.cal) [eid idx.p.p.upd])
            span-order
          %-  ~(rep so span-order.cal)
          :-  [eid idx.p.p.upd]
          p.p.i.row.p.p.upd
        ==
      ==
    ==
  ::
  ++  vn
    =|  upds=(list event-update)
    |_  [=eid ven=event]
    +*  this  .
    ++  abet
      :_  [eid ven]
      %+  turn  (flop upds)
      |=  upd=event-update
      [%event %u eid upd]
    ++  abed
      |=  =^eid
      %=  this
        eid  eid
        ven  (~(got by events.cal) eid)
      ==
    ++  emit  |=(upd=event-update this(upds [upd upds]))
    ++  emil  |=(upds=(list event-update) this(upds (weld upds ^upds)))
    ::
    ++  init-base
      |=  [=dom =aid =rid =kind =args =mid =meta]
      ^-  _this
      ?>  (lte dom)
      =.  this           (do-update %dom dom)
      =.  this           (create-rule '0v0' [~ %skip ''] [%skip ~] ~)
      =.  this           (create-rule aid rid kind args)
      =.  this           (do-update %def-rule aid)
      =.  this           (create-metadata mid meta)
      (do-update %def-data mid)
    ::
    ++  init
      |=  [=dom =aid =rid =kind =args =mid =meta]
      ^-  _this
      ?>  (lte dom)
      =.  this           (init-base dom aid rid kind args mid meta)
      =.  instances.ven  (dummies dom aid mid)
      (instantiate (gulf dom))
    :: will always give you the first instance
    ::
    ++  init-until
      |=  [start=@ud until=@da =aid =rid =kind =args =mid =meta]
      ^-  _this
      =.  this  (init-base [start start] aid rid kind args mid meta)
      (extend-until until)
    ::
    ++  update
      |=  fields=(list event-field)
      ^-  _this
      =/  f-map=(map term @t)  (~(gas by *(map term @t)) fields)
      =/  def-rule=aid  (~(gut by f-map) %def-rule def-rule.ven)
      =/  def-data=mid  (~(gut by f-map) %def-data def-data.ven)
      ?>  (~(has by rules.ven) def-rule)
      ?>  (~(has by metadata.ven) def-data)
      (do-updates fields)
    ::
    ++  dummies
      |=  [=dom =aid =mid]
      ^-  (map @ud instance-row)
      =/  [rid =kind args]  (~(got by rules.ven) aid)
      %-  ~(gas by *(map @ud instance-row))
      (turn (gulf dom) |=(idx=@ud [idx aid mid ~ %skip ~]))
    :: if already existing
    ::
    ++  dummify
      |=  [=dom fields=(list instance-field)]
      ^-  _this
      ?>  (gte l.dom l.dom.ven)
      ?>  (lte r.dom r.dom.ven)
      =/  f-map=(map term @t)  (~(gas by *(map term @t)) fields)
      %=    this
          instances.ven
        %-  ~(uni by instances.ven)
        %-  ~(gas by *(map @ud instance-row))
        %+  turn  (gulf dom)
        |=  idx=@ud
        =/  row=instance-row  (~(got by instances.ven) idx)
        =/  =aid  (~(gut by f-map) %aid aid.row)
        =/  =mid  (~(gut by f-map) %mid mid.row)
        [idx aid mid rsvps.row %skip ~]
      ==
    ::
    ++  create-rule
      |=  [=aid =rid =kind =args]
      ^-  _this
      ?<  (~(has in ~(key by rules.ven)) aid)
      (do-update %rule %& aid rid kind args)
    ::
    ++  update-rule
      |=  [=aid =rid =kind =args]
      ^-  _this
      ?>  (~(has in ~(key by rules.ven)) aid)
      =.  this  (do-update %rule %& aid rid kind args)
      :: instantiate affected instances
      ::
      =/  idx=(list @ud)
        %+  murn  ~(tap by instances.ven)
        |=  [idx=@ud =^aid mid rsvps instance]
        ?.(=(aid ^aid) ~ (some idx))
      (instantiate idx)
    ::
    ++  delete-rule
      |=  =aid
      ^-  _this
      ?<  =(aid def-rule.ven)
      ?<  =(0 aid)
      ?.  .=  ~  :: can't delete rules in use
           %+  murn  ~(tap by instances.ven)
           |=  [idx=@ud =^aid mid rsvps instance]
           ?.(=(aid ^aid) ~ (some idx))
        ~|  %rule-in-use  !!
      (do-update %rule %| aid)
    ::
    ++  create-metadata
      |=  [=mid =meta]
      ^-  _this
      ?<  (~(has in ~(key by metadata.ven)) mid)
      (do-update %metadata %c mid meta)
    ::
    ++  update-metadata
      |=  [=mid fields=(list meta-field)]
      ^-  _this
      ?>  (~(has in ~(key by metadata.ven)) mid)
      %-  do-updates
      %+  turn  fields
      |=  fid=meta-field
      [%metadata %u mid fid]
    ::
    ++  delete-metadata
      |=  =mid
      ^-  _this
      ?<  =(mid def-data.ven)
      (do-update %metadata %d mid)
    ::
    ++  instantiate
      |=  idx=(list @ud)
      ^-  _this
      ?~  idx  this
      =/  [=aid =mid =rsvps instance]  (~(got by instances.ven) i.idx)
      =/  [rid =kind args]  (~(got by rules.ven) aid)
      :: IMPORTANT: cached computation
      ::
      =/  new=instance
        ?-    -.kind
          %skip           skip+~
          %fuld           fuld+(~+((get-to-fullday (~(got by rules.ven) aid))) i.idx)
          ?(%left %both)  span+(~+((get-to-span (~(got by rules.ven) aid))) i.idx)
        ==
      =.  this  (do-update %instance %& i.idx aid mid rsvps new)
      $(idx t.idx)
    :: extend using default rule until date
    ::
    ++  extend-until
      |=  until=@da
      ^-  _this
      =/  maxnum=@ud  (add l.dom.ven max-instances)
      =/  idx=@ud  +(r.dom.ven)
      |-
      ?:  (gte idx maxnum)
        (do-update %dom [l.dom.ven (dec idx)])
      =/  [=rid =kind =args]  (~(got by rules.ven) def-rule.ven)
      :: IMPORTANT: cached computation
      ::
      =/  new=instance  
        ?-    -.kind
          %skip           skip+~
          %fuld           fuld+(~+((get-to-fullday rid kind args)) idx)
          ?(%left %both)  span+(~+((get-to-span rid kind args)) idx)
        ==
      ?:  ?+  -.new  |
            %span  &(?=(%& -.p.new) (gth l.p.p.new until))
            %fuld  &(?=(%& -.p.new) (gth p.p.new until))
          ==
        (do-update %dom [l.dom.ven (dec idx)])
      =.  this
        (do-update %instance %& idx def-rule.ven def-data.ven ~ new)
      $(idx +(idx))
    ::    
    ++  update-domain
      |=  =dom
      ^-  _this
      ?>  (lte dom)
      =/  stan=(map @ud instance-row)  (dummies dom [def-rule def-data]:ven)
      =.  instances.ven   (~(uni by stan) (~(int by stan) instances.ven))
      (instantiate (gulf dom))
    ::
    ++  update-instances
      |=  [=dom fields=(list instance-field)]
      ^-  _this
      =.  this  (dummify dom fields)
      (instantiate (gulf dom))
    ::
    ++  update-instances-new
      |=  [=dom def=? =rid =kind =args =meta]
      ^-  _this
      =/  =aid  (scot %uv (sham eny.bowl))
      =/  =mid  (scot %uv (sham (add 1 eny.bowl)))
      =?  this  def  (do-update %def-rule aid)
      =?  this  def  (do-update %def-data mid)
      =.  this  (do-update %rule %& aid rid kind args)
      =.  this  (do-update %metadata %c mid meta)
      (update-instances dom ~[aid+aid mid+mid]) 
    ::
    ++  get-full-row
      |=  i=@ud
      ^-  real-instance
      =/  row=instance-row  (~(got by instances.ven) i)
      =/  [=rid =kind =args]  (~(got by rules.ven) aid.row)
      =/  =meta               (~(got by metadata.ven) mid.row)
      :-  rid  :-  kind  :-  args  :-  meta
      ?+  -.i.row  ~|(%skipped !!)
        %span  ?>(?=(%& -.p.i.row) span+p.p.i.row)
        %fuld  ?>(?=(%& -.p.i.row) fuld+p.p.i.row)
      ==
    ::
    ++  do-update
      |=  upd=event-update
      ^-  _this
      :: when doing updates, re-accumulates the updates in upds
      ::
      =-  (emit(ven -) upd)
      ?-    -.upd
        :: direct replace
        ::
        %dom       ven(dom dom.upd)
        %def-rule  ven(def-rule aid.upd)
        %def-data  ven(def-data mid.upd)
        :: put / del
        ::
          %rule
        ?-  -.p.upd
          %&  ven(rules (~(put by rules.ven) p.p.upd))
          %|  ven(rules (~(del by rules.ven) p.p.upd))
        ==
        ::
          %metadata
        ?-  -.p.upd
          %c  ven(metadata (~(put by metadata.ven) p.p.upd))
          %d  ven(metadata (~(del by metadata.ven) p.p.upd))
          ::
            %u
          =/  =meta  (~(got by metadata.ven) -.p.p.upd)
          =.  meta
            ?-  -.+.p.p.upd
              %name         meta(name name.+.p.p.upd)
              %description  meta(description description.+.p.p.upd)
              %color        meta(color color.+.p.p.upd)
            ==
          ven(metadata (~(put by metadata.ven) -.p.p.upd meta))
        ==
        ::
          %instance
        ?-  -.p.upd
          %&  ven(instances (~(put by instances.ven) p.p.upd))
          %|  ven(instances (~(del by instances.ven) p.p.upd))
        ==
      ==
    ::
    ++  do-updates
      |=  upds=(list event-update)
      ^-  _this
      |-  ?~  upds  this
      $(upds t.upds, this (do-update i.upds))
    --
  ::
  ++  do-update
    |=  *
    =/  upd  ;;(calendar-update +<) :: problems with +each
    |^  ^-  _this
    :: re-emit the update and modify the calendar
    :: when doing updates, re-accumulates the updates in upds
    ::
    =-  (emit(cal -) upd)
    ?-    -.upd
      %calendar       cal.upd
      :: direct replace
      ::
      %title          cal(title title.upd)
      %description    cal(description description.upd)
      %default-role   cal(default-role role.upd)
      :: put / del
      ::
        %role
      ?-    -.p.upd
          %&
        :: assert ship is in pool members
        ::
        ?>  (~(has in mem) -.p.p.upd)
        cal(roles (~(put by roles.cal) p.p.upd))
        ::
          %|
        :: assert ship is not in pool members
        ::
        ?<  (~(has in mem) p.p.upd)
        cal(roles (~(del by roles.cal) p.p.upd))
      ==
      :: updates
      ::
        %event
      ?-    -.p.upd
        %c  cal(events (~(put by events.cal) p.p.upd))
        %d  cal(events (~(del by events.cal) p.p.upd))
        ::
          %u
        =/  [=eid upd=event-update]  p.p.upd
        =.  cal  (reorder eid upd) :: do first; relies on old cal state
        cal(events (~(put by events.cal) eid ven:(do-update:(abed:vn eid) upd)))
      ==
      ::
        %rdate
      ?-  -.p.upd
        %c  cal(rdates (~(put by rdates.cal) p.p.upd))
        %d  cal(rdates (~(del by rdates.cal) p.p.upd))
        ::
          %u
        =/  ven=rdate  (~(got by rdates.cal) -.p.p.upd)
        =.  ven             (do-rdate-update ven +.p.p.upd)
        cal(rdates (~(put by rdates.cal) -.p.p.upd ven))
      ==
    ==
    ::
    ++  do-meta-update
      |=  [=meta upd=meta-field]
      ^+  meta
      ?-    -.upd
        %name         meta(name name.upd)
        %description  meta(description description.upd)
        %color        meta(color color.upd)
      ==
    ::
    ++  do-rdate-update
      |=  [ven=rdate upd=rdate-update]
      ^-  rdate
      ?-    -.upd
        %date  ven(date date.upd)
        %meta  ven(metadata (do-meta-update metadata.ven +.upd))
      ==
    --
  ::
  ++  do-updates
    |=  upds=(list calendar-update)
    ^-  _this
    |-  ?~  upds  this
    $(upds t.upds, this (do-update i.upds))
  --
::
++  sour  (scot %p our.bowl)
++  snow  (scot %da now.bowl)
::
++  get-pool
  |=  =cid
  ^-  pool:p
  =/  host=@ta  (scot %p host.cid)
  =/  =peek:p
    .^  peek:p  %gx
      /[sour]/pools/[snow]/pool/[host]/[name.cid]/pools-peek
    ==
  ?>(?=(%pool -.peek) pool.peek)
::
++  has-in-pool-members
  |=  [=cid =ship]
  ^-  ?
  =/  =pool:p  (get-pool cid)
  (~(has in members.pool) ship)
::
++  has-pool
  |=  =cid
  ^-  ?
  =/  host=@ta  (scot %p host.cid)
  .^(? %gx /[sour]/pools/[snow]/has-pool/[host]/[name.cid]/loob)
--
