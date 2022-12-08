/-  *featured
|%
++  enjs
  =,  enjs:format
  |%
  ++  reaction
    |=  rct=^reaction
    ^-  json
    %-  pairs
    :_  ~
    ^-  [cord json]
    :-  -.rct
    ?-  -.rct
        %initial
      %-  pairs
      :~  [%spaces (spaces-map:encode spaces.rct)]
      ==
        %add-space
      %-  pairs
      :~  [%meta-space (spc:encode +.rct)]
      ==
        %remove-space
      %-  pairs
      :~  [%path s+(pat:encode path.rct)]
      ==
    ==
  --
++  encode
  =,  enjs:format
  |%
  ++  pat
    |=  path=space-path
    ^-  cord
    (spat /(scot %p -.path)/(scot %tas +.path))
  ++  spc
    |=  space=meta-space
    ^-  json
    %-  pairs
    :~  ['path' s+(pat path.space)]
        ['name' s+name.space]
        ['description' s+description.space]
        ['picture' s+picture.space]
        ['color' s+color.space]
    ==
:: +$  spaces  (map space-path meta-space)
  ++  spaces-map
    |=  =spaces
    ^-  json
    %-  pairs
    %+  turn  ~(tap by spaces)
    |=  [pth=space-path space=meta-space]
    ^-  [cord json]
    [(pat pth) (spc space)]
  --
--
