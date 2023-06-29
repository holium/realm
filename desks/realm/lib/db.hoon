::  db [realm]:
::  TODO:
::  - constraints via paths-table settings
/-  *db, common, mstore=membership, sstore=spaces-store
/-  vstore=visas
/+  spaces-chat
|%
::
:: helpers
::
++  got-db
  |=  [=type:common =path =id:common state=state-0]
  ^-  row
  (~(got by (~(got by (~(got by tables.state) type)) path)) id)
::
++  get-db
  |=  [=type:common =path =id:common state=state-0]
  ^-  (unit row)
  =/  tbl   (get-tbl type path state)
  ?~  tbl   ~
  (~(get by u.tbl) id)
::
++  get-tbl
  |=  [=type:common =path state=state-0]
  ^-  (unit table)
  =/  ptbl  (~(get by tables.state) type)
  ?~  ptbl  ~
  (~(get by u.ptbl) path)
::
++  del-db
  |=  [=type:common =path =id:common state=state-0 t=@da]
  ^-  state-0
  =/  pt                  (~(got by tables.state) type)
  =/  tbl                 (~(got by pt) path)
  =/  old-row             (~(got by tbl) id) :: old row must first exist
  :: do the delete
  =.  tbl             (~(del by tbl) id)                :: delete by id
  =.  pt              (~(put by pt) path tbl)           :: update the pathed-table
  =.  tables.state    (~(put by tables.state) type pt)  :: update the tables.state
  =/  log=db-row-del-change    [%del-row path type id t]
  =.  del-log.state   (~(put by del-log.state) t log)  :: record the fact that we deleted
  state
::
++  our-matching-relays
  |=  [r=row state=state-0 =bowl:gall]
  ^-  (list row)
  =/  relays=(list row)  ~(val by (ptbl-to-tbl (~(got by tables.state) %relay)))
  %+  skim
    relays
  |=  rel=row
  ^-  ?
  ?+  -.data.rel  %.n
    %relay
      &(=(id.data.rel id.r) =(ship.id.rel our.bowl))
  ==
::
++  meets-constraints
  |=  [=path-row =row state=state-0 =bowl:gall]
  ^-  ?
  =/  tbl=(unit table)    (get-tbl type.row path.path-row state)
  ?~  tbl  %.y  :: there's nothing in this table, so any row we add is unique along all possible columns
  =/  uconst=(unit constraint)  (~(get by constraints.path-row) type.row)
  =/  const=(unit constraint)
    ?~  uconst  (~(get by default-constraints) type.row)
    uconst
  ?~  const  %.y  :: there is neither a defined-constraint nor a default-constraint, thus this "meets constraints"
  %-  ~(all in uniques.u.const)
  |=  cols=unique-columns
  ^-  ?
  =/  where=(list [column-accessor *])
    %+  turn
      ~(tap in cols)
    |=  ca=column-accessor
    :-  ca
    (snag-val-from-row ca row)
  =/  matches=(list ^row)  (find-from-where u.tbl where)
  ?~  matches  %.y
  %.n
::
++  find-from-where
  |=  [tbl=table conds=(list [i=column-accessor v=*])]
  ^-  (list row)
  %+  skim
    ~(val by tbl)
  |=  r=row
  %+  levy
    conds
  |=  cond=[i=column-accessor v=*]
  =(v.cond (snag-val-from-row i.cond r))
::
++  snag-val-from-row
  |=  [i=column-accessor r=row]
  ?@  i   (snag-by-index i +.data.r)
  ?:  =(i "ship.id")      ship.id.r
  ?:  =(i "t.id")         t.id.r
  ?:  =(i "v")            v.r
  ?:  =(i "created-at")   created-at.r
  ?:  =(i "updated-at")   updated-at.r
  ?:  =(i "received-at")  received-at.r
  !! :: unsupported name
::
++  snag-by-index
  |=  [i=@ r=*]
  |-
    ?@  r  !!
    ?:  =(0 i)  -:r
    $(r +:r, i (dec i))
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
  [%pass /dbpoke %agent [ship %bedrock] %poke %db-action !>([%get-path path-row peers])]
::
++  delete-path-card
  |=  [=ship =path]
  ^-  card
  [%pass /dbpoke %agent [ship %bedrock] %poke %db-action !>([%delete-path path])]
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
      ?:  =(sch schema.ch)
        :: the schema has not changed, so this is fine
        (add-row-to-db row.ch schema.ch state)
      ::TODO handle the schema has changed situation
      !!
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
    ?:  ?=(%general -.data.row)
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
++  flatten-tables
  |=  =tables
  ^-  (map type:common table)
  =/  types=(list type:common)  ~(tap in ~(key by tables))
  =/  result                    *(map type:common table)
  =/  index=@ud                 0
  |-
    ?:  =(index (lent types))
      result
    =/  t       (snag index types)
    =/  tbl=table  (ptbl-to-tbl (~(got by tables) t))
    $(index +(index), result (~(put by result) t tbl))
::
++  ptbl-to-tbl
  |=  ptbl=pathed-table
  ^-  table
  =/  paths   ~(tap in ~(key by ptbl))
  =/  result=table  *table
  =/  index=@ud     0
  |-
    ?:  =(index (lent paths))
      result
    =/  tbl=table  (~(got by ptbl) (snag index paths))
    $(index +(index), result (~(uni by result) tbl))
::
++  tbl-after
  |=  [tbl=table t=@da]
  ^-  table
  %-  ~(gas by *table)
  %+  skim
    ~(tap by tbl) 
  |=  [k=id:common v=row]
  ^-  ?
  (gth received-at.v t)
::
++  after-time
  |=  [st=state-0 t=@da]
  ^-  state-0
  ?:  =(0 t)  st

  =.  paths.st
    (~(gas by *paths) (skim ~(tap by paths.st) |=(kv=[=path =path-row] (gth received-at.path-row.kv t))))

  =.  del-log.st
    %-  ~(gas by *del-log)
    %+  skim
      ~(tap by del-log.st)
    |=  [dt=@da ch=db-del-change]
    (gth dt t)

  =.  peers.st
    %+  ~(put by *peers)
      /output
    %+  skim
      ^-  (list peer)
      %-  zing
      ~(val by peers.st)
    |=(=peer (gth received-at.peer t))

  =/  types=(list type:common)  ~(tap in ~(key by tables.st))
  =/  newtbls=tables            *tables
  =/  index=@ud                 0
  =.  tables.st
    |-
      ?:  =(index (lent types))
        newtbls
      =/  typ     (snag index types)
      =/  tbl     (tbl-after (ptbl-to-tbl (~(got by tables.st) typ)) t)
      $(index +(index), newtbls (~(put by newtbls) typ (~(put by *pathed-table) /output tbl)))
  st
::
++  spaces-reaction
  |=  [rct=reaction:sstore state=state-0 =bowl:gall]
  ^-  (quip card state-0)
  |^
  ?+  -.rct         `state
    %add            (on-add +.rct)
    %remove         (on-remove +.rct)
  ==
  ::
  ++  on-add
    |=  [new-space=space:sstore =members:mstore]
    ::  only host can create space path-rows
    ?.  =(our.bowl ship.path.new-space)
      `state
    %-  (slog leaf+"{<dap.bowl>}: creating paths for {<path.new-space>}" ~)
    :: create the default 4 paths
    =/  pathed    (pathify-space-path:spaces-chat path.new-space)
    =/  ini       (create-from-space [(weld pathed /initiate) path.new-space %initiate] state bowl)
    =/  mem       (create-from-space [pathed path.new-space %member] +.ini bowl)
    =/  cs        [(weld -.ini -.mem) +.mem]
    =/  adm       (create-from-space [(weld pathed /admin) path.new-space %admin] +.cs bowl)
    =.  cs        [(weld -.cs -.adm) +.adm]
    =/  owr       (create-from-space [(weld pathed /owner) path.new-space %owner] +.cs bowl)
    [(weld -.cs -.owr) +.owr]
  ::
  ++  on-remove
    |=  [path=space-path:sstore]
    ::  only host can delete space path-rows
    ?.  =(our.bowl ship.path)
      `state
    %-  (slog leaf+"{<dap.bowl>}: deleting paths for {<path>}" ~)
    =/  pathed    (pathify-space-path:spaces-chat path)
    =/  prs=(list path-row)  
      %+  skim
        ~(val by paths.state)
      |=(pr=path-row ?~(space.pr %.n =(path:(need space.pr) pathed)))

    =/  index=@ud  0
    =/  cs      [*(list card) state]
    |-
      ?:  =(index (lent prs))
        cs
      =/  pr   (snag index prs)
      =/  fakebowl  bowl
      =.  now.fakebowl   `@da`(add index now.bowl)
      =/  new  (remove-path path.pr +.cs fakebowl)
      $(index +(index), cs [(weld -.cs -.new) +.new])
    ::
  --
::
++  visas-reaction
  |=  [rct=reaction:vstore state=state-0 =bowl:gall]
  ^-  (quip card state-0)
  |^
  ?+  -.rct             `state
    %invite-accepted    (on-accepted +.rct)
    %kicked             (on-kicked +.rct)
  ==
  ::
  ++  on-accepted
    |=  [path=space-path:sstore =ship =member:mstore]
    ^-  (quip card state-0)
    ::  only host can modify peers lists
    ?.  =(our.bowl ship.path)    `state
    ::  if we are here, we are the host
    =/  max-role
      ?:  (~(has in roles.member) %owner)   %host
      ?:  (~(has in roles.member) %admin)   %admin
      ?:  (~(has in roles.member) %member)  %member
      %initiate
    ?:  =(max-role %initiate)  `state :: initiates don't get access to anything new from accepting
    =/  pathed    (pathify-space-path:spaces-chat path)
    =/  prs=(list path-row)
      %+  skim
        ~(val by paths.state)
      |=(pr=path-row ?~(space.pr %.n =(path:(need space.pr) pathed)))

    =/  index=@ud  0
    =/  cs   [*(list card) state]
    |-
      ?:  =(index (lent prs))
        cs
      =/  pr   (snag index prs)
      =/  prole  role:(need space.pr)
      ?:  ?|  =(prole %member)
              ?&  =(prole %admin)
                  |(=(max-role %host) =(max-role %admin))
              ==
              ?&  =(prole %host)
                  =(max-role %host)
              ==
          ==
        :: if they SHOULD be added, add them
        =/  new  (add-peer [path.pr ship max-role] +.cs bowl)
        $(index +(index), cs [(weld -.cs -.new) +.new])
      :: else, move on
      $(index +(index))
  ::
  ++  on-kicked
    |=  [path=space-path:sstore =ship]
    ^-  (quip card state-0)
    ::  only host can modify peers lists
    ?.  =(our.bowl ship.path)    `state
    =/  pathed    (pathify-space-path:spaces-chat path)
    :: attempt to kick from all since it doesn't hurt anything if they
    :: aren't actually in the path
    =/  pathed    (pathify-space-path:spaces-chat path)
    =/  prs=(list path-row)  
      %+  skim
        ~(val by paths.state)
      |=(pr=path-row ?~(space.pr %.n =(path:(need space.pr) pathed)))

    =/  index=@ud  0
    =/  cs      [*(list card) state]
    |-
      ?:  =(index (lent prs))
        cs
      =/  pr   (snag index prs)
      =/  new  (kick-peer [path.pr ship] +.cs bowl)
      $(index +(index), cs [(weld -.cs -.new) +.new])
  --
::
:: pokes
::   tests:
::bedrock &db-action [%create-path /example %host ~ ~ ~ ~[[~zod %host] [~bus %member]]]
::bedrock &db-action [%add-peer /example ~fed %member]
::bedrock &db-action [%create [~zod now] /example %foo 0 [%general ~[1 'a']] ~[['num' 'ud'] ['str' 't']]]
::bedrock &db-action [%create [~zod now] /example %vote 0 [%vote [%.y %foo [~zod ~2023.6.21..22.25.01..e411] /example]] ~]
:: from ~bus:
::~zod/bedrock &db-action [%create /example %foo 0 [%general ~[1 'a']]  ~[['num' 'ud'] ['str' 't']]]
::
::  in zod
::bedrock &db-action [%create-path /example %host ~ ~ ~ ~[[~zod %host] [~bus %member]]]
::bedrock &db-action [%create [~zod now] /example %foo 0 [%general ~[1 'a']] ~[['num' 'ud'] ['str' 't']]]
::  in bus
::bedrock &db-action [%create-path /target %host ~ ~ ~ ~[[~bus %host] [~fed %member]]]
::bedrock &db-action [%relay [~bus now] /target %relay 0 [%relay [~zod ~2023.6.13..15.57.34..aa97] %foo /example 0 %all %.n] ~]
::  then, in zod again
::bedrock &db-action [%edit [our ~2023.5.22..17.21.47..9d73] /example %foo 0 [%general ~[2 'b']] ~]
::bedrock &db-action [%remove %foo /example [our ~2023.5.22..19.22.29..d0f7]]
++  create-path
::bedrock &db-action [%create-path /example %host ~ ~ ~ ~[[~zod %host] [~bus %member]]]
::bedrock &db-action [%create-path /target %host ~ ~ ~ ~[[~bus %host] [~fed %member]]]
  |=  [=input-path-row state=state-0 =bowl:gall]
  ^-  (quip card state-0)
  :: ensure the path doesn't already exist
  =/  pre-existing    (~(get by paths.state) path.input-path-row)
  ?>  =(~ pre-existing)
  :: ensure this came from our ship
  ?>  =(our.bowl src.bowl)

  :: local state updates
  :: create the path-row
  =/  path-row=path-row  [
    path.input-path-row
    our.bowl
    replication.input-path-row
    default-access.input-path-row
    table-access.input-path-row
    constraints.input-path-row
    ~
    now.bowl
    now.bowl
    now.bowl
  ]
  :: overwrite with global default if path-default is not specified
  =.  default-access.path-row
    ?~  default-access.path-row
      default-access-rules
    default-access.path-row
  =.  paths.state     (~(put by paths.state) path.path-row path-row)
  :: create the peers list
  =/  peers :: ensure [our.bowl %host] is in the peers list
    ?~  (find [[our.bowl %host]]~ peers.input-path-row)
      [[our.bowl %host] peers.input-path-row]
    peers.input-path-row
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
  :: emit the change to self-subscriptions (our clients)
  =/  thechange  db-changes+!>([[%add-path path-row] (turn peerslist |=(p=peer [%add-peer p]))])
  =/  subscription-facts=(list card)  :~
    [%give %fact [/db (weld /path path.path-row) ~] thechange]
  ==

  =/  cards  (weld peer-pokes subscription-facts)
  [cards state]
::
++  create-from-space
:: note sr is the space-role that the path is being generated for, not
:: the %db role (%host vs %owner)
:: if you pass _____ as sr:
::   %owner,    only members with %owner in their roles will be part of the path, %joined or %host must be status
::   %admin,    %owner or %admin must be in roles, %joined must be status
::   %member,   %owner %admin or %member must be in roles, %joined must be status
::   %initiate, every ship in the members list, regardless of role or joined status
  |=  [[=path sp=[=ship space=cord] sr=role:mstore] state=state-0 =bowl:gall]
  ^-  (quip card state-0)
  ~&  %create-from-space
  =/  members     .^(view:mstore %gx /(scot %p our.bowl)/spaces/(scot %da now.bowl)/(scot %p ship.sp)/(scot %tas space.sp)/members/noun)
  ?>  ?=(%members -.members)
  =/  filtered-members
    %+  skim
      ~(tap by members.members)
    |=  [=ship =member:mstore]
    ^-  ?
    ?:  =(sr %initiate)  %.y
    ?&  |(=(status.member %joined) =(status.member %host))
      ?|
        (~(has in roles.member) sr)
        ?-  sr
          %initiate   %.y
          %member 
            ?|  (~(has in roles.member) %admin)
                (~(has in roles.member) %owner)
            ==
          %admin
                (~(has in roles.member) %owner)
          %owner      %.n
        ==
      ==
    ==

  =/  peers=(list peer)
    %+  turn
      filtered-members
    |=  [=ship =member:mstore]
    ^-  peer
    =/  max-role
      ?:  (~(has in roles.member) %owner)   %host
      ?:  (~(has in roles.member) %admin)   %admin
      ?:  (~(has in roles.member) %member)  %member
      %initiate
    [
      path
      ship
      ?:(=(ship our.bowl) %host max-role)  :: our is always the %host
      now.bowl
      now.bowl
      now.bowl
    ]
  =.  peers.state     (~(put by peers.state) path peers)

  :: create the path-row
  =/  path-row=path-row  [
    path
    our.bowl
    %host
    default-access-rules
    ~
    ~
    [~ [(pathify-space-path:spaces-chat sp) sr]]
    now.bowl
    now.bowl
    now.bowl
  ]
  =.  paths.state     (~(put by paths.state) path path-row)

  ::  alert the peers that they have been added
  =/  peer-pokes=(list card)
    %+  turn
      (skip peers |=(p=peer =(ship.p our.bowl))) :: skip ourselves though, since that poke will just fail
    |=  =peer
    ^-  card
    (get-path-card ship.peer path-row (turn peers |=(p=^peer [ship.p role.p])))
  :: emit the change to self-subscriptions (our clients)
  =/  thechange  db-changes+!>([[%add-path path-row] (turn peers |=(p=peer [%add-peer p]))])
  =/  subscription-facts=(list card)  :~
    [%give %fact [/db (weld /path path.path-row) ~] thechange]
  ==

  =/  cards  (weld peer-pokes subscription-facts)
  [cards state]
::
++  remove-path
::bedrock &db-action [%remove-path /example]
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
    [%give %fact [/db (weld /path path) ~] db-changes+!>([%del-path path now.bowl]~)]~
  =/  cards=(list card)  (weld del-pokes sub-facts)

  :: remove from paths table, and peers table
  =.  paths.state  (~(del by paths.state) path)
  =.  peers.state  (~(del by peers.state) path)
  :: remove from data tables
  =.  tables.state  (del-path-in-tables state path)

  :: add to del-log
  =.  del-log.state   (~(put by del-log.state) now.bowl [%del-path path now.bowl])

  [cards state]
::
++  add-peer
::bedrock &db-action [%add-peer /example ~fed %member]
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
::bedrock &db-action [%kick-peer /example ~fed]
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
    [%pass /dbpoke %agent [ship %bedrock] %poke %db-action !>([%delete-path path])]
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
  ~&  "%get-path {<path.path-row>}"
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
      [src.bowl dap.bowl]
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
  ~&  >>>  "attempting to delete {<path>}"
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
  =.  del-log.state   (~(put by del-log.state) now.bowl [%del-path path now.bowl])

  :: emit the change to subscribers
  =/  cards=(list card)
    [%give %fact [/db (weld /path path) ~] db-changes+!>([%del-path path now.bowl]~)]~
  [cards state]
::
++  create
::bedrock &db-action [%create [~zod now] /example %foo 0 [%general ~[1 'a']] ~[['num' 'ud'] ['str' 't']]]
::bedrock &db-action [%create /example %vote 0 [%vote [%.y our %foo [~zod now] /example]] ~]
::bedrock &db-action [%create /example %foo 1 [%general ~[1 'd' (jam /hello/goodbye)]] ~[['num' 'ud'] ['str' 't'] ['mypath' 'path']]]
::~zod/bedrock &db-action [%create /example %vote 0 [%vote %.y our %foo [~zod now] /example] ~]
  |=  [[=req-id =input-row] state=state-0 =bowl:gall]
  ^-  (quip card state-0)
  =/  vent-path=path  /vent/(scot %p src.req-id)/(scot %da now.req-id)
  =/  kickcard=card  [%give %kick ~[vent-path] ~]
  :: form row from input
  =/  row=row  [
    path.input-row
    [src.bowl now.bowl]
    type.input-row
    v.input-row
    data.input-row
    now.bowl
    now.bowl
    now.bowl
  ]

  :: ensure the path actually exists
  =/  path-row=path-row    (~(got by paths.state) path.row)
  ?.  (has-create-permissions path-row row state bowl)
    ~&  >>>  "{(scow %p src.bowl)} tried to create a %{(scow %tas type.row)} row where they didn't have permissions"
    [~[kickcard] state]
  :: forward the request if we aren't the host
  ?.  =(host.path-row our.bowl)
    ~&  >>  "{<src.bowl>} tried to have us ({<our.bowl>}) create a row in {<path.path-row>} where we are not the host. forwarding the poke to the host: {<host.path-row>}"
    :_  state
    [%pass /dbpoke %agent [host.path-row dap.bowl] %poke %db-action !>([%create req-id input-row])]~
  :: ensure that the row meets constraints
  ?.  (meets-constraints path-row row state bowl)
    ~&  >>>  "{(scow %p src.bowl)} tried to create a %{(scow %tas type.row)} row where they violated constraints"
    [~[kickcard] state]

  :: update path
  =/  path-sub-wire           (weld /next/(scot %da updated-at.path-row) path.row)
  =.  updated-at.path-row     now.bowl
  =.  received-at.path-row    now.bowl
  =.  paths.state             (~(put by paths.state) path.row path-row)

  =.  state             (add-row-to-db row schema.input-row state)

  :: emit the change to subscribers
  =/  cards=(list card)  :~
    :: tell subs about the new row
    [%give %fact [/db (weld /path path.row) path-sub-wire ~] db-changes+!>([%add-row row schema.input-row]~)]
    :: kick subs to force them to re-sub for next update
    [%give %kick [path-sub-wire ~] ~]
    :: give vent response
    [%give %fact ~[vent-path] db-vent+!>([%row row schema.input-row])]
    kickcard
  ==
  ~&  >  "publishing new row to {(spud path-sub-wire)} (and also kicking)"

  [cards state]
::
++  edit  :: falls back to existing db schema if schema from poke input is null
:: generally, you'd only bother passing the schema if you are changing the version of the row
::db &db-action [%edit [our ~2023.5.22..17.21.47..9d73] /example %foo 0 [%general ~[2 'b']] ~]
  |=  [[=id:common =input-row] state=state-0 =bowl:gall]
  ~&  "%bedrock agent - %edit poke"
  ^-  (quip card state-0)
  :: permissions
  =/  old-row              (~(got by (~(got by (~(got by tables.state) type.input-row)) path.input-row)) id) :: old row must first exist
  =/  path-row=path-row    (~(got by paths.state) path.input-row)
  ?.  (has-edit-permissions path-row old-row state bowl)
    ~&  >>>  "{(scow %p src.bowl)} tried to edit a %{(scow %tas type.input-row)} row where they didn't have permissions"
    `state
  :: forward the request if we aren't the host
  ?.  =(host.path-row our.bowl)
    ~&  >>  "{<src.bowl>} tried to have us ({<our.bowl>}) edit a row in {<path.path-row>} where we are not the host. forwarding the poke to the host: {<host.path-row>}"
    :_  state
    [%pass /dbpoke %agent [host.path-row dap.bowl] %poke %db-action !>([%edit id input-row])]~

  :: schema checking
  =/  sch=schema
    ?~  schema.input-row
      (~(got by schemas.state) [type.input-row v.input-row]) :: crash if they didn't pass a schema AND we don't already have one
    schema.input-row
  :: TODO check that new version doesn't violate constraints

  :: update path
  =/  path-sub-wire           (weld /next/(scot %da updated-at.path-row) path.path-row)
  =.  updated-at.path-row     now.bowl
  =.  received-at.path-row    now.bowl
  =.  paths.state             (~(put by paths.state) path.path-row path-row)

  :: cleanup input
  =/  row=row  [
    path.input-row
    id
    type.input-row
    v.input-row
    data.input-row
    created-at.old-row
    now.bowl
    now.bowl
  ]

  =.  state             (add-row-to-db row sch state)

  :: emit the change to subscribers
  =/  cards=(list card)  :~
    :: tell subs about the new row
    [%give %fact [/db (weld /path path.row) path-sub-wire ~] db-changes+!>([%upd-row row sch]~)]
    :: kick subs to force them to re-sub for next update
    [%give %kick [path-sub-wire ~] ~]
  ==
  ~&  >  "publishing edited row to {(spud path-sub-wire)} and kicking everyone there"

  [cards state]
::
++  remove
::bedrock &db-action [%remove %foo /example [our ~2023.5.22..19.22.29..d0f7]]
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
  :: forward the request if we aren't the host
  ?.  =(host.path-row our.bowl)
    ~&  >>  "{<src.bowl>} tried to have us ({<our.bowl>}) remove a row in {<path.path-row>} where we are not the host. forwarding the poke to the host: {<host.path-row>}"
    :_  state
    [%pass /dbpoke %agent [host.path-row dap.bowl] %poke %db-action !>([%remove type path id])]~

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
  :: TODO remove remote-scry paths for the row

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
++  relay
  :: supposed to be used by the sharer, poking their own ship,
  :: regardless of if they are the host of either original or target path
::bedrock &db-action [%relay [~bus now] /target %relay 0 [%relay [~zod ~2023.6.13..15.57.34..aa97] %foo /example 0 %all %.n] ~]
  |=  [[=req-id =input-row] state=state-0 =bowl:gall]
  ^-  (quip card state-0)
  ~&  %relay
  :: first check that the input is actually a %relay
  ?+  -.data.input-row   !!
    %relay 
  :: then force to %all for protocol for now
  =.  protocol.data.input-row    %all
  :: then check that we actually have the thing being relayed
  =/  obj-id=id:common  id.data.input-row
  =/  obj=row  (got-db type.data.input-row path.data.input-row obj-id state)
  :: and its schema
  =/  sch=schema  (~(got by schemas.state) [type.obj v.obj])
  :: then check if we have already relayed this thing before
  =/  prev=(list row)  (our-matching-relays obj state bowl)

  ?~  prev
    :: if we have not previously relayed this thing, publish to remote-scry
    =/  cards  [%pass /remote-scry/callback %grow /(scot %p ship.obj-id)/(scot %da t.obj-id) row-and-schema+[obj sch]]~
    =.  revision.data.input-row  0 :: force to 0 because we are publishing for first time
    =/  qcs=(quip card state-0)  (create [req-id input-row] state bowl)
    [(weld cards -.qcs) +.qcs]
  :: else, the thing is already published, so use the pre-existing revision number
  =/  first-prev=row             (snag 0 `(list row)`prev)
  ?+  -.data.first-prev  !!
      %relay
    =.  revision.data.input-row  revision.data.first-prev
    (create [req-id input-row] state bowl)
  ==
  ==
::
::  on-init selfpoke
++  create-initial-spaces-paths
  |=  [state=state-0 =bowl:gall]
  ^-  (quip card state-0)
  =/  spaces-scry   .^(view:sstore %gx /(scot %p our.bowl)/spaces/(scot %da now.bowl)/all/noun)
  ?>  ?=(%spaces -.spaces-scry)

  =/  index=@ud     0
  =/  keys=(list space-path:sstore)  :: list of space-path we own
    %+  skim
      ~(tap in ~(key by spaces.spaces-scry))
    |=(=space-path:sstore =(ship.space-path our.bowl))

  =/  cs=(quip card state-0)  [~ state]
  |-
    ?:  =(index (lent keys))
      [-.cs +.cs]
    =/  key       (snag index keys)
    =/  pathed    (pathify-space-path:spaces-chat key)
    =/  preexisting=(unit path-row)    (~(get by paths.state) pathed)
    :: if the "main" space path-row already is there, then skip them all
    ?~  preexisting
      ?:  =(space.key 'our')
        =/  mem       (create-from-space [pathed key %member] +.cs bowl)
        $(index +(index), cs [(weld -.cs -.mem) +.mem])
      =/  ini       (create-from-space [(weld pathed /initiate) key %initiate] +.cs bowl)
      =.  cs        [(weld -.cs -.ini) +.ini]
      =/  mem       (create-from-space [pathed key %member] +.cs bowl)
      =.  cs        [(weld -.cs -.mem) +.mem]
      =/  adm       (create-from-space [(weld pathed /admin) key %admin] +.cs bowl)
      =.  cs        [(weld -.cs -.adm) +.adm]
      =/  owr       (create-from-space [(weld pathed /owner) key %owner] +.cs bowl)
      $(index +(index), cs [(weld -.cs -.owr) +.owr])
    $(index +(index))
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
          [%create-path create-path]
          [%create-from-space de-create-from-space]
          [%remove-path pa]
          [%create de-create-input-row]
          [%edit (ot ~[[%id de-id] [%input-row de-input-row]])]
          [%remove remove]
          [%relay de-create-input-row]
      ==
    ::
    ++  de-create-input-row
      |=  jon=json
      ^-  [req-id input-row]
      ?>  ?=([%o *] jon)
      =/  request-id=(unit json)  (~(get by p.jon) 'request-id')
      ?~  request-id
        [[~zod ~2000.1.1] (de-input-row jon)]  :: if the poke-sender didn't care enough to pass a request id, just use a fake one
      [(de-id u.request-id) (de-input-row jon)]
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
    ++  remove
      %-  ot
      :~  [%type (se %tas)]
          [%path pa]
          [%id de-id]
      ==
    ::
    ++  de-create-from-space
      %-  ot
      :~  [%path pa]
          [%space-path de-space-path]
          [%space-role de-space-role]
      ==
    ::
    ++  create-path
      |=  jon=json
      ^-  input-path-row
      ?>  ?=([%o *] jon)
      =/  urep    (~(get by p.jon) 'replication')
      =/  replication=replication
        ?~  urep
          %host
        (de-replication (need urep))
      =/  udef    (~(get by p.jon) 'default-access')
      =/  default-access 
        ?~  udef
          ~
        (de-access-rules (need udef))
      =/  utbl    (~(get by p.jon) 'table-access')
      =/  table-access 
        ?~  utbl
          ~
        (de-table-access (need utbl))
      [
        (pa (~(got by p.jon) 'path'))
        replication
        default-access
        table-access
        ~ :: TODO parse json constraints
        ((ar (ot ~[[%ship de-ship] [%role (se %tas)]])) (~(got by p.jon) 'peers'))
      ]
    ::
    ++  de-table-access
      |=  jon=json
      ^-  table-access
      ?>  ?=([%o *] jon)
      =/  type-keys  ~(tap in ~(key by p.jon))
      =/  kvs
        %+  turn
          type-keys
        |=  k=@t
        ^-  [k=type:common v=access-rules]
        [`@tas`k (de-access-rules (~(got by p.jon) k))]
      (~(gas by *table-access) kvs)
    ::
    ++  de-access-rules
      |=  jon=json
      ^-  access-rules
      ?>  ?=([%o *] jon)
      =/  role-keys  ~(tap in ~(key by p.jon))
      =/  kvs
        %+  turn
          role-keys
        |=  k=@t
        ^-  [k=role v=access-rule]
        [`@tas`k (de-access-rule (~(got by p.jon) k))]
      (~(gas by *access-rules) kvs)
    ::
    ++  de-access-rule
      %-  ot
      :~  [%create bo]
          [%edit de-permission-scope]
          [%delete de-permission-scope]
      ==
    ::
    ++  de-replication
      %+  cu
        tas-to-replication
      (se %tas)
    ::
    ++  tas-to-replication
      |=  t=@tas
      ^-  replication
      ?+  t  !!
        %shared-host  %shared-host
        %host         %host
        %gossip       %gossip
      ==
    ::
    ++  de-permission-scope
      %+  cu
        tas-to-permission-scope
      (se %tas)
    ::
    ++  tas-to-permission-scope
      |=  t=@tas
      ^-  permission-scope
      ?+  t  !!
        %table  %table
        %own    %own
        %none   %none
      ==
    ::
    ++  de-input-row
      |=  jon=json
      ^-  input-row
      ?>  ?=([%o *] jon)
      =/  data-type   ((se %tas) (~(got by p.jon) 'type'))
      =/  schema=schema     ((ar (at ~[so so])) (~(got by p.jon) 'schema'))
      =/  actual-data
        ?+  data-type
            [%general ((de-cols schema) (~(got by p.jon) 'data'))]
          %vote
            [%vote (de-vote (~(got by p.jon) 'data'))]
          %comment
            [%comment (de-comment (~(got by p.jon) 'data'))]
          %relay
            [%relay (de-relay (~(got by p.jon) 'data'))]
        ==
      [
        (pa (~(got by p.jon) 'path'))
        data-type
        (ni (~(got by p.jon) 'v'))
        actual-data
        schema
      ]
    ::
    ++  de-cols
      |=  sch=schema
      |=  jon=json
      ^-  (list @)
      ?>  ?=([%a *] jon)
      =/  index=@ud   0
      =/  result      *(list @)
      |-
        ?:  =(index (lent p.jon))
          result
        =/  type-key            t:(snag index sch)
        =/  datatom             (snag index `(list json)`p.jon)
        =/  next=@
          ?:  =(type-key 'rd')    (ne datatom)
          ?:  =(type-key 'ud')    (ni datatom)
          ?:  =(type-key 'da')    (di datatom)
          ?:  =(type-key 'dr')    (dri datatom)
          ?:  =(type-key 't')     (so datatom)
          ?:  =(type-key 'f')     (bo datatom)
          ?:  =(type-key 'p')     ((se %p) datatom)
          ?:  =(type-key 'id')    (jam (de-id datatom))
          ?:  =(type-key 'unit')  (jam (so:dejs-soft:format datatom))
          ?:  =(type-key 'path')  (jam (pa datatom))
          ?:  =(type-key 'list')  (jam ((ar so) datatom))
          ?:  =(type-key 'set')   (jam ((as so) datatom))
          ?:  =(type-key 'map')   (jam ((om so) datatom))
          !!
        $(index +(index), result (snoc result next))
    ::
    ++  de-vote
      %-  ot
      :~  [%up bo]
          [%parent-type (se %tas)]
          [%parent-id de-id]
          [%parent-path pa]
      ==
    ::
    ++  de-comment
      %-  ot
      :~  [%txt so]
          [%parent-type (se %tas)]
          [%parent-id de-id]
          [%parent-path pa]
      ==
    ::
    ++  de-relay
      %-  ot
      :~  [%id de-id]
          [%type (se %tas)]
          [%path pa]
          [%revision ni]
          [%protocol de-relay-protocol]
          [%deleted bo]
      ==
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
    ++  de-space-path
      %+  cu
        path-to-space-path
      pa
    ::
    ++  path-to-space-path
      |=  p=path
      ^-  [=ship space=cord]
      [`@p`(slav %p +2:p) `@t`(slav %tas +6:p)]
    ::
    ++  de-relay-protocol
      %+  cu
        tas-to-relay-protocol
      (se %tas)
    ::
    ++  tas-to-relay-protocol
      |=  t=@tas
      ^-  relay-protocol:common
      ?+  t  !!
        %static   %static
        %edit     %edit
        %all      %all
      ==
    ::
    ++  de-space-role
      %+  cu
        tas-to-space-role
      (se %tas)
    ::
    ++  tas-to-space-role
      |=  t=@tas
      ^-  role:mstore
      ?+  t  !!
        %initiate   %initiate
        %member     %member
        %admin      %admin
        %owner      %owner
      ==
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
    ++  en-vent
      |=  =vent
      ^-  json
      ?-  -.vent
        %ack   s/%ack
        %row   (en-row row.vent (~(put by *schemas) [type.row.vent v.row.vent] schema.vent))
      ==
    ::
    ++  en-db-changes
      |=  chs=db-changes
      ^-  json
      :-  %a
      %+  turn
        chs
      |=  ch=db-change
      ^-  json
      %-  pairs
      ^-  (list [@t json])
      %+  weld
        ^-  (list [@t json])
        ~[['change' [%s -.ch]]]
      ^-  (list [@t json])
      ?-  -.ch
        %add-row
          ~[['row' (en-row row.ch (~(put by *schemas) [type.row.ch v.row.ch] schema.ch))]]
        %upd-row
          ~[['row' (en-row row.ch (~(put by *schemas) [type.row.ch v.row.ch] schema.ch))]]
        %del-row
          :~  ['path' s+(spat path.ch)]
              ['type' s+type.ch]
              ['id' (row-id-to-json id.ch)]
              ['timestamp' (time t.ch)]
           ==
        %add-peer
          ~[['peer' (en-peer peer.ch)]]
        %upd-peer
          ~[['peer' (en-peer peer.ch)]]
        %del-peer
          :~  ['path' s+(spat path.ch)]
              ['ship' s+(scot %p ship.ch)]
              ['timestamp' (time t.ch)]
           ==
        %add-path
          ~[['path' (en-path-row path-row.ch)]]
        %upd-path
          ~[['path' (en-path-row path-row.ch)]]
        %del-path
          :~  ['path' s+(spat path.ch)]
              ['timestamp' (time t.ch)]
           ==
      ==
    ::
    ++  state
      |=  st=versioned-state
      ^-  json
      %-  pairs
      :~  ['state-version' (numb `@`-.st)]
          ['data-tables' (en-tables tables.st schemas.st)]
          ['schemas' (en-schemas schemas.st)]
          ['paths' (en-paths paths.st)]
          ['peers' (en-peers peers.st)]
          ['del-log' (en-del-log del-log.st)]
      ==
    ::
    ++  en-del-log
      |=  =del-log
      ^-  json
      :-  %a
      (turn ~(tap by del-log) en-del-change)
    ::
    ++  en-del-change
      |=  [t=@da ch=db-del-change]
      ^-  json
      =/  default=(list [@t json])
        :~  ['timestamp' (time t)]
            ['change' [%s -.ch]]
        ==
      %-  pairs
      %+  weld
        default
      ^-  (list [@t json])
      ?-  -.ch
        %del-path
          ~[['path' s+(spat path.ch)]]
        %del-peer
          ~[['path' s+(spat path.ch)] ['ship' s+(scot %p ship.ch)]]
        %del-row
          :~  ['path' s+(spat path.ch)]
              ['type' s+type.ch]
              ['id' (row-id-to-json id.ch)]
          == 
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
    ++  en-fullpath-tables
      |=  [tables=(map type:common table) =schemas]
      ^-  json
      :-  %a
      %+  turn
        ~(tap by tables)
      |=  [=type:common =table]
      =/  rows=(list row)  ~(val by table)
      %-  pairs
      :~  ['type' s+type]
          ['rows' a+(turn rows |=(=row (en-row row schemas)))]
      ==
    ::
    ++  en-fullpath
      |=  fp=fullpath
      ^-  json
      %-  pairs
      :~  ['path-row' (en-path-row path-row.fp)]
          ['peers' a+(turn peers.fp en-peer)]
          ['tables' (en-fullpath-tables [tables schemas]:fp)]
          ['schemas' (en-schemas schemas.fp)]
          ['dels' a+(turn dels.fp en-del-change)]
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
            creator+s+(scot %p ship.id.row)
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
                ?:  =(t.sch 'p')   s+(scot %p `@p`d)
                ?:  =(t.sch 'f')   [%b ?:(=(d 0) %.y %.n)] :: @f is ? is flag is loobean is %.y/%.n 0 is true
                ?:  =(t.sch 'da')  (time `@da`d)
                ?:  =(t.sch 'dr')  (time-dr `@dr`d)
                ?:  =(t.sch 'id')    (row-id-to-json ;;(id:common (cue d)))
                ?:  =(t.sch 'unit')  ?~(;;((unit @t) (cue d)) ~ s+(need ;;((unit @t) (cue d))))
                ?:  =(t.sch 'path')  (path ;;(^path (cue d)))
                ?:  =(t.sch 'list')  [%a (turn ;;((list @t) (cue d)) |=(i=@t s+i))]
                ?:  =(t.sch 'set')   [%a (turn ~(tap in ;;((set @t) (cue d))) |=(i=@t s+i))]
                ?:  =(t.sch 'map')   [%o (~(run by ;;((map @t @t) (cue d))) |=(i=@t s+i))]
                !!
              $(index +(index), result [[name.sch t] result])
          %vote
            :~  ['up' b+up.data.row]
                ['parent-type' s+(scot %tas parent-type.data.row)]
                ['parent-id' (row-id-to-json parent-id.data.row)]
                ['parent-path' s+(spat parent-path.data.row)]
            ==
          %comment
            :~  ['txt' s+txt.data.row]
                ['parent-type' s+(scot %tas parent-type.data.row)]
                ['parent-id' (row-id-to-json parent-id.data.row)]
                ['parent-path' s+(spat parent-path.data.row)]
            ==
          %relay
            :~  ['id' (row-id-to-json id.data.row)]
                ['type' s+(scot %tas type.data.row)]
                ['path' s+(spat path.data.row)]
                ['revision' (numb revision.data.row)]
            ==
        ==
      =/  keyvals
        :_  basekvs
        data+(pairs dynamickvs)
      (pairs keyvals)
    ::
    ++  en-path-row
      |=  =path-row
      ^-  json
      %-  pairs
      :~  ['path' (path path.path-row)]
          ['host' s+(scot %p host.path-row)]
          ['replication' s+(scot %tas replication.path-row)]
          ['default-access' (en-access-rules default-access.path-row)]
          ['table-access' (en-table-access table-access.path-row)]
          ['constraints' ~]  :: TODO actually do json conversion for constraints
          ['created-at' (time created-at.path-row)]
          ['updated-at' (time updated-at.path-row)]
          ['received-at' (time received-at.path-row)]
      ==
    ::
    ++  en-table-access
      |=  =table-access
      ^-  json
      :-  %o
      `(map @t json)`(~(run by table-access) en-access-rules)
    ::
    ++  en-access-rules
      |=  =access-rules
      ^-  json
      :-  %o
      `(map @t json)`(~(run by access-rules) en-access-rule)
    ::
    ++  en-access-rule
      |=  =access-rule
      ^-  json
      %-  pairs
      :~  ['create' b+create.access-rule]
          ['edit' s+edit.access-rule]
          ['delete' s+delete.access-rule]
      ==
    ::
    ++  en-peer
      |=  =peer
      ^-  json
      %-  pairs
      :~  ['path' (path path.peer)]
          ['ship' s+(scot %p ship.peer)]
          ['role' s+(scot %tas role.peer)]
          ['created-at' (time created-at.peer)]
          ['updated-at' (time updated-at.peer)]
          ['received-at' (time received-at.peer)]
      ==
    ::
    ++  en-paths
      |=  =paths
      ^-  json
      :-  %a
      (turn ~(val by paths) en-path-row)
    ::
    ++  en-peers
      |=  =peers
      ^-  json
      :-  %a
      (turn `(list peer)`(zing ~(val by peers)) en-peer)
    ::
    ++  en-schemas
      |=  =schemas
      ^-  json
      :-  %a
      (turn ~(tap by schemas) en-schema-kv)
    ::
    ++  en-schema-kv
      |=  [k=[=type:common v=@ud] v=schema]
      ^-  json
      %-  pairs
      :~  ['type' s+type.k]
          ['version' (numb v.k)]
          ['schema' a+(turn v |=(col=[name=@t t=@t] (pairs ~[['name' s+name.col] ['type' s+t.col]])))]
      ==
    ::
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
    ::
  --
--