/-  *accept-group-dm
|%
::
++  dejs
  =,  dejs:format
  |%
  ++  action
    |^
    %-  of
    :~  accept+id
        decline+id
    ==
    ::
    ++  id  (se %uv)
    --
  --
::
++  enjs
  =,  enjs:format
  |%
  ::
  ++  action
    |=  act=^action
    %+  frond  -.act
    ?-  -.act
      %accept  [%s (scot %uv +.act)]
      %decline  [%s (scot %uv +.act)]
    ==
  --
--
