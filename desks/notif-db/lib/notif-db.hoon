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
  |=  [r=notif-row:sur t=@da]
  =.  read.r        %.n
  =.  updated-at.r  t
  r
::
++  mark-row-read
  |=  [r=notif-row:sur now=@da]
  =.  read-at.r     now
  =.  updated-at.r  now
  =.  read.r        %.y
  r
::
++  mark-app-read
  |=  [tbl=notifs-table:sur app=@tas now=@da]
  =/  kvs  (skim (tap:notifon:sur tbl) |=([k=@ud v=notif-row:sur] =(app app.v)))
  =/  ids=(list id:sur)  (turn kvs |=([k=@ud v=notif-row:sur] k))
  =/  index=@ud  0
  =/  stop=@ud   (lent ids)
  |-
  ?:  =(stop index)
    [tbl ids]
  $(index +(index), tbl (put:notifon:sur tbl (snag index ids) (mark-row-read +:(snag index kvs) now)))
::
++  mark-path-read
  |=  [tbl=notifs-table:sur app=@tas =path now=@da]
  =/  kvs  (skim (tap:notifon:sur tbl) |=([k=@ud v=notif-row:sur] &(=(path path.v) =(app app.v))))
  =/  ids=(list id:sur)  (turn kvs |=([k=@ud v=notif-row:sur] k))
  =/  index=@ud  0
  =/  stop=@ud   (lent ids)
  |-
  ?:  =(stop index)
    [tbl ids]
  $(index +(index), tbl (put:notifon:sur tbl (snag index ids) (mark-row-read +:(snag index kvs) now)))
::
++  toggle-dismissed
  |=  [r=notif-row:sur now=@da d=?]
  =.  dismissed-at.r   now
  =.  updated-at.r    now
  =.  dismissed.r      d
  r
::
++  mark-app-dismiss
  |=  [tbl=notifs-table:sur app=@tas now=@da]
  =/  kvs  (skim (tap:notifon:sur tbl) |=([k=@ud v=notif-row:sur] =(app app.v)))
  =/  ids=(list id:sur)  (turn kvs |=([k=@ud v=notif-row:sur] k))
  =/  index=@ud  0
  =/  stop=@ud   (lent ids)
  |-
  ?:  =(stop index)
    [tbl ids]
  $(index +(index), tbl (put:notifon:sur tbl (snag index ids) (toggle-dismissed +:(snag index kvs) now %.y)))
::
++  mark-path-dismiss
  |=  [tbl=notifs-table:sur app=@tas =path now=@da]
  =/  kvs  (skim (tap:notifon:sur tbl) |=([k=@ud v=notif-row:sur] &(=(path path.v) =(app app.v))))
  =/  ids=(list id:sur)  (turn kvs |=([k=@ud v=notif-row:sur] k))
  =/  index=@ud  0
  =/  stop=@ud   (lent ids)
  |-
  ?:  =(stop index)
    [tbl ids]
  $(index +(index), tbl (put:notifon:sur tbl (snag index ids) (toggle-dismissed +:(snag index kvs) now %.y)))
::
::
::  poke actions
::
++  create
:: :notif-db &ndb-poke [%create %chat-db /realm-chat/path-id %message 'Title' 'the message' '' ~ '' ~]
  |=  [act=create-action:sur state=state-0 =bowl:gall]
  ^-  (quip card state-0)
  =/  row=notif-row:sur  [
    next.state
    app.act
    path.act
    type.act
    title.act
    content.act
    image.act
    buttons.act
    link.act
    metadata.act
    now.bowl
    now.bowl
    *@da
    %.n
    *@da
    %.n
  ]
  =.  notifs-table.state  (put:notifon:sur notifs-table.state next.state row)
  =.  next.state          +(next.state)
  =/  thechange  db-change+!>((limo [[%add-row row] ~]))
  =/  gives  :~
    [%give %fact [/db /new ~] thechange]
  ==
  [gives state]
::
++  read-id
::  :notif-db &ndb-poke [%read-id 0]
  |=  [=id:sur state=state-0 =bowl:gall]
  ^-  (quip card state-0)
  =/  row  (mark-row-read (got:notifon:sur notifs-table.state id) now.bowl)
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
  =/  mark-result  (mark-app-read notifs-table.state app now.bowl)
  =.  notifs-table.state  -:mark-result
  =/  thechange  db-change+!>((turn +:mark-result |=(id=@ud [%update-row (got:notifon:sur notifs-table.state id)])))
  =/  gives  :~
    [%give %fact [/db ~] thechange]
  ==
  [gives state]
::
++  read-path
::  :notif-db &ndb-poke [%read-path %chat-db /realm-chat/path-id]
  |=  [act=[app=@tas =path] state=state-0 =bowl:gall]
  ^-  (quip card state-0)
  ::  mark-result is like: [notifs-table ids]
  =/  mark-result  (mark-path-read notifs-table.state app.act path.act now.bowl)
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
  =/  t  now.bowl
  =.  notifs-table.state  (run:notifon:sur notifs-table.state |=(r=notif-row:sur ?:(flag (mark-row-read r t) (mark-row-unread r t))))
  =/  thechange  db-change+!>((limo [[%update-all flag] ~]))
  =/  gives  :~
    [%give %fact [/db ~] thechange]
  ==
  [gives state]
::
++  dismiss-id
::  :notif-db &ndb-poke [%dismiss-id 0]
  |=  [=id:sur state=state-0 =bowl:gall]
  ^-  (quip card state-0)
  =/  row  (got:notifon:sur notifs-table.state id)
  =.  notifs-table.state  (put:notifon:sur notifs-table.state id (toggle-dismissed row now.bowl %.y))
  =/  thechange  db-change+!>((limo [[%update-row row] ~]))
  =/  gives  :~
    [%give %fact [/db ~] thechange]
  ==
  [gives state]
::
++  dismiss-app
::  :notif-db &ndb-poke [%dismiss-app %chat-db]
  |=  [app=@tas state=state-0 =bowl:gall]
  ^-  (quip card state-0)
  ::  mark-result is like: [notifs-table ids]
  =/  mark-result  (mark-app-dismiss notifs-table.state app now.bowl)
  =.  notifs-table.state  -:mark-result
  =/  thechange  db-change+!>((turn +:mark-result |=(id=@ud [%update-row (got:notifon:sur notifs-table.state id)])))
  =/  gives  :~
    [%give %fact [/db ~] thechange]
  ==
  [gives state]
::
++  dismiss-path
::  :notif-db &ndb-poke [%dismiss-path %chat-db /realm-chat/path-id]
  |=  [act=[app=@tas =path] state=state-0 =bowl:gall]
  ^-  (quip card state-0)
  ::  mark-result is like: [notifs-table ids]
  =/  mark-result  (mark-path-dismiss notifs-table.state app.act path.act now.bowl)
  =.  notifs-table.state  -:mark-result
  =/  thechange  db-change+!>((turn +:mark-result |=(id=@ud [%update-row (got:notifon:sur notifs-table.state id)])))
  =/  gives  :~
    [%give %fact [/db ~] thechange]
  ==
  [gives state]
::
++  update
:: :notif-db &ndb-poke [%update 0 %chat-db /realm-chat/path-id %message 'T2' 'the mes...' '' ~ '' ~]
  |=  [act=[=id:sur =create-action:sur] state=state-0 =bowl:gall]
  ^-  (quip card state-0)
  =/  row  (got:notifon:sur notifs-table.state id.act)
  =.  app.row        app.create-action.act
  =.  path.row       path.create-action.act
  =.  type.row       type.create-action.act
  =.  title.row      title.create-action.act
  =.  content.row    content.create-action.act
  =.  image.row      image.create-action.act
  =.  buttons.row    buttons.create-action.act
  =.  link.row       link.create-action.act
  =.  metadata.row   metadata.create-action.act
  =.  updated-at.row      now.bowl
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
          [%dismiss-id ni]
          [%dismiss-app (se %tas)]
          [%dismiss-path app-and-path]
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
          [%title so]
          [%content so]
          [%image so]
          [%buttons (ar button)]
          [%link so]
          [%metadata (om so)]
      ==
    ::
    ++  button
      %-  ot
      :~  [%label so]
          [%path pa]
          [%data so]
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
      |=  rws=(list notif-row:sur)
      ^-  json
      (notifs:encode rws)
  --
++  encode
  =,  enjs:format
  |%
    ++  notifs
      |=  rows=(list notif-row:sur)
      ^-  json
      [%a (turn rows notifs-row)]
    ::
    ++  notifs-row
      |=  =notif-row:sur
      ^-  json
      %-  pairs
      :~  id+(numb id.notif-row)
          app+s+app.notif-row
          path+s+(spat path.notif-row)
          type+s+type.notif-row
          title+s+title.notif-row
          content+s+content.notif-row
          image+s+image.notif-row
          buttons+a+(turn buttons.notif-row button-up)
          link+s+link.notif-row
          metadata+(metadata-to-json metadata.notif-row)
          created-at+(time created-at.notif-row)
          updated-at+(time updated-at.notif-row)
          read-at+(time-or-null read-at.notif-row)
          read+b+read.notif-row
          dismissed-at+(time-or-null dismissed-at.notif-row)
          dismissed+b+dismissed.notif-row
      ==
    ::
    ++  time-or-null
      |=  t=@da
      ^-  json
      ?:  =(t *@da)
        ~
      (time t)
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
          :~(['type' %s -.ch] ['row' (notifs-row notif-row.ch)])
        %update-all
          :~(['type' %s -.ch] ['read' %b flag.ch])
        %update-row
          :~(['type' %s -.ch] ['row' (notifs-row notif-row.ch)])
        %del-row
          :~(['type' %s -.ch] ['id' (numb id.ch)])
      ==
    ++  button-up
      |=  b=button:sur
      ^-  json
      %-  pairs
      :~  ['label' %s label.b]
          ['path' s+(spat path.b)]
          ['data' s+data.b]
          ['metadata' (metadata-to-json metadata.b)]
      ==
    ++  metadata-to-json
      |=  m=(map cord cord)
      ^-  json
      o+(~(rut by m) |=([k=cord v=cord] s+v))
  --
--
