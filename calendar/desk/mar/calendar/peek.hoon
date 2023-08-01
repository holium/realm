/+  *calendar-json
|_  pyk=peek
++  grow
  |%
  ++  noun  pyk
  ++  json
    =,  enjs:format
    %.  pyk
    |=  pyk=peek
    ^-  ^json
    ?-  -.pyk
      %rule       !!
      %rules      (frond %rules (rules:enjs rules.pyk))
      %calendars  (frond %calendars (calendars:enjs calendars.pyk))
      %calendar   (frond %calendar (calendar:enjs calendar.pyk))
      %range      (frond %range (range:enjs range.pyk))
      %role       !!
    ==
  --
++  grab
  |%
  ++  noun  peek
  --
++  grad  %noun
--
