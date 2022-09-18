/-  sur=push-notify, courier
=<  [sur .]
=,  sur
|%
++  generate-push-notification
  |=  [app-id=cord new-dm=chat:courier]
  ^-  notification
  =/  new-push
    ?-    type.new-dm  
      %dm                 (dm-notif app-id new-dm)
      %pending            (dm-notif app-id new-dm)
      %group              (group-notif app-id new-dm)
      %group-pending      (group-notif app-id new-dm)
    ==
  new-push
::
++  dm-notif
  |=  [app-id=cord new-dm=chat:courier]
  ^-  notification
  =/  from      (rear ~(tap in to.new-dm))
  =/  content   (crip "New message from {(scow %p from)}")
  =/  mtd   ^-(mtd:sur [path.new-dm])
  =/  new-push
    [
      app-id=app-id
      included-segments=~['Subscribed Users']
      data=[mtd]
      contents=(malt ~[['en' content]])
    ]
  new-push
::
++  group-notif
  |=  [app-id=cord new-dm=chat:courier]
  ^-  notification
  =/  from      (turn ~(tap in to.new-dm) |=([p=@p] (scow %p p)))
  :: =/  content   (crip "New message from {(scow %p from)}")
  :: =/  content   (crip "New group DM from {<from>}")
  =/  new-push
    [
      app-id=app-id
      included-segments=~['Subscribed Users']
      data=[path=path.new-dm]
      :: contents=`(map cord cord)`(malt ~[['en' (crip "New group DM from {<from>}")]])
      contents=`(map cord cord)`(malt ~[['en' (crip "New group DM message")]])
    ]
  new-push
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
      :~  [%enable-push ul]
          [%disable-push ul]
      ==
    ::
    --
  ::
  --
++  enjs
  =,  enjs:format
  |%
  ++  view :: encodes for on-peek
    |=  vi=view:sur
    ^-  json
    %-  pairs
    :_  ~
    ^-  [cord json]
    :-  -.vi
    ?-  -.vi
      :: ::
        %uuid
      (uuid uuid.vi)
      ::
    ==
  ++  uuid
    |=  =uuid:sur
    ^-  json
    s+(scot %uv uuid)
    :: :~ 
    ::     ['uuid' s+(scot %uv uuid)]
    :: ==
  --
::
--