/+  *calendar-json
|_  pyk=boxes-peek:b
++  grow
  |%
  ++  noun  pyk
  ++  json
    =,  enjs:format
    %.  pyk
    |=  pyk=boxes-peek:b
    ^-  ^json
    ?-  -.pyk
      %boxes  (boxes:enjs boxes.pyk)
    ==
  --
++  grab
  |%
  ++  noun  boxes-peek:b
  --
++  grad  %noun
--

