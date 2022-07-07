/+  *people-store
::
|_  act=action
++  grad  %noun
++  grow
  |%
  ++  noun  act
  ++  people-update-0  act
  ++  json  (action:enjs act)
  ++  text  (action:entxt act)
  --
::
++  grab
  |%
  ++  noun  action
  ++  json  action:dejs
  ++  text  (action:dejs (dejs:format (action:entxt act)))
  --
--
