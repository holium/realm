/+  *calendar-json
|_  vnt=cals-vent
++  grow
  |%
  ++  noun  vnt
  ++  json
    =,  enjs:format
    %.  vnt
    |=  vnt=cals-vent
    ^-  ^json
    ?~  vnt  ~
    ?-    -.vnt
      %eid  (frond %eid s+eid.vnt)
      %aid  (frond %aid s+aid.vnt)
      %mid  (frond %mid s+mid.vnt)
        %cid
      %+  frond  %cid
      s+(pool-id:enjs cid.vnt)
    ==
  --
++  grab
  |%
  ++  noun  cals-vent
  --
++  grad  %noun
--
