/-  sur=push-notify
=<  [sur .]
=,  sur
|%
::
++  dejs
  =,  dejs:format
  |%
  ++  action
    |=  jon=json
    ^-  action:sur
    =<  (decode jon)
    |%
    ++  decode
      %-  of
      :~  [%enable-push auth-key]
          [%disable-push auth-key]
      ==
    ::
    ++  auth-key
      %-  ot
      [%user-auth-key so]~
    ::
    --
  --
--