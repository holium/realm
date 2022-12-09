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
      :~  id/s/(scot %uv id.rct)
      ==
      ::
        %new-note
      %-  pairs
      :~  id/s/(scot %uv id.note.rct)
          con/a/(turn content.note.rct content-js:encode)
          time/(time tim.note.rct)
      ==
    ==
  ::
  ++  view  :: encodes for on-peek
    |=  vi=view:store
    ^-  json
    %-  pairs
    :_  ~
    ^-  [cord json]
    :-  -.vi
    ?-  -.vi
      ::
        %all
      (yarns-js:encode yarns.vi)
      ::
        %seen
      (yarns-js:encode yarns.vi)
      ::
        %unseen
      (yarns-js:encode yarns.vi)
      ::
    ==
  --
::
++  encode
  =,  enjs:format
  |%
  ::
  ++  yarns-js
    |=  ys=(map id:h yarn:h)
    ^-  json
    %-  pairs
    %+  turn  ~(tap by ys)
    |=  [i=id:h y=yarn:h]
    [(scot %uv i) (yarn-js y)]
  ::
  ++  yarn-js
    |=  y=yarn:h
    ^-  json
    %-  pairs
    :~  id/s/(scot %uv id.y)
        time/(time tim.y)
        con/a/(turn con.y content-js)
    ==
  ::
  ++  content-js
    |=  c=content:h
    ^-  json
    ?@  c  s/c
    ?-  -.c
      %ship  (frond ship/s/(scot %p p.c))
      %emph  (frond emph/s/p.c)
    ==
  --
--
