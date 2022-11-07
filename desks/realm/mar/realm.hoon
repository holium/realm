/+  *realm
|_  =config:store:realm
++  grow
  |%
  ++  mime  
    ^-  ^mime
    [/text/x-config (as-octt:mimes:html (spit-config:mime:realm config:store:realm))]
  ++  noun  config:store:realm
  ++  json  (config:enjs:realm docket)
  --
++  grab
  |%
  ::
  ++  mime
    |=  [=mite len=@ud tex=@]
    ^-  config:store:realm
    %-  need
    %-  from-clauses:mime:realm
    !<((list clause:realm) (slap !>(~) (ream tex)))

  ::
  ++  noun  config:store:realm
  --
++  grad  %noun
--

