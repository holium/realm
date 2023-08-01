/-  *calendar-spaces
/+  j=calendar-json
|%
++  enjs
  =,  enjs:format
  |%
  ++  enta-space  |=(s=space `@t`(rap 3 (scot %p -.s) '/' +.s ~))
  ++  enjs-ship   |=(p=@p `json`((lead %s) (scot %p p)))
  ++  perms
    |=  =^perms
    ^-  json
    %-  pairs
    :~  admins+s/admins.perms
        member+?~(m=member.perms ~ s/u.m)
        :-  %custom
        %-  pairs
        %+  turn  ~(tap by custom.perms)
        |=  [=@p =role]
        ^-  [@t json]
        [(scot %p p) s/role]
    ==
  ++  calendars
    |=  =^calendars
    ^-  json
    =-  o/(malt -)
    ^-  (list [@t json])
    %+  turn  ~(tap by calendars)
    |=  [=cid creator=@p p=^perms]
    :-  (pool-id:enjs:j cid)
    %-  pairs
    :~  [%creator s+(scot %p creator)]
        [%perms (perms p)]
    ==
  ++  almanac
    |=  almanac=(map space [banned ^calendars])
    ^-  json
    %-  pairs
    %+  turn  ~(tap by almanac)
    |=  [=space =banned c=^calendars]
    ^-  [@t json]
    :-  (enta-space space)
    %-  pairs
    :~  banned+a/(turn ~(tap in banned) enjs-ship)
        calendars+(calendars c)
    ==
  ++  our
    |=  our=(set cid)
    ^-  json
    :-  %a
    %+  turn  ~(tap in our)
    |=(=cid s+(pool-id:enjs:j cid))
  ++  our-peek
    |=  our=(map cid [@t @t])
    ^-  json
    %-  pairs
    %+  turn  ~(tap by our)
    |=  [=cid =@t d=@t]
    ^-  [@t json]
    :-  (pool-id:enjs:j cid)
    (pairs ~[title+s/t description+s/d])
  ++  spaces-peek
    |=  pyk=^spaces-peek
    |^  ^-  json
    %+  frond  -.pyk
    ?-    -.pyk
        %almanac    (almanac almanac.pyk)
        %our        (our-peek our.pyk)
        %calendars  (calendars calendars.pyk)
        %spaces     a+(turn ~(tap in spaces.pyk) (cork enta-space (lead %s)))
    ==
    ::
    ++  calendars
      |=  =calendars:^spaces-peek
      ^-  json
      %-  pairs
      %+  turn  ~(tap by calendars)
      |=  [=cid cal=calendar:^spaces-peek]
      ^-  [@t json]
      [(pool-id:enjs:j cid) (calendar cal)]
    ::
    ++  calendar
      |=  cal=calendar:^spaces-peek
      ^-  json
      %-  pairs
      :~  [%title s+title.cal]
          [%description s+description.cal]
          [%creator s+(scot %p creator.cal)]
          [%perms (perms perms.cal)]
      ==
    --
  ::
  ++  update
    |=  upd=^update
    ^-  json
    %+  frond  -.upd
    ?-    -.upd
        %initial  
      %-  pairs
      :~  [%our (our our.upd)]
          [%almanac (almanac almanac.upd)]
      ==
        %add-space  
      %-  pairs
      :~  [%space s+(enta-space space.upd)]
          [%banned a+(turn ~(tap in banned.upd) enjs-ship)]
          [%calendars (calendars calendars.upd)]
      ==
      %del-space  (frond %space s+(enta-space space.upd))
        %banned
      %-  pairs
      :~  [%space s+(enta-space space.upd)]
          [%banned a+(turn ~(tap in banned.upd) enjs-ship)]
      ==
        %add-calendar
      %-  pairs
      :~  [%space s+(enta-space space.upd)]
          [%cid s+(pool-id:enjs:j cid.upd)]
          [%creator s+(scot %p creator.upd)]
          [%perms (perms perms.upd)]
      ==
        %del-calendar
      %-  pairs
      :~  [%space s+(enta-space space.upd)]
          [%cid s+(pool-id:enjs:j cid.upd)]
      ==
        %perms
      %-  pairs
      :~  [%space s+(enta-space space.upd)]
          [%cid s+(pool-id:enjs:j cid.upd)]
          [%perms (perms perms.upd)]
      ==
      %add-our  (frond %cid s+(pool-id:enjs:j cid.upd))
      %del-our  (frond %cid s+(pool-id:enjs:j cid.upd))
    ==
  --
::
++  dejs
  =,  dejs:format
  |%
  ++  space-rule
    ;~  (glue fas)
      ;~(pfix sig fed:ag)
      (cook crip (star prn))
    ==
  ++  custom-perms
    |=  jon=json
    ^-  (map ship role)
    %-  ~(gas by *(map ship role))
    %+  turn
      %~  tap  by
      ((om (su role:dejs:j)) jon)
    |=  [s=@t r=@t]
    ^-  [ship role]
    ?>  ?=(role r)
    [(slav %p s) r]
  ++  perms
    ^-  $-(json ^perms)
    %-  ot
    :~  admins+(su role:dejs:j)
        member+|=(jon=json ?~(jon ~ `((su role:dejs:j) jon)))
        custom+custom-perms
    ==
  ++  async-create
    ^-  $-(json ^async-create)
    %-  of
    :~  [%space (ot ~[title+so description+so space+(su space-rule) perms+perms])]
        [%our (ot ~[title+so description+so])]
    ==
  ++  crud-action
    ^-  $-(json ^crud-action)
    %-  ot
    :~
      [%space (su space-rule)]
      :-  %axn
      %-  of
      :~  [%banned (as (su fed:ag))]
          [%create (ot ~[cid+(su pool-id:dejs:j) perms+perms])]
          [%delete (su pool-id:dejs:j)]
          [%reperm (ot ~[cid+(su pool-id:dejs:j) perms+perms])]
      ==
    ==
  ++  our-action
    ^-  $-(json ^our-action)
    %-  ot
    :~
      [%p (su pool-id:dejs:j)]
      :-  %q
      %-  su
      %+  cook  ?(%delete %accept %leave)
      ;~  pose
        (jest 'delete')
        (jest 'accept')
        (jest 'leave')
      ==
    ==
  --
--
