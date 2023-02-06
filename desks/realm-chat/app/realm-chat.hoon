::  app/realm-chat.hoon
/-  *realm-chat, db-sur=chat-db, notify
/+  dbug, lib=realm-chat
=|  state-0
=*  state  -
:: ^-  agent:gall
=<
  %-  agent:dbug
  |_  =bowl:gall
  +*  this  .
      core   ~(. +> [bowl ~])
  ::
  ++  on-init
    ^-  (quip card _this)
    =/  default-state=state-0
      :*  %0
          '82328a88-f49e-4f05-bc2b-06f61d5a733e'  :: app-id:notify
          (sham our.bowl)                         :: uuid:notify
          *devices:notify
          %.y                                     :: push-enabled
      ==
    :_  this(state default-state)
    :~
      [%pass /db %agent [our.bowl %chat-db] %watch /db]
::      [%pass /messages %agent [our.bowl %chat-db] %watch /db/messages/start/(scot %p our.bowl)/(scot %da now.bowl)]
    ==
  ++  on-save   !>(state)
  ++  on-load
    |=  old-state=vase
    ^-  (quip card _this)
    =/  cards  ?:  =(wex.bowl ~)  
::      [%pass /messages %agent [our.bowl %chat-db] %watch /db/messages/start/(scot %p our.bowl)/(scot %da now.bowl)]~
      [%pass /db %agent [our.bowl %chat-db] %watch /db]~
    ~
    =/  old  !<(versioned-state old-state)
    ?-  -.old
      %0  [cards this(state old)]
    ==
  ::
  ++  on-poke
    |=  [=mark =vase]
    ^-  (quip card _this)
    ?>  ?=(%action mark)
    =/  act  !<(action vase)
    =^  cards  state
    ?-  -.act  :: each handler function here should return [(list card) state]
      :: meta-chat management pokes
      %create-chat
        (create-chat:lib +.act state bowl)
      %add-ship-to-chat
        (add-ship-to-chat:lib +.act state bowl)
      %remove-ship-from-chat
        (remove-ship-from-chat:lib +.act state bowl)
      :: message management pokes
      %send-message
        (send-message:lib +.act state bowl)
      %edit-message
        (edit-message:lib +.act state bowl)
      %delete-message
        (delete-message:lib +.act state bowl)
      :: notification preferences pokes
      %disable-push
        (disable-push:lib state)
      %enable-push
        (enable-push:lib state)
      %remove-device
        (remove-device:lib +.act state)
      %set-device
        (set-device:lib +.act state)
    ==
    [cards this]
  ::
  ++  on-watch
    |=  =path
    ^-  (quip card _this)
    ?>  =(our.bowl src.bowl)
    =/  cards=(list card)
    ::  each path should map to a list of cards
    ?+  path      !!
      ::
        [%updates ~]
          ~
          :::~  [%give %fact ~ db-dump+!>(tables+all-tables:core)]
          ::==
    ==
    [cards this]
  ::
  ++  on-peek
    |=  =path
    ^-  (unit (unit cage))
    ?+    path  !!
    ::
      [%x %dms ~]
        ?>  =(our.bowl src.bowl)
        ``graph-dm-view+!>([%inbox ~])
    ==
  ::
  ++  on-agent
    |=  [=wire =sign:agent:gall]
    ^-  (quip card _this)

    ?+    wire  !!
      [%dbpoke ~]
        ~&  >>  -.sign
        ?+    -.sign  `this
          %poke-ack
            ?~  p.sign  `this
            ~&  >>>  wire
            ~&  >>>  "dbpoke failed"
            `this
        ==
      [%db ~]
        ?+    -.sign  !!
          %watch-ack
            ?~  p.sign  `this
            ~&  >>>  "{<dap.bowl>}: /db subscription failed"
            `this
          %kick
            ~&  >  "{<dap.bowl>}: /db kicked us, resubscribing..."
            :_  this
            :~
              [%pass /db %agent [our.bowl %graph-store] %watch /db]
            ==
          %fact
            ~&  >>  p.cage.sign
            ?+    p.cage.sign  `this
                %db-dump
                  ::~&  >>>  'we got a new db-dump thing'
                  ::~&  >>>  !<(db-dump:db-sur q.cage.sign)
                  `this
                %db-change
                  ::~&  >>>  'we got a new db-change thing'
                  =/  thechange  !<(db-change:db-sur q.cage.sign)
                  ?. :: ?. not ?: to reverse order
                  :: the following conditions must ALL be true in order
                  :: for us to send out a push-notification
                  ?&  (lien thechange is-new-message)     :: the change includes a new message
                      push-enabled.state                  :: push is enabled
                      (gth (lent ~(tap by devices.state)) 0) :: there is at least one device
                  ==
                    :: at least one of the conditions was not met,
                    :: so just ignore the %fact
                    `this
                  :: ELSE, push notify about the new message
                  =/  firstelem=db-change-type:db-sur  (snag 0 (skim thechange is-new-message))
                  ?+  -.firstelem  `this
                    %add-row
                    ?+  -.db-row.firstelem  `this
                      %messages
                      :: if it's our message, don't do anything
                      ?:  =(sender.msg-id.msg-part.db-row.firstelem our.bowl)
                        `this
                      =/  thepath  path.msg-part.db-row.firstelem
                      =/  push-card  (push-notification-card:lib bowl state thepath 'New Message' (crip "from {(scow %p sender.msg-id.msg-part.db-row.firstelem)}"))
                      [[push-card ~] this]
                    ==
                  ==
            ==
        ==
      [%messages ~]
        ?+    -.sign  !!
          %watch-ack
            ?~  p.sign  `this
            ~&  >>>  "{<dap.bowl>}: /messages subscription failed"
            `this
          %kick
            ~&  >  "{<dap.bowl>}: /messages kicked us, resubscribing..."
            :_  this
            :~
              [%pass /messages %agent [our.bowl %graph-store] %watch /db/messages/start/(scot %p our.bowl)/(scot %da now.bowl)]
            ==
          %fact
            ~&  >>>  p.cage.sign
            ?+    p.cage.sign  !!
                %messages-table
                  `this
                %db-change
                  ~&  >>>  'we got a new db-change thing'
                  ~&  >>>  !<(db-change:db-sur q.cage.sign)
                  `this
            ==
        ==
    ==
  ::
  ++  on-leave
    |=  path
      `this
  ::
  ++  on-arvo
    |=  [=wire =sign-arvo]
    ^-  (quip card _this)
    ?+  wire  !!
        [%fake *]
      `this
    ==
  ::
  ++  on-fail
    |=  [=term =tang]
    %-  (slog leaf+"error in {<dap.bowl>}" >term< tang)
    `this
  --
|_  [=bowl:gall cards=(list card)]
::
++  this  .
++  core  .
++  is-new-message
  |=  [a=db-change-type:db-sur]
  ?+  -.a  %.n
    %add-row  =(-.db-row.a %messages)
  ==
--
