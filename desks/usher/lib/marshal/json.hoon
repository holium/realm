/-  *marshal
|%
::
++  dejs  =,  dejs:format
  |%
  ++  marshal-action
    |=  jon=json
    ^-  ^marshal-action
    =<  (decode jon)
    |%
    ++  decode
      %-  of  [%commit commit]~
    ::
    ++  commit
      %-  ot  [%mount-point so]~
    --
  --
--