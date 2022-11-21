/-  sur=rooms-v2
=<  [sur .]
=,  sur
|%
++  max-occupancy      6
++  max-rooms          256
::
::
++  enjs
  =,  enjs:format
  |%
  ++  reaction
    |=  rct=reaction:sur
    ^-  json
    %-  pairs
    :_  ~
    ^-  [cord json]
    :-  -.rct
    ?-  -.rct
        %room-entered 
      %-  pairs
      :~
        ['rid' %s rid.rct]
        ['ship' %s (scot %p ship.rct)]
      ==
        %room-left 
      %-  pairs
      :~
        ['rid' %s rid.rct]
        ['ship' %s (scot %p ship.rct)]
      ==
      ::
        %room-created
      %-  pairs
      ['room' (room:encode room.rct)]~
      ::
        %room-updated
      %-  pairs
      ['rooms' (room:encode room.rct)]~
      ::
        %room-deleted
      %-  pairs
      ['rid' %s rid.rct]~
      ::
        %provider
      %-  pairs
      :~
        ['provider' %s (scot %p provider.rct)]
        ['rooms' (rooms:encode rooms.rct)]
      ==
      ::
        %invited
      %-  pairs
      :~
        ['provider' %s (scot %p provider.rct)]
        ['rid' %s rid.rct]
        ['title' %s title.rct]
        ['invitedBy' %s (scot %p ship.rct)]
      ==
      ::
        %kicked
      %-  pairs
      :~
        ['provider' %s (scot %p provider.rct)]
        ['rid' %s rid.rct]
        ['title' %s title.rct]
        ['kickedBy' %s (scot %p ship.rct)]
      ==
      ::
        %new-chat 
      %-  pairs
      :~
        ['from' %s (scot %p from.rct)]
        ['content' %s content.rct]
      ==
    ==
  ++  view
    |=  vi=view:sur
    ^-  json
    %-  pairs
    :_  ~
    ^-  [cord json]
    :-  -.vi
    ?-  -.vi
        %session
      (session:encode session.vi)
      ::
        %room
      (room:encode room.vi)
      ::
        %provider
      s+(scot %p ship.vi)
    ==
  --
::
++  encode
  =,  enjs:format
  |%
  ++  session
    |=  =session:sur
    ^-  json
    %-  pairs
    :~
      ['provider' s+(scot %p provider.session)]
      ['current' (current current.session)]
      ['rooms' (rooms rooms.session)]
    ==
  ::
  ++  rooms
    |=  =rooms:sur
    ^-  json
    %-  pairs
    %+  turn  ~(tap by rooms)
      |=  [=rid:sur =room:sur]
      ^-  [cord json]
      [rid (room:encode room)]
  ::
  ++  room
    |=  =room:sur
    ^-  json
    %-  pairs
    :~
      ['rid' s+rid.room]
      ['provider' s+(scot %p provider.room)]
      ['creator' s+(scot %p creator.room)]
      ['access' s+access.room]
      ['title' s+title.room]
      ['present' (set-ship present.room)]
      ['whitelist' (set-ship whitelist.room)]
      ['capacity' (numb capacity.room)]
      ['space' s+(spat /(scot %p ship.space.room)/(scot %tas space.space.room))]
    ==
  ++  set-ship
    |=  ships=(set @p)
    ^-  json
    :-  %a
    %+  turn
      ~(tap in ships)
      |=  her=@p
      s+(scot %p her)
  ::
  ++  current
    |=  current=(unit @t)
    ^-  json
    ?~  current
      ~
    s+u.current
    
  --
::
++  dejs
  =,  dejs:format
  |%
  ++  peer-action
    |=  jon=json
    ^-  ^peer-action
    =<  (decode jon)
    |%
    ++  decode
      %-  of
      :~  [%set-provider patp]
          [%reset-provider ul]

          [%create-room add]
          [%delete-room so]
          [%set-title set-title]
          [%set-access set-access]
          [%set-capacity set-capacity]
          [%set-space set-space]

          [%enter-room so]
          [%leave-room so]
          [%invite invite]
          [%kick kick]
          [%send-chat so]
      ==
    ++  patp
      (su ;~(pfix sig fed:ag))
    :: ::
    ++  add
      %-  ot
      :~  [%rid so]
          [%access access]
          [%title so]
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
          [%space spc-pth]
      ==
    ++  invite
      %-  ot
      :~  [%rid so]
          [%ship patp]
      ==
    ++  kick
      %-  ot
      :~  [%rid so]
          [%ship patp]
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
    ::
    ++  spc-pth
      %-  ot
      :~  [%ship (su ;~(pfix sig fed:ag))]
          [%space so]
      ==
    --
  ::
  ++  host-action
    |=  jon=json
    ^-  host-action:sur
    =<  (decode jon)
    |%
    ++  decode
      %-  of
      :~  [%set-online bo]
          [%ban patp]
          [%unban patp]
      ==
    ::
    ++  patp
      (su ;~(pfix sig fed:ag))
    ::
    --
  --
--
