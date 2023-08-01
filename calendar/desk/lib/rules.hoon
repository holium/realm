/-  *rules
=>  |%
    +$  card  card:agent:gall
    +$  sign  sign:agent:gall
    --
=|  cards=(list card)
|_  [=bowl:gall rules=(map rid rule)]
+*  this   .
++  abet  [(flop cards) rules]
++  emit  |=(=card this(cards [card cards]))
++  emil  |=(cadz=(list card) this(cards (weld cadz cards)))
::
++  en-path
  |=  =rid
  ^-  path
  =|  host=@ta  
  =?  host  ?=(^ p.rid)  (scot %p u.p.rid)
  /rule/[host]/[q.rid]/[r.rid]
::
++  follow-rule
  |=  =rid
  ^-  _this
  ?~  p.rid  this
  =/  =wire  (en-path rid)
  =/  =dock  [u.p.rid dap.bowl]
  ?:  (~(has by wex.bowl) wire dock)  this
  (emit %pass wire %agent dock %watch wire)
::
++  follow-rules
  |=  rules=(list rid)
  ^-  _this
  ?~  rules  this
  $(rules t.rules, this (follow-rule i.rules))
::
++  handle-rule-action
  |=  axn=rule-action
  ^-  _this
  ?>  =(src our):bowl
  ?>  ?=(^ p.p.axn) :: can't edit hardcoded rules
  ?>  =(our.bowl u.p.p.axn)
  ?-    -.q.axn
      %create
    this(rules (~(put by rules) [p rule.q]:axn))
    ::
      %update
    =/  =rule  (~(got by rules) p.axn)
    =.  rule   (do-updates rule fields.q.axn)
    =.  rules  (~(put by rules) p.axn rule)
    :: emit fields as updates
    ::
    %-  emil
    %+  turn  fields.q.axn
    =/  =path  (en-path p.axn)
    |=  upd=rule-field
    ^-  card
    [%give %fact ~[path] rule-update+!>(upd)]
    ::
      %delete
    =.  rules  (~(del by rules) p.axn)
    (emit %give %kick ~[(en-path p.axn)] ~)
  ==
::
++  handle-rule-update
  |=  [=rid upd=rule-update]
  ^-  _this
  =/  =rule  (~(got by rules) rid)
  =.  rule   (do-update upd rule)
  this(rules (~(put by rules) rid rule))
::
++  do-update
  |=  [upd=rule-update =rule]
  ^+  rule
  ?-  -.upd
    %rule  rule.upd
    %name  rule(name name.upd)
    %parm  rule(parm parm.upd)
    %hoon  rule(hoon hoon.upd)
  ==
::
++  do-updates
  |=  [=rule upds=(list rule-update)]
  ^+  rule
  |-  ?~  upds  rule
  %=  $
    upds  t.upds
    rule  (do-update i.upds rule)
  ==
--
