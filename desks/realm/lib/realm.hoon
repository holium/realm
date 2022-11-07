/-  store=bazaar-store
|%
::
++  mime
  |%
  +$  draft
    $:  size=(unit [@ud @ud])
        titlebar-border=(unit ?)
        show-titlebar=(unit ?)
    ==
  ::
  ++  finalize
    |=  =draft
    ^-  (unit config:store)
    ?~  size.draft  ~
    ?~  titlebar-border.draft  ~
    ?~  show-titlebar.draft  ~
    =,  draft
    :-  ~
    :*  u.size
        u.titlebar-border
        u.show-titlebar
    ==
  ::
  ++  from-clauses
    =|  =draft
    |=  cls=(list clause)
    ^-  (unit config:store)
    =*  loop  $
    ?~  cls  (finalize draft)
    =*  clause  i.cls
    =.  draft
      ?-  -.clause
        %size  draft(size `size.clause)
        %titlebar-border   draft(titlebar-border `titlebar-border.clause)
        %show-titlebar  draft(show-titlebar `show-titlebar.clause)
      ==
    loop(cls t.cls)
  ::
  ++  to-clauses
    |=  c=config:store
    ^-  (list clause)
    %-  zing
    :~  size+size.d
        titlebar-border+titlebar-border.d
        show-titlebar+show-titlebar.d
    ==
  ::
  ++  spit-clause
    |=  =clause
    ^-  tape
    %+  weld  "  {(trip -.clause)}+"
    ?+  -.clause  "'{(trip +.clause)}'"
      %size  "[{(scow %ud -.size.clause)} {(scow %ud +.size.clause)}]"
      %titlebar-border  ?:  titlebar-border.clause  "%.y"  "%.n"
      %show-titlebar  ?:  show-titlebar.clause  "%.y"  "%.n"
    ==
  ::
  ++  spit-config
    |=  =config:store
    ^-  tape
    ;:  welp
      ":~\0a"
      `tape`(zing (join "\0a" (turn (to-clauses config) spit-clause)))
      "\0a=="
    ==
  --
::
++  enjs
  =,  enjs:format
  |%
  ::
  ++  config
    |=  c=^config
    ^-  json
    %-  pairs
    :~  size+o+[width+(numb -.size.d) height+(numb +.size.d)]
        titlebar-border+b+titlebar-border.d
        show-titlebar+b+show-titlebar.d
    ==
  ::
  --
--

