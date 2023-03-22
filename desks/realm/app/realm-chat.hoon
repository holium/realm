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
          ~                                   :: set of muted chats
          ~                                   :: set of pinned chats
      ==
    :_  this(state default-state)
    :~
      [%pass /db %agent [our.bowl %chat-db] %watch /db]
    ==
  ++  on-save   !>(state)
  ++  on-load
    |=  old-state=vase
    ^-  (quip card _this)
    ~&  wex.bowl
    :: do a quick check to make sure we are subbed to /db in %chat-db
    =/  cards  ?:  =(wex.bowl ~)  
      [%pass /db %agent [our.bowl %chat-db] %watch /db]~
    ~
    :: REMOVE THIS SECTION WHEN YOU DONT WANT TO AUTO-BORK STATE EVERY TIME
    =/  default-state=state-0
      :*  %0
          '82328a88-f49e-4f05-bc2b-06f61d5a733e'  :: app-id:notify
          (sham our.bowl)                         :: uuid:notify
          *devices:notify
          %.y                                     :: push-enabled
          ~                                   :: set of muted chats
          ~                                   :: set of pinned chats
      ==
    [cards this(state default-state)]
    :: UNCOMMENT WHEN NOT UNDER ACTIVE DEVELOPMENT
    ::=/  old  !<(versioned-state old-state)
    ::?-  -.old
    ::  %0  [cards this(state old)]
    ::==
  ::
  ++  on-poke
    |=  [=mark =vase]
    ^-  (quip card _this)
    ?>  ?=(%chat-action mark)
    =/  act  !<(action vase)
    ~&  >  "%realm-chat poked {<-.act>}"
    =^  cards  state
    ?-  -.act  :: each handler function here should return [(list card) state]
      :: meta-chat management pokes
      %create-chat
        (create-chat:lib +.act state bowl)
      %edit-chat
        (edit-chat:lib +.act state bowl)
      %pin-message
        (pin-message:lib +.act state bowl)
      %clear-pinned-messages
        (clear-pinned-messages:lib +.act state bowl)
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
      %delete-backlog
        (delete-backlog:lib +.act state bowl)
      :: notification preferences pokes
      %disable-push
        (disable-push:lib state)
      %enable-push
        (enable-push:lib state)
      %remove-device
        (remove-device:lib +.act state)
      %set-device
        (set-device:lib +.act state)
      %mute-chat
        (mute-chat:lib +.act state)
      %pin-chat
        (pin-chat:lib +.act state)
    ==
    [cards this]
  ::  realm-chat supports no subscriptions
  ::  realm-chat does not care
  ::  (users/frontends shoulc sub to %chat-db agent)
  ++  on-watch
    |=  =path
    ^-  (quip card _this)
    !!
  :: we support devices peek for push notifications
  :: and pins peek for list of pinned chats
  ++  on-peek
    |=  =path
    ^-  (unit (unit cage))
    ?+    path  !!
    ::
      [%x %devices ~]
        ?>  =(our.bowl src.bowl)
        ``notify-view+!>([%devices devices.state])
    ::
      [%x %pins ~]
        ?>  =(our.bowl src.bowl)
        ``pins+!>(pins.state)
    ==
  ::
  ++  on-agent
    |=  [=wire =sign:agent:gall]
    ^-  (quip card _this)
    ?+    wire  !!
      [%dbpoke ~]
        ?+    -.sign  `this
          %poke-ack
            ?~  p.sign  `this
            ~&  >>>  "%realm-chat: {<(spat wire)>} dbpoke failed"
            ~&  >>>  p.sign
            `this
        ==
      [%selfpoke ~]
        ?+    -.sign  `this
          %poke-ack
            ?~  p.sign  `this
            ~&  >>>  "%realm-chat: {<(spat wire)>} selfpoke failed"
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
              [%pass /db %agent [our.bowl %chat-db] %watch /db]
            ==
          %fact
            ?+    p.cage.sign  `this
              %chat-db-dump
                ::~&  >>>  'we got a new db-dump thing'
                ::~&  >>>  !<(db-dump:db-sur q.cage.sign)
                `this
              %chat-db-change
                =/  thechange=db-change:db-sur  !<(db-change:db-sur q.cage.sign)
                =/  cards=(list card)
                  %-  zing
                  %+  turn
                    %+  skim
                      thechange 
                    |=(ch=db-change-type:db-sur =(-.ch %add-row))
                  |=  ch=db-change-type:db-sur
                  ^-  (list card)
                  ?+  -.ch  ~
                    %add-row
                    ?+  -.db-row.ch  ~
                      %paths
                        =/  pathrow  path-row.db-row.ch
                        =/  pathpeers  (scry-peers:lib path.pathrow bowl)
                        =/  host  (snag 0 (skim pathpeers |=(p=peer-row:db =(role.p %host))))
                        ?:  =(patp.host our.bowl) :: if it's our own creation, don't do anything
                          ~
                        =/  send-status-message
                          !>([%send-message path.pathrow ~[[[%status (crip "{(scow %p our.bowl)} joined the chat")] ~ ~]] *@dr])
                        [%pass /selfpoke %agent [our.bowl %realm-chat] %poke %chat-action send-status-message]~
                      %messages
                        =/  thepath  path.msg-part.db-row.ch
                        ?:
                        ?|  =(sender.msg-id.msg-part.db-row.ch our.bowl) :: if it's our message, don't do anything
                            (~(has in mutes.state) thepath)               :: if it's a muted path, don't do anything
                        ==
                          ~
                        =/  notif-db-card  (notif-new-msg:core msg-part.db-row.ch our.bowl)
                        ?:  :: if we should do a push notification also,
                        ?&  push-enabled.state                  :: push is enabled
                            (gth (lent ~(tap by devices.state)) 0) :: there is at least one device
                        ==
                          =/  push-card  (push-notification-card:lib bowl state thepath 'New Message' (crip "from {(scow %p sender.msg-id.msg-part.db-row.ch)}"))
                          [push-card notif-db-card ~]
                        :: otherwise, just send to notif-db
                        [notif-db-card ~]
                    ==
                  ==
                [cards this]
            ==
        ==
    ==
  ::
  ++  on-leave
    |=  path
      `this
  :: we don't care about arvo
  ++  on-arvo
    |=  [=wire =sign-arvo]
    ^-  (quip card _this)
    !!
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
  |=  ch=*
  ^-  ?
  ?+  -.ch  %.n
    %add-row  =(-.+.ch %messages)
  ==
::
++  notif-new-msg
  |=  [=msg-part:db-sur =ship]
  ^-  card  [
    %pass
    /dbpoke
    %agent
    [ship %notif-db]
    %poke
    %ndb-poke
    !>([%create %realm-chat /new-messages %message 'New Message' (crip "from {(scow %p sender.msg-id.msg-part)}") '' ~ '' ~])
  ]
--
