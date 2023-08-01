/-  *boxes
/+  c=calendar
:: Import to force compilation during development.
:: 
/=  ia-  /mar/boxes/invite-action
/=  jo-  /mar/boxes/join-action
/=  ig-  /mar/boxes/invite-gesture
=>  |%
    +$  card  card:agent:gall
    +$  sign  sign:agent:gall
    +$  state-0
      $:  %0
          rules=(map rid rule)
          calendars=(map cid calendar)
          boxes
      ==
    +$  cache
      $:  to-to-boths=(map rid to-to-both)
          to-to-lefts=(map rid to-to-left)
          to-to-fulldays=(map rid to-to-fullday)
      ==
    +$  inflated-state  [state-0 =cache]
    --
=|  cards=(list card)
|_  [=bowl:gall inflated-state]
+*  this   .
    state  +<+<
    cal    ~(. c [bowl state cache])
++  abet  [(flop cards) state]
++  emit  |=(=card this(cards [card cards]))
++  emil  |=(cadz=(list card) this(cards (weld cadz cards)))
::
++  handle-invite-gesture
  |=  [=cid =invite]
  ^-  _this
  ?>  =(host.cid src.bowl)
  this(incoming-invites (~(put by incoming-invites) cid invite))
::
++  handle-process
  |=  pro=process
  ^-  _this
  ?>  =(src our):bowl
  ?-    -.q.pro
      %invite
    this(outgoing-invites (~(put by outgoing-invites) [[p ship.q] invite.q]:pro))
    ::
      %watch
    (emil -:abet:(follow-calendar:cal p.pro))
    ::
      %leave
    (emil -:abet:(leave-calendar:cal p.pro))
    ::
      %kick
    =/  =path  (en-path:cal p.pro)
    (emit %give %kick ~[path] `ship.q.pro)
  ==
::
++  handle-pool-updates
  |=  [=cid upd=pool-update:p]
  ^-  _this
  ?+    -.upd  this
      %member
    :: if member is kicked, kick here, too, and remove from roles
    ::
    ?.  ?=([%| ship] p.upd)  this
    =^  cards  state
      abet:(update-calendar:cal cid [%role %| p.p.upd]~)
    (emil [[%give %kick ~[(en-path:cal cid)] `p.p.upd] cards])
    ::
      %invited
    :: if outgoing invite is deleted, delete here, too
    ::
    ?.  ?=([%| ship] p.upd)  this
    this(outgoing-invites (~(del by outgoing-invites) [cid p.p.upd]))
  ==
::
++  handle-home-updates
  |=  upd=home-update:p
  ^-  _this
  ?.  ?=(%invite -.upd)  this
  :: if incoming invite is deleted, delete here, too
  ::
  ?.  ?=([%| =id:p] +.upd)  this
  this(incoming-invites (~(del by incoming-invites) id:p))
--
