::  db [realm]:
::  TODO:
::  - permissioning via paths-table settings
::  - constraints via paths-table settings
::  - pub/sub for data table changes
::  - laggard pub/sub logic for dumping the "whole" path when someone
::    requests an "old" version on their sub to /next/[path]
::  - %general type inference to json out for scries ?HOW HOON BLACK MAGIC?
/-  *db, common
|%
::
:: helpers
::
++  has-create-permissions
  |=  [=path-row =row state=state-0 =bowl:gall]
  ^-  ?
  (has-ced-permissions %create path-row row state bowl)
::
++  has-edit-permissions
  |=  [=path-row =row state=state-0 =bowl:gall]
  ^-  ?
  (has-ced-permissions %edit path-row row state bowl)
::
++  has-delete-permissions
  |=  [=path-row =row state=state-0 =bowl:gall]
  ^-  ?
  (has-ced-permissions %delete path-row row state bowl)
::
++  has-ced-permissions
  |=  [ced=?(%create %edit %delete) =path-row =row state=state-0 =bowl:gall]
  ^-  ?
  ::  src.bowl must be in the peers list
  =/  possiblepeers=(list peer)   (skim (~(got by peers.state) path.path-row) |=(=peer =(ship.peer src.bowl)))
  ?:  =((lent possiblepeers) 0)   %.n
  =/  srcpeer=peer                (snag 0 possiblepeers)

  :: find relevant access-rules for this type.row
  =/  tbl-acs  (~(get by table-access.path-row) type.row)
  ::  if type.row is in table-access.path-row, check that
  ::  else check the default-access rule
  =/  rules=access-rules
    ?~  tbl-acs
      default-access.path-row
    (need tbl-acs)
  
  =/  u-role-rule   (~(get by rules) role.srcpeer)
  =/  role-rule=access-rule
    ?~  u-role-rule
      (~(got by rules) %$)  :: fall back to wildcard role
    (need u-role-rule)

  ?-  ced
    %create
      create.role-rule
    %edit
      (check-permission-scope edit.role-rule row src.bowl)
    %delete
      (check-permission-scope delete.role-rule row src.bowl)
  ==
::
++  check-permission-scope
  |=  [s=permission-scope =row =ship]
  ^-  ?
  ?-  s
    %table  %.y
    %none   %.n
    %own    =(ship.id.row ship)
  ==
::
++  peers-to-ship-roles
  |=  peers=(list peer)
  ^-  ship-roles
  %+  turn
    peers
  |=(p=peer [ship.p role.p])
::
++  get-path-card
  |=  [=ship =path-row peers=ship-roles]
  ^-  card
  [%pass /dbpoke %agent [ship %db] %poke %db-action !>([%get-path path-row peers])]
::
++  delete-path-card
  |=  [=ship =path]
  ^-  card
  [%pass /dbpoke %agent [ship %db] %poke %db-action !>([%delete-path path])]
::
++  del-path-in-tables
  |=  [state=state-0 =path]
  ^-  tables
  =/  keys    ~(tap in ~(key by tables.state))
  =/  index  0
  |-
    ?:  =(index (lent keys))
      tables.state
    =/  typekey    (snag index keys)
    =/  pt         (~(del by (~(got by tables.state) typekey)) path)
    $(index +(index), tables.state (~(put by tables.state) typekey pt))
::
++  process-db-change
:: takes a db-change object (that we presumably got as a %fact on a
:: subscription) and mutates state appropriately
  |=  [=path ch=db-change state=state-0 =bowl:gall]
  ^-  state-0
  :: ensure the path exists
  =/  tmp         (~(get by paths.state) path)
  ?:  =(~ tmp)    state
  =/  path-row    (need tmp)
  :: ensure this came from the host
  ?.  =(src.bowl host.path-row)   state

  =.  received-at.path-row        now.bowl

  ?-  -.ch
    %add-row
      =.  updated-at.path-row   updated-at.row.ch
      =.  paths.state           (~(put by paths.state) path path-row)
      =.  received-at.row.ch    now.bowl
      (add-row-to-db row.ch schema.ch state)
    %upd-row
      =.  updated-at.path-row   updated-at.row.ch
      =.  paths.state           (~(put by paths.state) path path-row)
      =.  received-at.row.ch    now.bowl
      =/  sch=schema            (~(got by schemas.state) [type.row.ch v.row.ch]) :: currently just ensuring that we have the schema already
      (add-row-to-db row.ch sch state)
    %del-row
      =.  updated-at.path-row   t.ch
      =.  paths.state           (~(put by paths.state) path.ch path-row)
      =/  pt              (~(got by tables.state) type.ch)
      =/  tbl             (~(got by pt) path.ch)
      =.  tbl             (~(del by tbl) id.ch)                :: delete by id
      =.  pt              (~(put by pt) path.ch tbl)           :: update the pathed-table
      =.  tables.state    (~(put by tables.state) type.ch pt)  :: update the tables.state
      =.  del-log.state   (~(put by del-log.state) now.bowl ch)  :: record the fact that we deleted
      state
    %add-path   !!  :: don't bother handling this because it should never come on the sub-wire... it goes through %get-path
    %upd-path
      =.  updated-at.path-row   updated-at.path-row.ch
      =.  paths.state           (~(put by paths.state) path path-row)
      state
    %del-path   !!  :: don't bother handling, because it goes over %delete-path poke
    %add-peer
      =.  updated-at.path-row   updated-at.peer.ch
      =.  paths.state           (~(put by paths.state) path path-row)
      =.  received-at.peer.ch   now.bowl
      =/  newlist               [peer.ch (~(got by peers.state) path)]
      =.  peers.state           (~(put by peers.state) path newlist)
      state
    %upd-peer
      =.  updated-at.path-row   updated-at.peer.ch
      =.  paths.state           (~(put by paths.state) path path-row)
      =.  received-at.peer.ch   now.bowl
      =/  oldlist               (~(got by peers.state) path)
      =/  newlist               [peer.ch (skip oldlist |=(=peer =(ship.peer ship.peer.ch)))]
      =.  peers.state           (~(put by peers.state) path newlist)
      state
    %del-peer     :: WARNING does not handle the "self" case. when we are being removed from a list, the host will send a %delete-path poke
      =.  updated-at.path-row   t.ch
      =.  paths.state           (~(put by paths.state) path path-row)
      =/  oldlist               (~(got by peers.state) path)
      =/  newlist               (skip oldlist |=(=peer =(ship.peer ship.ch)))
      =.  peers.state           (~(put by peers.state) path newlist)
      state
  ==
::
++  add-row-to-db
::  handles the nested tables accessing logic and schema validation
  |=  [=row =schema state=state-0]
  ^-  state-0
  :: schema stuff
  =/  schv  [type.row v.row]
  ?> :: ensure there is not a conflict between table and the schema we are gonna validate
    ?:  (~(has by schemas.state) schv)
      =((~(got by schemas.state) schv) schema)
    %.y
  :: validate the row against schema
  ?>  
    ?:  =(%general -.data.row)
      =((lent schema) (lent +.data.row))  :: TODO make a stronger schema-check by comparing path/map/set/list etc for each item in the data-list
    %.y :: other types are auto-validated
  =.  schemas.state   (~(put by schemas.state) schv schema)

  =.  tables.state
    ?:  (~(has by tables.state) type.row)
      =/  ptbl    (~(got by tables.state) type.row)
      ?:  (~(has by ptbl) path.row)
        :: type + path already exist so just update them
        =/  tbl     (~(got by ptbl) path.row)
        =.  tbl     (~(put by tbl) id.row row)
        =.  ptbl    (~(put by ptbl) path.row tbl)
        (~(put by tables.state) type.row ptbl)
      :: new path in existing type-tbl
      =/  tbl     (~(put by *table) id.row row)
      =.  ptbl    (~(put by ptbl) path.row tbl)
      (~(put by tables.state) type.row ptbl)
    :: new type, initialize both type and path
    =/  tbl     (~(put by *table) id.row row)
    =/  ptbl    (~(put by *pathed-table) path.row tbl)
    (~(put by tables.state) type.row ptbl)

  state
::
++  tables-by-path
  |=  [=tables =path]
  ^-  (map type:common table)
  =/  result      *(map type:common table)
  =/  index=@ud   0
  =/  types=(list type:common)   ~(tap in ~(key by tables))
  |-
    ?:  =(index (lent types))
      result
    =/  current-type    (snag index types)
    =/  pt   (~(got by tables) current-type)
    =/  tbl  (~(get by pt) path)
    ?~  tbl
      $(index +(index))
    $(index +(index), result (~(put by result) current-type (need tbl)))
::
::
:: pokes
::   tests:
::db &db-action [%create-path [/example ~zod %host ~ ~ ~ *@da *@da *@da] ~[[~zod %host] [~bus %member]]]
::db &db-action [%add-peer /example ~fed %member]
::db &db-action [%create [/example [our now] %foo 0 [%general ~[1 'a']] *@da *@da *@da] [~ ~[['num' 'ud'] ['str' 't']]]]
::db &db-action [%create [/example [our now] %foo 0 [%general ~[1 'b']] *@da *@da *@da] ~]
::db &db-action [%edit /example [our ~2023.5.22..20.15.47..86fe] %foo 0 [%general ~[2 'b']] *@da *@da *@da]
::db &db-action [%remove %foo /example [our ~2023.5.22..20.15.47..86fe]]
::db &db-action [%create [/example [our now] %foo 0 [%general ~[1 'c']] *@da *@da *@da] ~]
::
++  create-path
::db &db-action [%create-path [/example ~zod %host ~ ~ ~ *@da *@da *@da] ~[[~zod %host] [~bus %member]]]
  |=  [[=path-row peers=ship-roles] state=state-0 =bowl:gall]
  ^-  (quip card state-0)
  :: ensure the path doesn't already exist
  =/  pre-existing    (~(get by paths.state) path.path-row)
  ?>  =(~ pre-existing)
  :: ensure this came from our ship
  ?>  =(our.bowl src.bowl)

  :: local state updates
  :: create the path-row
  =.  host.path-row         our.bowl
  =.  created-at.path-row   now.bowl
  =.  updated-at.path-row   now.bowl
  =.  received-at.path-row  now.bowl
  =.  default-access.path-row
    ?~  default-access.path-row
      default-access-rules
    default-access.path-row
  =.  paths.state     (~(put by paths.state) path.path-row path-row)
  :: create the peers list
  =.  peers :: ensure [our.bowl %host] is in the peers list
    ?~  (find [[our.bowl %host]]~ peers)
      [[our.bowl %host] peers]
    peers
  =/  peerslist
    %+  turn
      peers
    |=  [s=@p =role]
    ^-  peer
    [
      path.path-row
      s
      ?:(=(s our.bowl) %host role)  :: our is always the %host
      now.bowl
      now.bowl
      now.bowl
    ]
  =.  peers.state     (~(put by peers.state) path.path-row peerslist)

  ::  alert the peers that they have been added
  =/  peer-pokes=(list card)
    %+  turn
      (skip peerslist |=(p=peer =(ship.p our.bowl))) :: skip ourselves though, since that poke will just fail
    |=  =peer
    ^-  card
    (get-path-card ship.peer path-row peers)
  :: emit the change to subscribers
  =/  thechange  db-changes+!>([[%add-path path-row] (turn peerslist |=(p=peer [%add-peer p]))])
  =/  subscription-facts=(list card)  :~
    [%give %fact [/db (weld /path path.path-row) ~] thechange]
  ==

  =/  cards  (weld peer-pokes subscription-facts)
  [cards state]
::
++  create-from-space
  |=  [[=path space-path=path =role] state=state-0 =bowl:gall]
  ^-  (quip card state-0)
  =/  cards  ~
  [cards state]
::
++  remove-path
::db &db-action [%remove-path /example]
  |=  [=path state=state-0 =bowl:gall]
  ^-  (quip card state-0)
  :: ensure the path actually exists
  =/  path-row=path-row    (~(got by paths.state) path)
  :: and that we are the %host of it
  ?>  =(host.path-row our.bowl)
  :: ensure this came from our ship
  ?>  =(our.bowl src.bowl)

  :: alert peers of the removal
  =/  del-pokes=(list card)
    %+  turn
      (skip (~(got by peers.state) path) |=(p=peer =(ship.p our.bowl))) :: skip ourselves though, since that poke will just fail
    |=  =peer
    ^-  card
    (delete-path-card ship.peer path)

  :: emit the change to subscribers
  =/  sub-facts=(list card)
    [%give %fact [/db (weld /path path) ~] db-changes+!>([%del-path path]~)]~
  =/  cards=(list card)  (weld del-pokes sub-facts)

  :: remove from paths table, and peers table
  =.  paths.state  (~(del by paths.state) path)
  =.  peers.state  (~(del by peers.state) path)
  :: remove from data tables
  =.  tables.state  (del-path-in-tables state path)

  :: add to del-log
  =.  del-log.state   (~(put by del-log.state) now.bowl [%del-path path])

  [cards state]
::
++  add-peer
::db &db-action [%add-peer /example ~fed %member]
  |=  [[=path =ship =role] state=state-0 =bowl:gall]
  ^-  (quip card state-0)
  :: ensure the path actually exists
  =/  path-row=path-row    (~(got by paths.state) path)
  :: and that we are the %host of it
  ?>  =(host.path-row our.bowl)
  :: ensure this came from our ship
  ?>  =(our.bowl src.bowl)

  =/  path-sub-wire           (weld /next/(scot %da updated-at.path-row) path)
  =/  newpeer=peer  [path ship role now.bowl now.bowl now.bowl]

  :: local state updates
  :: update paths table
  =.  updated-at.path-row     now.bowl
  =.  received-at.path-row    now.bowl
  =.  paths.state             (~(put by paths.state) path path-row)
  :: update peers table
  =/  newlist=(list peer)     [newpeer (~(got by peers.state) path)]
  =.  peers.state             (~(put by peers.state) path newlist)

  :: emit the change to subscribers
  =/  cards=(list card)  :~
    :: poke `ship` with %get path
    (get-path-card ship path-row (peers-to-ship-roles (~(got by peers.state) path)))
    :: tell subs about the new peer
    [%give %fact [/db (weld /path path) path-sub-wire ~] db-changes+!>([%add-peer newpeer]~)]
    :: kick subs to force them to re-sub for next update
    [%give %kick [path-sub-wire ~] ~]
  ==
  ~&  >  "publishing to {(spud path-sub-wire)} (and also kicking)"

  [cards state]
::
++  kick-peer
::db &db-action [%kick-peer /example ~fed]
  |=  [[=path =ship] state=state-0 =bowl:gall]
  ^-  (quip card state-0)
  :: ensure the path actually exists
  =/  path-row=path-row    (~(got by paths.state) path)
  :: and that we are the %host of it
  ?>  =(host.path-row our.bowl)
  :: ensure this came from our ship
  ?>  =(our.bowl src.bowl)

  :: emit the change to subscribers
  =/  path-sub-wire           (weld /next/(scot %da updated-at.path-row) path)
  =/  cards=(list card)  :~
    :: poke %delete-path to the ship we are kicking
    [%pass /dbpoke %agent [ship %db] %poke %db-action !>([%delete-path path])]
    :: tell subs that we deleted `ship`
    [%give %fact [/db (weld /path path) path-sub-wire ~] db-changes+!>([%del-peer path ship now.bowl]~)]
    :: kick subs to force them to re-sub for next update
    [%give %kick [path-sub-wire ~] ~]
  ==
  ~&  >  "poking %delete-path to {(scow %p ship)}"
  ~&  >  "publishing to {(spud path-sub-wire)} (and also kicking those subs)"

  :: local state updates
  :: update paths table
  =.  updated-at.path-row     now.bowl
  =.  received-at.path-row    now.bowl
  =.  paths.state             (~(put by paths.state) path path-row)
  :: update peers table
  =/  newlist=(list peer)     (skip (~(got by peers.state) path) |=(=peer =(ship.peer ship)))
  =.  peers.state             (~(put by peers.state) path newlist)

  [cards state]
::
++  get-path
  |=  [[=path-row peers=ship-roles] state=state-0 =bowl:gall]
  ^-  (quip card state-0)
  :: ensure the path doesn't already exist
  =/  pre-existing    (~(get by paths.state) path.path-row)
  ?>  =(~ pre-existing)
  :: ensure this came from a foreign ship
  ?<  =(src.bowl our.bowl)

  :: local state updates
  :: create the path-row
  =.  host.path-row         src.bowl
  =.  received-at.path-row  now.bowl
  =.  paths.state     (~(put by paths.state) path.path-row path-row)
  :: create the peers list
  =.  peers :: ensure [src.bowl %host] is in the peers list
    ?~  (find [[src.bowl %host]]~ peers)
      [[src.bowl %host] peers]
    peers
  =/  peerslist
    %+  turn
      peers
    |=  [s=@p =role]
    ^-  peer
    [
      path.path-row
      s
      ?:(=(s src.bowl) %host role)  :: src is always the %host
      created-at.path-row
      updated-at.path-row
      now.bowl
    ]
  =.  peers.state     (~(put by peers.state) path.path-row peerslist)

  :: emit the change to subscribers
  =/  sub-facts=(list card)
    [%give %fact [/db (weld /path path.path-row) ~] db-changes+!>([%add-path path-row]~)]~
  :: subscribe to src.bowl on /next/updated-at.path-row/[path] for data-changes in this path
  =/  subs  :~
    [
      %pass
      (weld /next path.path-row)
      %agent
      [src.bowl %db]
      %watch
      (weld /next/(scot %da updated-at.path-row) path.path-row)
    ]
  ==
  ~&  >  "subbing to"
  ~&  >  subs
  =/  cards=(list card)  (weld subs sub-facts)
  [cards state]
::
++  delete-path
  |=  [=path state=state-0 =bowl:gall]
  ^-  (quip card state-0)
  :: ensure the path actually exists
  =/  path-row=path-row    (~(got by paths.state) path)
  :: ensure this came from host ship
  ?>  =(host.path-row src.bowl)

  ~&  >  "we either got kicked or the host deleted the whole path: {(spud path)}"

  :: remove from paths table, and peers table
  =.  paths.state  (~(del by paths.state) path)
  =.  peers.state  (~(del by peers.state) path)
  :: remove from data tables
  =.  tables.state  (del-path-in-tables state path)

  :: add to del-log (implies that the other stuff is also deleted)
  =.  del-log.state   (~(put by del-log.state) now.bowl [%del-path path])

  :: emit the change to subscribers
  =/  cards=(list card)
    [%give %fact [/db (weld /path path) ~] db-changes+!>([%del-path path]~)]~
  [cards state]
::
++  create
::db &db-action [%create [/example [our now] %foo 0 [%general ~[1 'a']] *@da *@da *@da] [~ ~[['num' 'ud'] ['str' 't']]]]
::db &db-action [%create [/example [our now] %foo 0 [%general ~[1 'b']] *@da *@da *@da] ~]
::db &db-action [%create [/example [our now] %foo 1 [%general ~[1 'a' now]] *@da *@da *@da] [~ ~[['num' 'ud'] ['str' 't'] ['custom-time' 'da']]]]
::db &db-action [%create [/example [our now] %foo 1 [%general ~[2 'b' now]] *@da *@da *@da] ~]
::db &db-action [%create [/example [our now] %foo 2 [%general ~[1 'd' (jam /hello/goodbye)]] *@da *@da *@da] [~ ~[['num' 'ud'] ['str' 't'] ['mypath' 'path']]]]
::~zod:db &db-action [%create [/example [our now] %vote 0 [%vote [%.y our %foo [~zod now] /example]] *@da *@da *@da] [~ ~]]
  |=  [[=row uschema=(unit schema)] state=state-0 =bowl:gall]
  ^-  (quip card state-0)
  :: ensure the path actually exists
  =/  path-row=path-row    (~(got by paths.state) path.row)
  ?.  (has-create-permissions path-row row state bowl)
    ~&  >>>  "{(scow %p src.bowl)} tried to create a %{(scow %tas type.row)} row where they didn't have permissions"
    `state
  :: schema checking
  =/  sch=schema
    ?~  uschema
      (~(got by schemas.state) [type.row v.row])
    (need uschema)

  :: update path
  =/  path-sub-wire           (weld /next/(scot %da updated-at.path-row) path.row)
  =.  updated-at.path-row     now.bowl
  =.  received-at.path-row    now.bowl
  =.  paths.state             (~(put by paths.state) path.row path-row)

  :: cleanup input
  =.  id.row            [src.bowl now.bowl] :: overwrite whatever id the client asked for, we create that ourselves
  =.  created-at.row    now.bowl
  =.  updated-at.row    now.bowl
  =.  received-at.row   now.bowl

  =.  state             (add-row-to-db row sch state)

  :: emit the change to subscribers
  =/  cards=(list card)  :~
    :: tell subs about the new row
    [%give %fact [/db (weld /path path.row) path-sub-wire ~] db-changes+!>([%add-row row sch]~)]
    :: kick subs to force them to re-sub for next update
    [%give %kick [path-sub-wire ~] ~]
  ==
  ~&  >  "publishing new row to {(spud path-sub-wire)} (and also kicking)"

  [cards state]
::
++  edit
::db &db-action [%edit /example [our ~2023.5.22..17.21.47..9d73] %foo 0 [%general ~[2 'b']] *@da *@da *@da]
  |=  [=row state=state-0 =bowl:gall]
  ^-  (quip card state-0)
  :: permissions
  =/  old-row              (~(got by (~(got by (~(got by tables.state) type.row)) path.row)) id.row) :: old row must first exist
  =/  path-row=path-row    (~(got by paths.state) path.row)
  ?.  (has-edit-permissions path-row old-row state bowl)
    ~&  >>>  "{(scow %p src.bowl)} tried to edit a %{(scow %tas type.row)} row where they didn't have permissions"
    `state

  :: schema checking
  =/  sch=schema            (~(got by schemas.state) [type.row v.row]) :: currently just ensuring that we have the schema already
  :: TODO check that new version doesn't violate constraints

  :: update path
  =/  path-sub-wire           (weld /next/(scot %da updated-at.path-row) path.row)
  =.  updated-at.path-row     now.bowl
  =.  received-at.path-row    now.bowl
  =.  paths.state             (~(put by paths.state) path.row path-row)

  :: cleanup input
  =.  updated-at.row    now.bowl
  =.  received-at.row   now.bowl

  =.  state             (add-row-to-db row sch state)

  :: emit the change to subscribers
  =/  cards=(list card)  :~
    :: tell subs about the new row
    [%give %fact [/db (weld /path path.row) path-sub-wire ~] db-changes+!>([%upd-row row]~)]
    :: kick subs to force them to re-sub for next update
    [%give %kick [path-sub-wire ~] ~]
  ==
  ~&  >  "publishing edited row to {(spud path-sub-wire)} and kicking everyone there"

  [cards state]
::
++  remove
::db &db-action [%remove %foo /example [our ~2023.5.22..19.22.29..d0f7]]
  |=  [[=type:common =path =id:common] state=state-0 =bowl:gall]
  ^-  (quip card state-0)
  :: permissions
  =/  pt                  (~(got by tables.state) type)
  =/  tbl                 (~(got by pt) path)
  =/  old-row             (~(got by tbl) id) :: old row must first exist
  =/  path-row=path-row   (~(got by paths.state) path)
  ?.  (has-delete-permissions path-row old-row state bowl)
    ~&  >>>  "{(scow %p src.bowl)} tried to delete a %{(scow %tas type)} row where they didn't have permissions"
    `state

  :: update path
  =/  foreign-ship-sub-wire   (weld /next/(scot %da updated-at.path-row) path)
  =.  updated-at.path-row     now.bowl
  =.  received-at.path-row    now.bowl
  =.  paths.state             (~(put by paths.state) path path-row)

  :: do the delete
  =.  tbl             (~(del by tbl) id)                :: delete by id
  =.  pt              (~(put by pt) path tbl)           :: update the pathed-table
  =.  tables.state    (~(put by tables.state) type pt)  :: update the tables.state
  =/  log=db-row-del-change    [%del-row path type id now.bowl]
  =.  del-log.state   (~(put by del-log.state) now.bowl log)  :: record the fact that we deleted

  :: emit the change to subscribers
  =/  cards=(list card)  :~
    :: tell subs about the new row
    [%give %fact [/db (weld /path path) foreign-ship-sub-wire ~] db-changes+!>(~[log])]
    :: kick foreign ship subs to force them to re-sub for next update
    [%give %kick [foreign-ship-sub-wire ~] ~]
  ==
  ~&  >  "publishing %del-row type: {<type>} id: {<id>} to {(spud foreign-ship-sub-wire)} + kicking those subs"

  [cards state]
::
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
      :~  [%add-peer add-peer]
          [%kick-peer kick-peer]
          [%create create]
      ==
    ::
    ++  add-peer
      %-  ot
      :~  [%path pa]
          [%ship de-ship]
          [%role (se %tas)]
      ==
    ::
    ++  kick-peer
      %-  ot
      :~  [%path pa]
          [%ship de-ship]
      ==
    ::
    ++  create
      %-  ot
      :~  [%row de-row]
          [%schema ul]  :: TODO actually get the schema
      ==
    ::
    ++  de-row
      |=  jon=json
      ^-  row
      ?>  ?=([%o *] jon)
      [
        (pa (~(got by p.jon) 'path'))
        (de-id (~(got by p.jon) 'id'))
        ((se %tas) (~(got by p.jon) 'type'))
        (ni (~(got by p.jon) 'v'))
        [%general ((ar de-col) (~(got by p.jon) 'data'))]
        *@da
        *@da
        *@da
      ]
    ::
    ++  de-col
      |=  jon=json
      ^-  @
      ?>  ?=([%a *] jon)
      ?~  p.jon  !!
      =/  type-key            (so (snag 0 `(list json)`p.jon))
      =/  datatom             (snag 1 p.jon)
      ?:  =(type-key 'rd')    (ne datatom)
      ?:  =(type-key 'ud')    (ni datatom)
      ?:  =(type-key 't')     (so datatom)
      ?:  =(type-key 'path')  (jam (pa datatom))
      !!
    ::
    ++  de-id
      %+  cu
        path-to-id
      pa
    ::
    ++  path-to-id
      |=  p=path
      ^-  id:common
      [`@p`(slav %p +2:p) `@da`(slav %da +6:p)]
    ::
    ++  de-ship  (su ;~(pfix sig fed:ag))
    ::
    ++  dri   :: specify in integer milliseconds, returns a @dr
      (cu |=(t=@ud ^-(@dr (div (mul ~s1 t) 1.000))) ni)
    --
  --
::
++  enjs
  =,  enjs:format
  |%
    ++  state
      |=  st=versioned-state
      ^-  json
      %-  pairs
      :~  ['state-version' (numb `@`-.st)]
          ['data-tables' (en-tables tables.st schemas.st)]
        :: ['schemas' (en-schemas X)]
        :: ['paths' (en-paths X)]
        :: ['peers' (en-peers X)]
        :: ['del-log' (en-del-log X)]
      ==
    ::
    ++  en-tables
      |=  [=tables =schemas]
      ^-  json
      :-  %a
      %+  turn
        ~(tap by tables)
      |=  [=type:common pt=pathed-table]
      (en-table type pt schemas)
    ::
    ++  en-fullpath
      |=  fp=fullpath
      ^-  json
      :: TODO actually return the data
      %-  pairs
      :~  ['path-row' ~]
          ['peers' ~]
          ['tables' ~]
          ['schemas' ~]
          ['dels' ~]
      ==
    ::
    ++  en-table
      |=  [=type:common pt=pathed-table =schemas]
      ^-  json
      =/  all-rows=(list row)
        %-  zing
        %+  turn
          ~(val by pt)
        |=  =table
        ^-  (list row)
        ~(val by table)
      %-  pairs
      :~  ['type' s+type]
          :-  'rows'
          :-  %a
          %+  turn
            all-rows
          |=  =row
          (en-row row schemas)
      ==
    ::
    ++  en-row
      |=  [=row =schemas]
      ^-  json
      =/  schema  (~(got by schemas) [type.row v.row])
      =/  basekvs=(list [@t json])
        :~  path+s+(spat path.row)
            id+(row-id-to-json id.row)
            type+s+type.row
            v+(numb v.row)
            created-at+(time created-at.row)
            updated-at+(time updated-at.row)
            received-at+(time received-at.row)
        ==
      =/  dynamickvs=(list [@t json])
        ?+  -.data.row  !!
          %general
            =/  index=@ud  0
            =/  result=(list [@t json])  ~
            |-
              ?:  =((lent cols.data.row) index)
                result
              =/  sch  (snag index schema)
              =/  d    (snag index cols.data.row)
              =/  t
:: apply the t.sch as aura to atom
                ?:  =(t.sch 'ud')  (numb `@ud`d)
                ?:  =(t.sch 'rd')  (numbrd `@rd`d)
                ?:  =(t.sch 't')   [%s `@t`d]
                ?:  =(t.sch 'da')  (time `@da`d)
                ?:  =(t.sch 'dr')  (time-dr `@dr`d)
                ?:  =(t.sch 'path')  (path ;;(^path (cue d)))
                !!
              $(index +(index), result [[name.sch t] result])
::          %vote
        ==
      =/  keyvals  (weld basekvs dynamickvs)
      (pairs keyvals)
    ++  row-id-to-json
      |=  =id:common
      ^-  json
      s+(row-id-to-cord id)
    ::
    ++  row-id-to-cord
      |=  =id:common
      ^-  cord
      (spat ~[(scot %p ship.id) (scot %da t.id)])
    ::
    ++  numbrd
      |=  a=@rd
      ^-  json
      :-  %n
      (crip (flop (snip (snip (flop (trip (scot %rd a)))))))
    ::
    ++  time-dr
      |=  a=@dr
      ^-  json
      (numb (mul (div a ~s1) 1.000))
  --
--
