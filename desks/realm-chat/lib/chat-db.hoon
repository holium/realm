::  chat-db [realm]:
::
::  Chat message lib within Realm. Mostly handles [de]serialization
::    to/from json from types stored in courier sur.
::
/-  *versioned-state, sur=chat-db
|%
::
::  poke actions
::
++  create-path
  |=  [act=action:sur state=state-0 =bowl:gall]
  ^-  (quip card state-0)
  [~ state]
++  leave-path
  |=  [act=action:sur state=state-0 =bowl:gall]
  ^-  (quip card state-0)
  [~ state]
++  insert
  |=  [act=action:sur state=state-0 =bowl:gall]
  ^-  (quip card state-0)
  [~ state]
++  edit
  |=  [act=action:sur state=state-0 =bowl:gall]
  ^-  (quip card state-0)
  [~ state]
++  delete
  |=  [act=action:sur state=state-0 =bowl:gall]
  ^-  (quip card state-0)
  [~ state]
++  add-peer
  |=  [act=action:sur state=state-0 =bowl:gall]
  ^-  (quip card state-0)
  [~ state]
++  kick-peer
  |=  [act=action:sur state=state-0 =bowl:gall]
  ^-  (quip card state-0)
  [~ state]
::
::  mini helper lib
::
++  from
  |%
  ++  start
    |=  [=msg-id:sur tbl=messages-table:sur]
    ^-  (list msg-part:sur)
    :: TODO actually filter the messages-table mop type into a list of
    :: msg-part that have id gth msg-id passed in
    ~
  ::++  messages-table
  ::  |=  =tables:sur
  ::  ^-  messages-table:sur
  ::  =/  mini  (skim tables |=(a=table:sur =(-.a %messages)))
  ::  (snag 0 mini)
  --
::
::  JSON
::
++  enjs
  =,  enjs:format
  |%
  ++  db-dump :: encodes for on-watch
    |=  db=db-dump:sur
    ^-  json
    %-  pairs
    :_  ~
    ^-  [cord json]
    :-  -.db
    ?-  -.db
      :: ::
        %tables
      (all-tables:encode tables.db)
    ==
  ::
  ++  messages-table :: encodes for on-watch
    |=  tbl=messages-table:sur
    ^-  json
    (messages-table:encode tbl)
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
        %inbox
      (chat-previews:encode chat-previews.vi)
      ::
        %dm-log
      (dm-log:encode chat.vi)
    ==
  ::
  ++  rolodex
    |=  =rolodex:cs
    ^-  json
    |^
    %-  pairs
    %+  turn  ~(tap by rolodex)
    |=  [ship=@p =contact:cs]
    ^-  [cord json]
    [(scot %p ship) (encode-contact contact)]
    ++  encode-contact
      |=  =contact:cs
      ^-  json
      %-  pairs:enjs:format
      :~  ['nickname' s+nickname.contact]
          ['bio' s+bio.contact]
          ['color' s+(scot %ux color.contact)]
          ['avatar' ?~(avatar.contact ~ s+u.avatar.contact)]
          ['cover' ?~(cover.contact ~ s+u.cover.contact)]
          ['groups' a+(turn ~(tap in groups.contact) (cork enjs-path:res (lead %s)))]
      ==
    --
  --
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
      :~  [%send-dm dm]
          [%read-dm read-dm]
          [%create-group-dm cr-gp-dm]
          [%send-group-dm gp-dm]
          [%read-group-dm read-group-dm]
          [%set-groups-target parse-groups-target]
      ==
    ::
    ++  parse-groups-target
      %-  ot
      :~
          [%target ngt]
      ==
    ++  ngt  :: Number-to-Groups-Target
      |=  jon=json
      ?>  ?=([%n *] jon)
      ?:  =((rash p.jon dem) 1)
      %1
      %2
    ::
    ++  read-dm
      %-  ot
      :~  
          [%ship (su ;~(pfix sig fed:ag))]
      ==
    ::
    ++  read-group-dm
      %-  ot
      :~  
          [%resource dejs:res]
      ==
    ::
    ::
    ++  cr-gp-dm
      %-  ot
      :~  [%ships (as (su ;~(pfix sig fed:ag)))]
      ==
    ::
    ++  dm
      %-  ot
      :~  [%ship (su ;~(pfix sig fed:ag))]
          [%post pst]
      ==
    ::
    ++  gp-dm
      %-  ot
      :~  
          [%resource dejs:res]
          [%post pst]
      ==
    ::
    ++  pst
      %-  ot
      :~  [%author (su ;~(pfix sig fed:ag))]
          [%index index]
          [%time-sent di]
          [%contents (ar content)]
          [%hash (mu nu)]
          [%signatures (as signature)]
      ==
    ::
    ++  signature
      %-  ot
      :~  [%hash nu]
          [%ship (su ;~(pfix sig fed:ag))]
          [%life ni]
      ==
    ::
    ++  index  (su ;~(pfix fas (more fas dem)))
    ++  content
      %-  of
      :~  [%mention (su ;~(pfix sig fed:ag))]
          [%text so]
          [%url so]
          [%reference reference]
          [%code eval]
      ==
    ::
    ++  reference
      |^
      %-  of
      :~  graph+graph
          group+dejs-path:res
          app+app
      ==
      ::
      ++  graph
        %-  ot
        :~  group+dejs-path:res
            graph+dejs-path:res
            index+index
        ==
      ::
      ++  app
        %-  ot
        :~  ship+(su ;~(pfix sig fed:ag))
            desk+so
            path+pa
        ==
      --
    ::
    ++  tang 
      |=  jon=^json
      ^-  ^tang
      ?>  ?=(%a -.jon)
      %-  zing
      %+  turn
        p.jon
      |=  jo=^json
      ^-  (list tank)
      ?>  ?=(%a -.jo)
      %+  turn
        p.jo
      |=  j=^json
      ?>  ?=(%s -.j)
      ^-  tank
      leaf+(trip p.j)
    ::
    ++  eval
      %-  ot
      :~  expression+so
          output+tang
      ==
    ::
    ::
    --
  --
::
++  encode
  =,  enjs:format
  |%
  ++  all-tables
    |=  =tables:sur
    ^-  json
    %-  pairs
    %+  turn  tables
      |=  =table:sur
      ::[-.table (jsonify-table +.table)]
      [-.table s+'test']
  ::
  ++  messages-table
    |=  tbl=messages-table:sur
    ^-  json
    :: TODO actually convert messages table to json
    [%o *(map @t json)]
--
