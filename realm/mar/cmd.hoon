:: :: /-  act
:: |_  cmd=cmd:act
:: ++  grab
::   |%
::   :: ++  noun  cmd
::   ++  noun  `noun`json
::   :: ++  from-js
::   ::   |=  =json
::   ::   =,  dejs:format
::   ::   ^-  $-(json (unit noun))
::   ::   =/  jon  ?:(?=([%o *] json) p.json ~)
::   ::   =/  rc  (~(get by jon) 'resource')
::   ::   ?~  rc  ~
::   ::   =/  rc  (so (need rc))
::   ::   =/  action  (~(get by jon) 'action')
::   ::   ?~  action ~
::   ::   =/  action  (so (need action))
::   ::   `noun`[resource=rc action=action]
::   --
:: ++  grow
::   |%
::   ++  noun  cmd
::   --
:: ++  grad  %noun
:: --
/-  act
|_  =cmd:act
++  grab
  |%
  ++  noun  cmd:act
  --
++  grow
  |%
  ++  noun  cmd
  --
++  grad  %noun
--
