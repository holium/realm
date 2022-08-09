/-  sur=rooms
=<  [sur .]
=,  sur
|%
++  server             %rooms
++  client             %room
++  max-occupancy      6
++  max-rooms          256
::
++  leave-rooms
  :: remove ship from all rooms
  ::
  :: this enforces cleanliness
  |=  [rooms=(map rid room) =ship]
  ^-  (map rid room)
  =/  looms  ~(val by rooms)
  :: create list of rooms to use |-
  :: -
  :: remove ship from every room
  =.  looms
    |-
    ?~  looms  ~
    =*  loom  i.looms
    =?  present.loom
        %-
        ~(has in present.loom)
        ship
      ::
      (~(del in present.loom) ship)
      ::
    [loom $(looms t.looms)]
  ::
  :: turn the list back into a map
  %-  ~(gas by rooms)
  |-
  ?~  looms  ~
  :-  [rid.i.looms i.looms]
  $(looms t.looms)
::
::
:: welcome to the fun part
++  enjs
  =,  enjs:format
  |%
  ++  action
    |=  act=^action
    ^-  json
    :: not used
    *json
  ++  update
    |=  upd=^update
    ^-  json
    %+  frond  %rooms-update
    %-  pairs
    :_  ~
    ^-  [cord json]
    :-  -.upd
    ?-  -.upd
    %room
      (room:encode room.upd)
    %rooms
      :-  %a
      %+  turn
        ~(tap in rooms.upd)
        |=  =room
        (room:encode room)
    %invited
      %-  pairs
      :~
      ['provider' %s (scot %p provider.upd)]
      ['id' %s rid.upd]
      ['invitedBy' %s (scot %p ship.upd)]
      ==
    %kicked
      %-  pairs
      :~
      ['provider' %s (scot %p provider.upd)]
      ['id' %s rid.upd]
      ['kickedBy' %s (scot %p ship.upd)]
      ==
    %chat
      %-  pairs
      :~
      ['from' %s (scot %p from.upd)]
      ['content' %s content.upd]
      ==
    ==
  ++  view
    |=  viw=^view
    ~&  >  %libroomsviw
    ^-  json
    %+  frond  %rooms-view
    %-  pairs
    :_  ~
    :-  -.viw
    ?-  -.viw
    %full
      ~&  >>>  %full
      %-  pairs
      :~
      :-  %my-room
        ?~  my-room.viw  ~
        (room:encode u.my-room.viw)
      :-  %provider
        ?~  provider.viw  ~
        [%s (scot %p u.provider.viw)]
      ==
    %present
      ~&  >>>  %present
      (set-ship:encode ships.viw)
    ==
  --
++  encode
  =,  enjs:format
  |%
  ++  room
    |=  =^room
    ^-  json
    ~&  >>>  %encoderoom
    %-  pairs
    :~
    ['id' %s rid.room]
    ['provider' %s (scot %p provider.room)]
    ['creator' %s (scot %p creator.room)]
    ['access' %s access.room]
    ['title' %s title.room]
    ['capacity' (numb capacity.room)]
    :-  'space'
      :-  %s
      ?~  space.room
        ''
      u.space.room
    ['present' (set-ship present.room)]
    ['whitelist' (set-ship whitelist.room)]
    ==
  ++  set-ship
    |=  ships=(set @p)
    ^-  json
    :-  %a
    %+  turn
      ~(tap in ships)
      |=  her=@p
      [%s (scot %p her)]
  --
::
++  dejs
  =,  dejs:format
  |%
  ++  update
    |=  jon=json
    ^-  ^update
    *^update
    :: not used
  ++  action
    |=  jon=json
    ^-  ^action
    =<  (decode jon)
    |%
    ++  decode
      %-  of
      :~  [%set-provider patp]
          [%logout ul]
          [%enter so]
          [%exit ul]
          [%create create]
          [%set-title set-title]
          [%set-access set-access]
          [%set-capacity set-capacity]
          [%set-space set-space]
          [%invite invite]
          [%kick kick]
          [%delete so]
          [%request so]
          [%request-all ul]
          [%chat so]
      ==
    ++  patp
      (su ;~(pfix sig fed:ag))
    :: ::
    ++  create
      ~&  >  [%create jon]
      %-  ot
      :~  [%rid so]
          [%access access]
          [%title so]
          [%enter bo]
      ==
    ++  set-title
      %-  ot
      :~  [%rid so]
          [%title so]
      ==
    ++  set-access
      %-  ot
      :~  [%rid so]
          [%access access]
      ==
    ++  set-capacity
      %-  ot
      :~  [%rid so]
          [%capacity ni]
      ==
    ++  set-space
      %-  ot
      :~  [%rid so]
          [%space so]
      ==
    ++  invite
      %-  ot
      :~  [%rid so]
          [%ship patp]
      ==
    ++  kick
      %-  ot
      :~  [%rid so]
          [%space patp]
      ==
    ++  access
      |=  =json
      ^-  ^access
      ?>  ?=(%s -.json)
      ?:  =('private' p.json)
        %private
      ?:  =('public' p.json)
        %public
      !!
    --
  --
--