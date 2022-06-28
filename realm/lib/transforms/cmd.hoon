/-  *act
|%
++  to-js
  |=  =cmd
  ^-  json
  %-  pairs:enjs:format
  :~
    ['action' s+action.cmd]
    ['context' context.cmd]
    ['resource' s+resource.cmd]
    ['data' data.cmd]
  ==
++  from-js
  =,  dejs:format
  ^-  $-(json (unit cmd)
  =/  jon  ?:(?=([%o *] json) p.json ~)
  =/  action  (~(get by jon) 'action')
  ?~  action  ~
  =/  action  (so (need action))
  =/  resource  (~(get by jon) 'resource')
  ?~  resource  ~
  =/  resource  (so (need resource))
  =/  context  (~(get by jon) 'context')
  ?~  context  ~
  =/  context  (need context)
  =/  data  (~(get by jon) 'data')
  ?~  data  ~
  =/  data  (need data)
  ~
--