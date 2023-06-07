::  app/db.hoon
::  - all data is scoped by /path, with a corresponding peers list
::  - ship-to-ship replication of data uses one-at-a-time subscriptions
::    described here: https://developers.urbit.org/reference/arvo/concepts/subscriptions#one-at-a-time
::  - ship-to-frontend syncing of data uses chat-db model of /db
::    subscribe wire and /x/db/start-ms/[unix ms].json
::  - %db provides a data layer only. business logic and permissioning
::    must be checked by the %app that uses it (unless it can be fit
::    within the database permissions and constraints system)
::  - custom data types work by %apps specifying the schema for the type
::
::  Example: (where %app is some forum-posting groups-like thing)
::  ~zod%app -> ~zod%db
::  ~bus%app -> ~bus%db
::    on-init both ~zod and ~bus %app should subscribe to /db on their own %db so they can be informed about data-changes
::  ~zod%app creates a new "thread", which means poking ~zod%db with the peers-list and path for that thread
::  ~zod%db then pokes ~bus%db with [%get-path path]
::  ~bus%db then subscribes to ~zod%db /path/[version]/[path] so that it will get the next update
::    AND, ~bus%db publishes the current version of data to its /db subscription-path
::  at this point, all the subs are set up to stay in sync, but no actual application data is in the "thread" ~zod%app originally created
:: THEN
:: ~zod%app creates a new "post" in that thread, which means poking ~zod%db [%create row], which causes:
::  1. ~zod%db updates its internal state
::  2. ~zod%db publishes the new version on /path/[version]/[path] to all [version] subs less than the new current revision
::  3. ~zod%db kicks all foreign subs from the paths it published to
::  4. ~zod%db publishes state to /db wire
:: which causes ~bus%db to:
:: 1. update its state
:: 2. publish its state to /db (so that ~bus%app and any frontend clients get it)
:: 3. subscribe to ~zod%db on /path/[version + 1]/[path] (so that we will be informed of next update)
:: THEN
:: ~bus%app wants to create a "reply" in the "thread" so it pokes ~zod%app with some format defined by %app, which causes:
:: 1. ~zod%app scries ~zod%db for peers to do permissions checking
:: 2. assuming allowed, ~zod%app pokes ~zod%db with [%create row]
:: 3. this cascades through publishing on the /path/[version]/[path] to all subs less than new version, just like with the original post
:: similar process for ~bus%app wanting to %edit their "reply"
::

::  TO USE:
::  - create a path with a list of peers with %create-path
::    ex: :db &db-action [%create-path /example %host ~ ~ ~ ~[[~zod %host] [~bus %member]]]
::  - create a data-row of a custom or pre-defined type
::    you are required to provide a schema when you first create a row of a new custom-type
::    but if the schema is already there for that type/version combo,
::    you can just pass ~ in that spot
::    schemas are versionable
::    ex: :db &db-action [%create /example %foo 0 [%general ~[1 'a']] ~[['num' 'ud'] ['str' 't']]]
::        :db &db-action [%create /example %vote 0 [%vote [%.y our %foo [~zod now] /example]] ~]
::        :db &db-action [%create /example %foo 1 [%general ~[1 'd' (jam /hello/goodbye)]] ~[['num' 'ud'] ['str' 't'] ['mypath' 'path']]]
::        :~zod/db &db-action [%create /example %vote 0 [%vote %.y our %foo [~zod now] /example] ~]

/-  *db, sstore=spaces-store, vstore=visas
/+  dbug, db, spaces-chat
=|  state-0
=*  state  -
:: ^-  agent:gall
=<
  %-  agent:dbug
  |_  =bowl:gall
  +*  this  .
  ::
  ++  on-init
    ^-  (quip card _this)
    =/  default-state=state-0   *state-0
    =/  default-cards
      :~  [%pass /spaces %agent [our.bowl %spaces] %watch /updates]
      ==
    =/  cs=(quip card state-0)  [default-cards default-state]

    =/  spaces-scry   .^(view:sstore %gx /(scot %p our.bowl)/spaces/(scot %da now.bowl)/all/noun)
    ?>  ?=(%spaces -.spaces-scry)
    =/  index=@ud     0
    =/  keys=(list space-path:sstore)  :: list of space-path we own
      %+  skim
        ~(tap in ~(key by spaces.spaces-scry))
      |=(=space-path:sstore &(=(ship.space-path our.bowl) ?!(=(space.space-path 'our'))))

    |-
      ?:  =(index (lent keys))
        [-.cs this(state +.cs)]
      =/  key       (snag index keys)
      =/  pathed    (pathify-space-path:spaces-chat key)
      =/  ini       (create-from-space:db [(weld pathed /initiate) key %initiate] +.cs bowl)
      =.  cs        [(weld -.cs -.ini) +.ini]
      =/  mem       (create-from-space:db [pathed key %member] +.cs bowl)
      =.  cs        [(weld -.cs -.mem) +.mem]
      =/  adm       (create-from-space:db [(weld pathed /admin) key %admin] +.cs bowl)
      =.  cs        [(weld -.cs -.adm) +.adm]
      =/  owr       (create-from-space:db [(weld pathed /owner) key %owner] +.cs bowl)
      $(index +(index), cs [(weld -.cs -.owr) +.owr])
  ++  on-save   !>(state)
  ++  on-load
    |=  old-state=vase
    ^-  (quip card _this)
    =/  old  !<(versioned-state old-state)
    :: do a quick check to make sure we are subbed to /updates in %spaces
    =/  cards
      ?:  (~(has by wex.bowl) [/spaces our.bowl %spaces])
        ~
      [%pass /spaces %agent [our.bowl %spaces] %watch /updates]~
    [cards this(state old)]
  ::
  ++  on-poke
    |=  [=mark =vase]
    ^-  (quip card _this)
    ?>  ?=(%db-action mark)
    =/  act  !<(action vase)
    =^  cards  state
    ?-  -.act  :: each handler function here should return [(list card) state]
      %create-path
        (create-path:db +.act state bowl)
      %create-from-space
        (create-from-space:db +.act state bowl)
      %remove-path
        (remove-path:db +.act state bowl)
      %add-peer
        (add-peer:db +.act state bowl)
      %kick-peer
        (kick-peer:db +.act state bowl)

      %get-path
        (get-path:db +.act state bowl)
      %delete-path
        (delete-path:db +.act state bowl)

      %create
        (create:db +.act state bowl)
      %edit
        (edit:db +.act state bowl)
      %remove
        (remove:db +.act state bowl)
    ==
    [cards this]
  ::
  :: endpoints for clients to keep in sync with our ship
  :: /db
  :: /path/[path]
  :: endpoints for other ships to keep in sync with us
  :: /next/@da/[path]
  ++  on-watch
    |=  =path
    ^-  (quip card _this)
    =/  cards=(list card)
    ::  each path should map to a list of cards
    ?+  path      !!
      ::
        [%db ~]  :: the "everything" path
          ?>  =(our.bowl src.bowl)
          ~  :: we are not "priming" this subscription with anything, since the client can just scry if they need. the sub is for receiving new updates
      :: /path/the/actual/path/
        [%path *]  :: the "path" path, subscribe by path explicitly
          ?>  =(our.bowl src.bowl)
          =/  thepathrow    (~(got by paths.state) t.path)
          =/  peerslist     (~(got by peers.state) t.path)
          =/  thechange
           :: TODO also dump all the rows here
            db-changes+!>([[%add-path thepathrow] (turn peerslist |=(p=peer [%add-peer p]))])
          :~  [%give %fact ~ thechange]
          ==
      :: /next/@da/the/actual/path/
        [%next @ *]  :: the "next" path, for other ships to get the next update on a particular path
          ?<  =(our.bowl src.bowl)  :: this path should only be used by NOT us
          =/  t=@da  (slav %da i.t.path)
          =/  thepathrow    (~(got by paths.state) t.t.path)
          :: if the @da they passed was behind, %give them the current version, and %kick them
          ?:  (gth updated-at.thepathrow t)
            ~&  >>>  "{<src.bowl>} tried to sub on old @da {<t>}, %kicking them"
            =/  thepeers    (~(got by peers.state) t.t.path)
            =/  tbls        (tables-by-path:db tables.state t.t.path)
            =/  dels=(list [@da db-del-change])
              %+  skim
                ~(tap by del-log.state)
              |=  [k=@da v=db-del-change]
              ^-  ?
              ?-  -.v
                %del-row   =(path.v t.t.path)
                %del-peer  =(path.v t.t.path)
                %del-path  =(path.v t.t.path)
              ==
            :~  [%give %fact ~ db-path+!>([thepathrow thepeers tbls schemas.state dels])]
                [%give %kick [path ~] `src.bowl]
            ==
          :: else, don't give them anything. we will give+kick when a new version happens
          ::=/  thepathrow   (~(get by paths-table.state) t.t.path)
          :::~  [%give %fact ~ chat-path-row+!>(thepathrow)]
          ::==
          ~&  >  "{(scow %p src.bowl)} subbed to {(spud path)}"
          ~
      :: /vent/~zod/~2000.1.1
        [%vent @ @ ~] :: poke response comes on this path
          =/  src=ship  (slav %p i.t.path)
          ?>  =(src src.bowl)
          ~
    ==
    [cards this]
  ::
  :: endpoints for clients syncing with their own ship
  :: /x/db.json
  :: /x/db/path/[path].json
  :: /x/db/start-ms/[unix ms].json
  ++  on-peek
    |=  =path
    ^-  (unit (unit cage))
    ?+    path  !!
    ::
      [%x %db ~]
        ``db-state+!>(state)
    ::
    :: full information about a given path
      [%x %db %path *]
        =/  thepath  t.t.t.path
        =/  thepathrow  (~(got by paths.state) thepath)
        =/  thepeers    (~(got by peers.state) thepath)
        =/  tbls        (tables-by-path:db tables.state thepath)
        =/  dels=(list [@da db-del-change])
          %+  skim
            ~(tap by del-log.state)
          |=  [k=@da v=db-del-change]
          ^-  ?
          ?-  -.v
            %del-row   =(path.v thepath)
            %del-peer  =(path.v thepath)
            %del-path  =(path.v thepath)
          ==
        ``db-path+!>([thepathrow thepeers tbls schemas.state dels])
    ::
    :: host of a given path
      [%x %host %path *]
        =/  thepath  t.t.t.path
        =/  thepathrow  (~(got by paths.state) thepath)
        ``ship+!>(host.thepathrow)
    ::
    :: /x/db/start-ms/[unix ms].json
    :: all tables, but only with received-at after <time>
      [%x %db %start-ms @ ~]
        =/  timestamp=@da   (di:dejs:format n+i.t.t.t.path)
        ``db-state+!>((after-time:db state timestamp))
    ==
  ::
  ++  on-agent
    |=  [=wire =sign:agent:gall]
    ^-  (quip card _this)
    ?+    wire  ~&(wire ~&(sign !!))
      [%remote-scry %callback ~]
        ~&  "remote-scry/callback on-agent"
        ~&  sign
        `this
      [%dbpoke ~]
        ?+    -.sign  `this
          %poke-ack
            ?~  p.sign  `this
            ~&  >>>  "%db: {<(spat wire)>} dbpoke failed"
            ~&  >>>  p.sign
            `this
        ==
      [%spaces ~]
        ?+    -.sign  !!
          %watch-ack
            ?~  p.sign  %-  (slog leaf+"{<dap.bowl>}: subscribed to spaces" ~)  `this
            ~&  >>>  "{<dap.bowl>}: spaces subscription failed"
            `this
          %kick
            ~&  >  "{<dap.bowl>}: spaces kicked us, resubscribing..."
            :_  this
            :~  [%pass /spaces %agent [our.bowl %spaces] %watch /updates]
            ==
          %fact
            ?+    p.cage.sign   !!
              %spaces-reaction
                =^  cards  state
                  (spaces-reaction:db !<(=reaction:sstore q.cage.sign) state bowl)
                [cards this]
              ::
              %visa-reaction
                =^  cards  state
                  (visas-reaction:db !<(=reaction:vstore q.cage.sign) state bowl)
                [cards this]
            ==
        ==
      [%next *]
        ?-    -.sign
          %poke-ack
            ?~  p.sign  `this
            ~&  >>>  "%db: {<(spat wire)>} /next/[path] failed"
            ~&  >>>  p.sign
            `this
          %watch-ack
            ?~  p.sign  `this
            ~&  >>>  "{<dap.bowl>}: /next/[path] subscription failed"
            `this
          %kick
            =/  pathrow    (~(get by paths.state) +.wire)
            ?:  =(~ pathrow)
              ~&  >>>  "got a %kick on {(spud +.wire)} that we are ignoring because that path is not in our state"
              `this
            =/  newpath  (weld /next/(scot %da updated-at:(need pathrow)) path:(need pathrow))
            ~&  >  "{<dap.bowl>}: /next/[path] kicked us, resubbing {(spud newpath)}"
            :_  this
            :~
              [%pass wire %agent [src.bowl %db] %watch newpath]
            ==
          %fact
            :: handle the update by updating our local state and
            :: pushing db-changes out to our subscribers
            =^  cards  state
            ^-  (quip card state-0)
            =/  dbpath=path         +.wire
            =/  factmark  -.+.sign
            ~&  >>  "%fact on {(spud wire)}: {<factmark>}"
            ?+  factmark
              :: default case:
                ~&  >>>  "UNHANDLED FACT type"
                ~&  >>>  +.sign
                `state
              %db-changes
                =/  changes=db-changes  !<(db-changes +.+.sign)
                =/  remote-scries   *(list card)
                =/  index=@ud           0
                |-
                  ?:  =(index (lent changes))
                    :_  state
                    :: echo the changes out to our client subs
                    %+  weld
                      remote-scries
                    [%give %fact [/db (weld /path dbpath) ~] db-changes+!>(changes)]~
                  =/  change   (snag index changes)
                  =/  new-scry=(list card)
                    ?+  -.change  ~
                      %add-row
                        ?.  ?=(%relay type.row.ch)  ~
                        ?>  ?=(%relay -.data.row.ch)
                        :~  [
                          %pass
                          /remote-scry/callback
                          %arvo
                          %a
                          %keen
                          ship.id.row.ch
                          /g/x/(scot %ud revision.data.row.ch)/(scot %tas dap.bowl)//(scot %p ship.id.data.row.ch)/(scot %da t.id.data.row.ch)
                        ]
                        ==
                    ==
                  $(index +(index), state (process-db-change:db dbpath change state bowl), remote-scries (weld remote-scries new-scry))
              %db-path
                =/  full=fullpath  !<(fullpath +.+.sign)
                :: insert pathrow
                =.  received-at.path-row.full  now.bowl
                =.  paths.state     (~(put by paths.state) dbpath path-row.full)
                :: insert peers
                =.  peers.full
                  %+  turn
                    peers.full
                  |=  p=peer
                  =.  received-at.p  now.bowl
                  p
                =.  peers.state     (~(put by peers.state) dbpath peers.full)
                :: update schemas
                =.  schemas.state   (~(gas by schemas.state) ~(tap by schemas.full))
                :: update del-log
                =.  del-log.state   (~(gas by del-log.state) dels.full)
                :: update tables
                =/  keys=(list type:common)   ~(tap in ~(key by tables.full))
                =/  index=@ud       0
                |-
                  ?:  =(index (lent keys))
                    :_  state
                    :: echo the changes out to our client subs
                    [%give %fact [/db (weld /path dbpath) ~] db-path+!>(full)]~
                  =/  key         (snag index keys)
                  =/  maybe-pt    (~(get by tables.state) key)
                  =.  tables.state
                    ?~  maybe-pt
                      (~(put by tables.state) key (malt [dbpath (~(got by tables.full) key)]~))
                    =/  pt  (~(put by (need maybe-pt)) dbpath (~(got by tables.full) key))
                    (~(put by tables.state) key pt)
                  $(index +(index))
            ==
            [cards this]
        ==
      [%path @ *]
        ?-    -.sign
          %poke-ack
            ?~  p.sign  `this
            ~&  >>>  "%realm-chat: {<(spat wire)>} dbpoke failed"
            ~&  >>>  p.sign
            `this
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
            `this
        ==
    ==
  ::
  ++  on-leave
    |=  =path
    ^-  (quip card _this)
    ~&  "Unsubscribe by: {<src.bowl>} on: {<path>}"
    `this
  ::
  ++  on-arvo
    |=  [=wire =sign-arvo]
    ^-  (quip card _this)
    ?+  wire  !!
      [%timer ~]
        ~&  >>>  "unhandled on-arvo %timer"
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
--
