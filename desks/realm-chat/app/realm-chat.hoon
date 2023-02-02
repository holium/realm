/-  *realm-chat, db-sur=chat-db
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
      [%0 'TODO real initial state']
    :_  this(state default-state)
    :~
      [%pass /db %agent [our.bowl %chat-db] %watch /db]
::      [%pass /messages %agent [our.bowl %chat-db] %watch /db/messages/start/(scot %p our.bowl)/(scot %da now.bowl)]
    ==
  ++  on-save   !>(state)
  ++  on-load
    |=  old-state=vase
    ^-  (quip card _this)
    ~&  %on-load-realm-chat
    ~&  bowl
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
    ~&  mark
    ~&  vase
    ?>  ?=(%action mark)
    =/  act  !<(action vase)
    =^  cards  state
    ?-  -.act  :: each handler function here should return [(list card) state]
      %send-message
        (send-message:lib +.act state bowl)
      %create-chat
        (create-chat:lib +.act state bowl)
      %add-ship-to-chat
        (add-ship-to-chat:lib +.act state bowl)
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
            ~&  >>>  p.cage.sign
            ?+    p.cage.sign  `this
                %db-dump
                  ~&  >>>  'we got a new db-dump thing'
                  ~&  >>>  !<(db-dump:db-sur q.cage.sign)
                  `this
                %db-change
                  ~&  >>>  'we got a new db-change thing'
                  ~&  >>>  !<(db-change:db-sur q.cage.sign)
                  `this
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
++  all-tables
  ~
--
