/-  *versioned-state, sur=chat-db
/+  dbug, default-agent, db-lib=chat-db
=|  state-0
=*  state  -
:: ^-  agent:gall
%-  agent:dbug
|_  =bowl:gall
+*  this  .
    def   ~(. (default-agent this %.n) bowl)
++  all-tables
  [[%paths paths-table.state] [%messages messages-table.state] [%peers peers-table.state] ~]
::
++  on-init
  ^-  (quip card _this)
  =/  default-state=state-0
    [%0 *paths-table:sur *messages-table:sur *peers-table:sur]
  `this(state default-state)
++  on-save   !>(state)
++  on-load
  |=  old-state=vase
  ^-  (quip card _this)
  ~&  %on-load
  =/  old  !<(versioned-state old-state)
  ?-  -.old
    %0  `this(state old)
  ==
::
++  on-poke
  |=  [=mark =vase]
  ^-  (quip card _this)
  ?>  ?=(%action mark)
  =/  act  !<(action:sur vase)
  =^  cards  state
  ?-  -.act  :: each handler function here should return [(list card) state]
    %create-path 
      (create-path:db-lib act state bowl)
    %leave-path 
      (leave-path:db-lib act state bowl)
    %insert
      (insert:db-lib act state bowl)
    %edit
      (edit:db-lib act state bowl)
    %delete
      (delete:db-lib act state bowl)
    %add-peer
      (add-peer:db-lib act state bowl)
    %kick-peer
      (kick-peer:db-lib act state bowl)
  ==
  [cards this]
::
++  on-watch
  |=  =path
  ^-  (quip card _this)
  ?>  =(our.bowl src.bowl)
  =/  cards=(list card)
  ::  each path should map to a list of cards
  ?+  path      (on-watch:def path)
    ::
      [%db ~]  :: the "everything" path
        :~  [%give %fact ~ db-dump+!>(tables+all-tables)]
        ==
    :: /db/messages/start/~zod/~2023.1.17..19.50.46..be0e
      [%db %messages %start @ @ ~]  :: the "recent messages" path
        =/  sender=@p       `@p`(slav %p i.t.t.t.path)
        =/  timestamp=@da   `@da`(slav %da i.t.t.t.t.path)
        :~  [%give %fact ~ messages-table+!>((start:from:db-lib `msg-id:sur`[timestamp sender] messages-table.state))]
        ==
    :: /db/path/0v1.b20g0
      [%db %path @ ~]  :: the "path" path, subscribe by path-id explicitly
        =/  thepathrow   (~(get by paths-table.state) `path-id:sur`(slav %uv i.t.t.path))
        :~  [%give %fact ~ path-row+!>(thepathrow)]
        ==
  ==
  [cards this]
::
++  on-peek
  |=  =path
  ^-  (unit (unit cage))
  ?+    path  (on-peek:def path)
  ::
    [%x %db ~]
      ``db-dump+!>([%tables all-tables])
  ::
    [%x %db %paths ~]
      ``db-dump+!>([%tables [[%paths paths-table.state] ~]])
  ::
    [%x %db %peers ~]
      ``db-dump+!>([%tables [[%peers peers-table.state] ~]])
  ::
    [%x %db %messages ~]
      ``db-dump+!>([%tables [[%messages messages-table.state] ~]])
  ::
    [%x %db %messages %start @ @ ~]
      =/  sender=@p       `@p`(slav %p i.t.t.t.path)
      =/  timestamp=@da   `@da`(slav %da i.t.t.t.t.path)
      ``messages-table+!>((start:from:db-lib `msg-id:sur`[timestamp sender] messages-table.state))
  ==
::
++  on-agent
  |=  [=wire =sign:agent:gall]
  ^-  (quip card _this)
  ?+    wire  (on-agent:def wire sign)
    [%fake ~]
      ?+    -.sign  (on-agent:def wire sign)
        %watch-ack
          ?~  p.sign  `this
          ~&  >>>  "{<dap.bowl>}: fake subscription failed"
          `this
        %kick
          ~&  >  "{<dap.bowl>}: fake kicked us, resubscribing..."
          `this
          :::_  this
          :::~
          ::  [%pass /graph-store %agent [our.bowl %graph-store] %watch /updates]
          ::==
        %fact
          ?+    p.cage.sign  (on-agent:def wire sign)
              %case
                `this
          ==
      ==
  ==
::
++  on-leave    on-leave:def
::
++  on-arvo
  |=  [=wire =sign-arvo]
  ^-  (quip card _this)
  ?+  wire  (on-arvo:def wire sign-arvo)
      [%fake *]
    `this
  ==
::
++  on-fail     on-fail:def
--
