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
      :~  [%id id]
      ==
    ::
    ++  slan  |=(mod=@tas |=(txt=@ta (need (slaw mod txt))))
    ::
    ++  id
      ^-  $-(json @uvH)
      (cu (slan %uv) so)
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
      (notes-js:encode notes.vi)
      ::
        %seen
      (notes-js:encode notes.vi)
      ::
        %unseen
      (notes-js:encode notes.vi)
      ::
    ==
  --
::
++  encode
  =,  enjs:format
  |%
  ::
  ++  notes-js
    |=  ns=(map id:h note:store)
    ^-  json
    %-  pairs
    %+  turn  ~(tap by ns)
    |=  [i=id:h n=note:store]
    [(scot %uv i) (note-js n)]
  ::
  ++  note-js
    |=  n=note:store
    ^-  json
    %-  pairs
    :~  id/s/(scot %uv id.n)
        time/(time tim.n)
        content/a/(turn content.n content-js)
        seen/b/seen.n
    ==
  ::
  ++  content-js
    |=  c=content:h
    ^-  json
    ?@  c  (frond text/s/c)
    ?-  -.c
      %ship  (frond ship/s/(scot %p p.c))
      %emph  (frond emph/s/p.c)
    ==
  --
--
