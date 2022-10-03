/-  store=groups, member-store=membership, *resource, mtd=metadata-store
=<  [store .]
=,  store
|%
::  TODO break this out into seperate gates
++  our-groups
  |=  [our=ship now=@da]
  ^-  (list group-space)
  =/  group-paths     .^((set resource) %gy /(scot %p our)/group-store/(scot %da now)/groups)
  ::  now find ours
  :: =/  hosted           (skim ~(tap by group-paths) skim-groups)
  =/  hosted=(list resource)
  %+  skim  ~(tap by group-paths)
    |=  [resource=[entity=ship name=@tas]]
    ?:  =(entity.resource our)
      (skim-group-dms resource)    ::  removes group dms from group-paths
    %.n
  ::  get metadata for each
  =/  our-groups=(list group-space)
  %+  turn  hosted
    |=  [rid=[entity=ship name=@tas]]
    =/  grp-data      .^((unit group) %gx /(scot %p our)/group-store/(scot %da now)/groups/ship/(scot %p entity.rid)/(scot %tas name.rid)/noun)
    :: ~&  >>  [grp-data]
    =/  mt-data=(unit association:mtd)
      .^  (unit association:mtd)
        %gx  (scot %p our)  %metadata-store  (scot %da now)
        %metadata  %groups  (snoc `path`~[%ship (scot %p entity.rid) (scot %tas name.rid)] %noun) 
      ==
    ::  Get group data
    =/  member-count=@u
      ?~  grp-data  0   
      ~(wyt in `(set @)`members.-.+.grp-data)
    ::  Get metadata
    =/  title=@t
      ?~  mt-data  ''
      title.metadatum.+.+.mt-data
    =/  picture=@t
      ?~  mt-data  ''
      picture.metadatum.+.+.mt-data
    =/  color=@ux
      ?~  mt-data  `@ux`(scan "0" hex:ag)
      color.metadatum.+.+.mt-data
    [entity.rid name.rid title picture color member-count]
  our-groups
  ::
++  skim-group-dms
  |=  [resource=[entity=ship name=@tas]]
  =/  name      (cord name.resource)
  =/  name-da   (slaw %da name)
  ?~  name-da   %.y   %.n
::
++  get-members
  |=  [rid=[entity=ship name=@tas] our=ship now=@da]
  =/  grp-data      .^((unit group) %gx /(scot %p our)/group-store/(scot %da now)/groups/ship/(scot %p entity.rid)/(scot %tas name.rid)/noun)
  grp-data
  
::
::  JSON
::
++  enjs
  =,  enjs:format
  |%
  ++  view :: encodes for on-peek
    |=  vi=view:store
    ^-  json
    %-  pairs
    :_  ~
    ^-  [cord json]
    :-  -.vi
    ?-  -.vi
      :: ::
        %group
      (group:encode group.vi)
      ::
        %groups
      (groups:encode groups.vi)
    ==
  --
::
++  encode
  =,  enjs:format
  |%
  ++  groups
    |=  grps=(list group-space)
    ^-  json
    %-  pairs
    %+  turn  grps
      |=  grp=group-space
      =/  path  (spat /(scot %p creator.grp)/(scot %tas name.grp))
      [path (group grp)]
  ::
  ++  group
    |=  grp=group-space
    ^-  json
    %-  pairs
    :~  ['creator' s+(scot %p creator.grp)]
        ['path' s+(spat /(scot %p creator.grp)/(scot %tas name.grp))]
        ['name' s+title.grp]
        ['picture' s+picture.grp]
        ['color' s+(scot %ux color.grp)]
        ['memberCount' n+(scot %u member-count.grp)]
    ==
  ::
  --
--