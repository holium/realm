/-  store=realm-beacon, h=hark
=<  [store .]
=,  store
|%
::
++  dejs
  =,  dejs:format
  |%
  ++  action
    |=  jon=json
    ^-  ^action
    =<  (decode jon)
    |%
    ++  decode
      %-  of
      :~
          [%seen seen]
      ==
    ::
    ++  seen
      %-  ot
      :~  [%id ni]
      ==
    --
  --
::
::  json
::
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
        %seen
      %-  pairs
      :~  id/s/(scot %uv i)
      ==
      ::
        %new-note
      %-  pairs
      :~  id/s/(scot %uv id.note.rct)
          con/a/(turn content.note.rct content)
          time/(time tim.note.rct)
      ==
    ==
  ::
  ++  content
    |=  c=content:h
    ^-  json
    ?@  c  s/c
    ?-  -.c
      %ship  (frond ship/s/(scot %p p.c))
      %emph  (frond emph/s/p.c)
    ==
  ::
  :: ++  view  :: encodes for on-peek
  ::   |=  vi=view:store
  ::   ^-  json
  ::   %-  pairs
  ::   :_  ~
  ::   ^-  [cord json]
  ::   :-  -.vi
  ::   ?-  -.vi
  ::     ::
  ::       %latest
  ::     (latest-js:encode latest.vi)
  ::     ::
  ::   ==
  --
::
:: ++  encode
::   =,  enjs:format
::   |%
::   ::
::   ++  latest-js
::     |=  =notifications:store
::     ^-  json
::     ~
::   --
--
