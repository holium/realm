/-  common, membership
|%
+$  card  card:agent:gall
+$  versioned-state
  $%  state-0
  ==
+$  state-0
  $:  %0
      =tables
      =schemas
      =paths
      =peers
      =del-log
  ==

+$  schemas   (map [=type:common v=@ud] schema)
+$  schema    (list [name=@t t=@t])  :: list of [column-name type-code]
:: allowable @t codes are:
::  @t @ud etc (any atom code)
::  id    (for a id:common type of [=ship t=@da], useful for referencing other rows from within your custom-type
::  unit  (for a (unit @t) only)
::  path
::  list  (for a list of @t)
::  set   (for a set of @t)
::  map   (for a map of @t to @t)

+$  tables    (map type:common pathed-table)
:: this inner layer of indirection allows us some efficiencies in
:: accessing all data on a path as opposed to doing full table scans
+$  pathed-table   (map path table)
+$  table     (map id:common row)
+$  role      ?(%host %$ @tas)  :: %$ is "everyone else" wild-card role
+$  row
  $:  =path             :: application-specific logic about what this row is attached to (ie /space/space-path/app/app-name/thing)
                        :: is used to push data out to peers list for that path
      =id:common
      =type:common      :: MUST always be same as table type
      v=@ud             :: data-type version
      data=columns      :: the actual content
      created-at=@da    :: when the source-ship originally created the row
      updated-at=@da    :: when the source-ship originally last updated the row
      received-at=@da   :: when this ship actually got the latest version of the row, regardless of when the row was originally created
  ==
+$  columns
  $%  [%general cols=(list @)]
      [%vote vote:common]
      [%rating rating:common]
      [%comment comment:common]
      [%tag tag:common]
      [%link link:common]
      [%follow follow:common]
      [%relay relay:common]
  ==

+$  paths     (map path path-row)
+$  path-row
  $:  =path
      host=ship
      =replication
      default-access=access-rules   :: for everything not found in the table-access
      =table-access                 :: allows a path to specify role-based access rules on a per-table basis
      =constraints
      space=(unit [=path =role:membership])  :: if the path-row is created from a space, record the info
      created-at=@da
      updated-at=@da
      received-at=@da
  ==
+$  replication   ?(%host %gossip %shared-host)  :: for now only %host is supported
+$  table-access  (map type:common access-rules)
+$  access-rules  (map role access-rule)
+$  access-rule   [create=? edit=permission-scope delete=permission-scope]
+$  permission-scope  ?(%table %own %none)
:: by default the host can CED everything and everyone else can CED the objects they created
++  default-access-rules  (~(gas by *access-rules) ~[[%host [%.y %table %table]] [%$ [%.y %own %own]]])
+$  constraints   (set constraint)
+$  constraint    [=type:common =uniques =check]
+$  uniques       (set unique-columns)  :: the various uniqueness rules that must all be true
+$  unique-columns  (set @t)  :: names of columns that taken together must be unique in the table+path
+$  check         ~  :: I want check to be the mold for a gate that takes in a row and produces %.y or %.n, which will allow applications to specify arbitrary check functions to constrain their data
:: used for dumping the current state of every row on a given path
+$  fullpath
  $:  =path-row
      peers=(list peer)
      tables=(map type:common table)
      =schemas
      dels=(list [@da db-del-change])
  ==

+$  peers  (map path (list peer))
:: when we create an object, we must specify who our peers are for the /path
+$  peer
  $:  =path           :: same as path.row
      =ship
      =role           :: %host or any other custom role
      created-at=@da
      updated-at=@da
      received-at=@da
  ==

+$  db-row-del-change    [%del-row =path =type:common =id:common t=@da]
+$  db-peer-del-change   [%del-peer =path =ship t=@da]
+$  db-path-del-change   [%del-path =path t=@da]
+$  db-del-change
  $%  db-row-del-change
      db-peer-del-change
      db-path-del-change
  ==
+$  db-change
  $%  [%add-row =row =schema]
      [%upd-row =row =schema]
      db-row-del-change
      [%add-path =path-row]
      [%upd-path =path-row]
      db-path-del-change
      [%add-peer =peer]
      [%upd-peer =peer]
      db-peer-del-change
  ==
+$  db-changes    (list db-change)
+$  del-log  (map @da db-del-change)

:: the model is, each row belongs to a %host ship, and to a
:: /path. The %host serves as the "source of truth" for all data on that
:: path. So when a peer wants to edit some row, it just sends the edit
:: to the host application agent, which checks the peers list in this
:: agent for the correct role, and then propagates it out to every other
:: ship in the peers list.
+$  action
  $%
      :: only from our.bowl
      [%create-path =input-path-row]       :: create a new peers list, sends %get-path to all peers
      [%create-from-space =path space-path=[=ship space=cord] sr=role:membership]  :: create a new peers list based on space members, automatically keeps peers list in sync, sends %get-path to all peers
      [%remove-path =path]                    :: remove a peers list and all attached objects in tables, sends %delete-path to all peers
      [%add-peer =path =ship =role]           :: add a peer to an existing peers list, sends %get-path to that peer
      [%kick-peer =path =ship]                :: remove a peer from an existing peers list, sends %delete-path to that peer
      :: only from host foreign ship
      [%get-path =path-row peers=ship-roles]  :: when we are being informed that we were added to a peers list. we don't know the list, only the host (which is who sent it to us)
      [%delete-path =path]                    :: when we are being informed that we got kicked (or host deleted the path entirely). also deletes all attached objects

      :: any peer in the path can send these pokes to the %host
      :: if they have right permissions, host will propagate the data
      [%create =input-row]          :: sends %add-row to all subs
      [%edit =id:common =input-row] :: sends %upd-row to all subs
      [%remove =type:common =path =id:common]      :: %host deleting the row, sends %delete to all peers
  ==
::
+$  ship-roles  (list [s=@p =role])
+$  input-path-row
  $:  =path
      =replication
      default-access=access-rules
      =table-access
      =constraints
      peers=ship-roles
  ==
+$  input-row
  $:  =path
      =type:common
      v=@ud
      data=columns
      =schema
  ==
--
