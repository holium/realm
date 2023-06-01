
/-  sur=notify, realm-chat, hark=hark-store, resource, spaces-path
=<  [sur .]
=,  sur
|%
++  notify
  |=  [pth=path:spaces-path slug=path msg=cord now=@da]
  ^-  action:hark
  :+  %add-note  `bin:hark`[/ [%realm /spaces/(scot %p ship.pth)]]
  :*  [ship/ship.pth text/msg ~]
      ~
      now
      /
      %-  weld
      :-  /spaces/(scot %p ship.pth)/(scot %tas space.pth)
      slug
  ==
::
++  dejs
  =,  dejs:format
  |%
  ++  action
    |=  jon=json
    ^-  action:realm-chat
    =<  (decode jon)
    |%
    ++  decode
      %-  of
      :~  [%enable-push ul]
          [%disable-push ul]
          [%set-device set-device]
          [%remove-device remove-device]
      ==
    ::
    ++  set-device
      %-  ot
      :~  [%device-id so]
          [%player-id so]
      ==
    ::
    ++  remove-device
      %-  ot
      :~  [%device-id so]
      ==
    ::
    --
  ::
  --
++  enjs
  =,  enjs:format
  |%
  ++  request :: encodes for iris outbound
    |=  [notif=notification:sur =devices:sur]
    ^-  json
    =/  player-ids  ~(val by devices)
    =/  base-list
    :~  
        ['app_id' s+app-id.notif]
        ['data' (mtd data.notif)]
        ['include_player_ids' a+(turn player-ids |=([id=@t] s+id))]
        ['headings' (contents title.notif)]
    ==
    =/  extended-list
      ?~  subtitle.notif  base-list
      :-  ['subtitle' (contents subtitle.notif)]
      base-list

    ?~  contents.notif
      (pairs extended-list)
    %-  pairs
    :-
      ['contents' (contents contents.notif)]
      extended-list
    ++  mtd 
      |=  =mtd:sur
      ^-  json
      %-  pairs
      :~
        ['path' s+path.mtd]
        ['usrinfo' o+(~(run by member-meta.mtd) mtd-helper)]
        ['unread_count' (numb unread.mtd)]
        ['avatar' ?~(avatar.mtd ~ s+u.avatar.mtd)]
      ==
    ++  mtd-helper
      |=  mtd=contact-mtd:sur
      ^-  json
      %-  pairs
      :~
          ['avatar' ?~(avatar.mtd ~ s+u.avatar.mtd)]
          ['nickname' s+nickname.mtd]
          ['color' s+(scot %ux color.mtd)]  ::  todo convert this to hex string here
      ==
    ::
    ++  contents 
      |=  contents=(map cord cord)
      ^-  json
      =/  message   (~(got by contents) 'en')
      %-  pairs
      ['en' s+message]~
  ::
  ++  view :: encodes for on-peek
    |=  vi=view:sur
    ^-  json
    %-  pairs
    :_  ~
    ^-  [cord json]
    :-  -.vi
    ?-  -.vi
      :: ::
        %devices
      (devices devices.vi)
      ::
    ==
  ++  devices
    |=  =devices:sur
    ^-  json
    %-  pairs
    %+  turn  ~(tap by devices)
    |=  [=device-id:sur =player-id:sur]
    ^-  [cord json]
    [device-id s+player-id]
  --
::
--
