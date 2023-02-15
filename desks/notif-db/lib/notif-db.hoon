::  notif-db [realm]:
::
/-  *versioned-state, sur=notif-db
|%
::
:: helpers
::
++  remove-notif-from-table
  |=  [tbl=notifs-table:sur =id:sur]
  +:(del:notifon:sur tbl id)
::
++  mark-row-unread
  |=  [r=notif-row:sur]
  =.  read.r  %.n
  r
::
++  mark-row-read
  |=  [r=notif-row:sur]
  =.  read.r  %.y
  r
::
++  mark-app-read
  |=  [tbl=notifs-table:sur app=@tas]
  =/  kvs  (skim (tap:notifon:sur tbl) |=([k=@ud v=notif-row:sur] =(app app.v)))
  =/  ids=(list id:sur)  (turn kvs |=([k=@ud v=notif-row:sur] k))
  =/  index=@ud  0
  =/  stop=@ud   (lent ids)
  |-
  ?.  =(stop index)
    [tbl ids]
  $(index +(index), tbl (put:notifon:sur tbl (snag index ids) (mark-row-read +:(snag index kvs))))
::
++  mark-path-read
  |=  [tbl=notifs-table:sur app=@tas =path]
  =/  kvs  (skim (tap:notifon:sur tbl) |=([k=@ud v=notif-row:sur] &(=(path path.v) =(app app.v))))
  =/  ids=(list id:sur)  (turn kvs |=([k=@ud v=notif-row:sur] k))
  =/  index=@ud  0
  =/  stop=@ud   (lent ids)
  |-
  ?.  =(stop index)
    [tbl ids]
  $(index +(index), tbl (put:notifon:sur tbl (snag index ids) (mark-row-read +:(snag index kvs))))
++  rows-by-path
  |=  [app=@tas =path]
  %+  turn
    (skim (tap:notifon:sur notifs-table.state) |=([k=@ud v=notif-row:sur] &(=(app app.v) =(path path.v))))
  |=([k=@ud v=notif-row:sur] v)
::
::  poke actions
::
++  create
::  :notif-db &ndb-poke [%create %chat-db /realm-chat/path-id %message 'the message' ~]
  |=  [act=create-action:sur state=state-0 =bowl:gall]
  ^-  (quip card state-0)
  =/  row=notif-row:sur
  [
    next.state
    app.act
    path.act
    type.act
    content.act
    metadata.act
    now.bowl
    *@ud
    %.n
  ]
  =.  notifs-table.state  (put:notifon:sur notifs-table.state next.state row)
  =.  next.state          +(next.state)
  =/  thechange  db-change+!>((limo [[%add-row row] ~]))
  =/  gives  :~
    [%give %fact [/db ~] thechange]
  ==
  [gives state]
::
++  read-id
::  :notif-db &ndb-poke [%read-id 0]
  |=  [=id:sur state=state-0 =bowl:gall]
  ^-  (quip card state-0)
  =/  row  (got:notifon:sur notifs-table.state id)
  =.  read.row  %.y
  =.  notifs-table.state  (put:notifon:sur notifs-table.state id row)
  =/  thechange  db-change+!>((limo [[%update-row row] ~]))
  =/  gives  :~
    [%give %fact [/db ~] thechange]
  ==
  [gives state]
::
++  read-app
::  :notif-db &ndb-poke [%read-app %chat-db]
  |=  [app=@tas state=state-0 =bowl:gall]
  ^-  (quip card state-0)
  ::  mark-result is like: [notifs-table ids]
  =/  mark-result  (mark-app-read notifs-table.state app)
  =.  notifs-table.state  -:mark-result
  =/  thechange  db-change+!>((turn +:mark-result |=(id=@ud [%update-row (got:notifon:sur notifs-table.state id)])))
  =/  gives  :~
    [%give %fact [/db ~] thechange]
  ==
  [gives state]
::
++  read-path
::  :notif-db &ndb-poke [%read-path %chat-db /messages]
  |=  [act=[app=@tas =path] state=state-0 =bowl:gall]
  ^-  (quip card state-0)
  ::  mark-result is like: [notifs-table ids]
  =/  mark-result  (mark-path-read notifs-table.state app.act path.act)
  =.  notifs-table.state  -:mark-result
  =/  thechange  db-change+!>((turn +:mark-result |=(id=@ud [%update-row (got:notifon:sur notifs-table.state id)])))
  =/  gives  :~
    [%give %fact [/db ~] thechange]
  ==
  [gives state]
::
++  read-all
::  :notif-db &ndb-poke [%read-all %.y]
  |=  [flag=? state=state-0 =bowl:gall]
  ^-  (quip card state-0)
  =.  notifs-table.state  (run:notifon:sur notifs-table.state |=(r=notif-row:sur ?:(flag (mark-row-read r) (mark-row-unread r))))
  =/  thechange  db-change+!>((limo [[%update-all flag] ~]))
  =/  gives  :~
    [%give %fact [/db ~] thechange]
  ==
  [gives state]
::
++  update
::  :notif-db &ndb-poke [%update 0 %chat-db /realm-chat/path-id %message 'the mes...' ~]
  |=  [act=[=id:sur =create-action:sur] state=state-0 =bowl:gall]
  ^-  (quip card state-0)
  =/  row  (got:notifon:sur notifs-table.state id.act)
  =.  app.row        app.create-action.act
  =.  path.row       path.create-action.act
  =.  type.row       type.create-action.act
  =.  content.row    content.create-action.act
  =.  metadata.row   metadata.create-action.act
  =.  notifs-table.state  (put:notifon:sur notifs-table.state id.act row)
  =/  thechange  db-change+!>([[%update-row row] ~])
  =/  gives  :~
    [%give %fact [/db ~] thechange]
  ==
  [gives state]
::
++  delete
::  :notif-db &ndb-poke [%delete 0]
  |=  [=id:sur state=state-0 =bowl:gall]
  ^-  (quip card state-0)
  =.  notifs-table.state  (remove-notif-from-table notifs-table.state id)
  =/  thechange  db-change+!>((limo [[%del-row id] ~]))
  =/  gives  :~
    [%give %fact [/db ~] thechange]
  ==
  [gives state]
::
::  JSON
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
      :~  [%create de-create]
          [%read-id ni]
          [%read-app (se %tas)]
          [%read-path app-and-path]
          [%read-all bo]
          [%update de-update]
          [%delete ni]
      ==
    ::
    ++  de-update
      %-  ot
      :-  [%id ni]
      de-create-list
    ::
    ++  de-create  (ot de-create-list)
    ::
    ++  de-create-list
      :~  [%app (se %tas)]
          [%path pa]
          [%type (se %tas)]
          [%content so]
          [%metadata (om so)]
      ==
    ::
    ++  app-and-path
      %-  ot
      :~  [%app (se %tas)]
          [%path pa]
      ==
    --
  --
++  enjs
  =,  enjs:format
  |%
    ++  db-change :: encodes for on-watch
      |=  db=db-change:sur
      ^-  json
      (changes:encode db)
    ::
    ++  rows :: encodes for on-peek
      |=  tbl=notifs-table:sur
      ^-  json
      (notifs-table:encode tbl)
  --
++  encode
  =,  enjs:format
  |%
    ++  notifs-table
      |=  tbl=notifs-table:sur
      ^-  json
      [%a (turn (tap:notifon:sur tbl) notifs-row)]
    ::
    ++  notifs-row
      |=  [k=id:sur =notif-row:sur]
      ^-  json
      %-  pairs
      :~  id+(numb id.notif-row)
          app+s+app.notif-row
          path+s+(spat path.notif-row)
          type+s+type.notif-row
          content+s+content.notif-row
          metadata+(metadata-to-json metadata.notif-row)
          created-at+(time created-at.notif-row)
          read-at+(time read-at.notif-row)
          read+b+read.notif-row
      ==
    ::
    ++  changes
      |=  ch=db-change:sur
      ^-  json
      [%a (turn ch individual-change)]
    ++  individual-change
      |=  ch=db-change-type:sur
      %-  pairs
      ?-  -.ch
        %add-row
          :~(['type' %s -.ch] ['row' (notifs-row id.notif-row.ch notif-row.ch)])
        %update-all
          :~(['type' %s -.ch] ['read' %b flag.ch])
        %update-row
          :~(['type' %s -.ch] ['row' (notifs-row id.notif-row.ch notif-row.ch)])
        %del-row
          :~(['type' %s -.ch] ['id' (numb id.notif-row.ch)])
      ==
    ++  metadata-to-json
      |=  m=(map cord cord)
      ^-  json
      o+(~(rut by m) |=([k=cord v=cord] s+v))
  --
--
