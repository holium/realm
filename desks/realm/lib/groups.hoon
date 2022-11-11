/-  store=groups, member-store=membership, *resource, mtd=metadata-store, g=new-groups
=<  [store .]
=,  store
|%
::  TODO break this out into seperate gates
++  our-groups
  |=  [our=ship now=@da]
  ^-  (list group-space)
  =/  groups  .^(groups:g %gx /(scot %p our)/groups/(scot %da now)/groups/groups)
  ::  find ours
  =/  hosted
    ^-  (list [f=flag:g g=group:g])
    %+  skim  ~(tap by groups)
      |=  [f=flag:g g=group:g]
      =(our -.f)
  ::  get metadata for each
  %+  turn  hosted
    |=  [=flag:g =group:g]
    ^-  group-space
    =/  metadata  meta.group
    ::  Get group data
    =/  member-count=@u
      (lent ~(tap by fleet.group))
    ::  Get metadata
    =/  title=@t  title.metadata
    =/  picture=@t  image.metadata
    =/  color=@ux  *@ux::cover.metadata
    [our +.flag title picture color member-count]
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
++  get-groups-2-members
  |=  [rid=[entity=ship name=@tas] our=ship now=@da]
  ^-  group:store
  =/  grp-data      .^((unit group) %gx /(scot %p our)/group-store/(scot %da now)/groups/ship/(scot %p entity.rid)/(scot %tas name.rid)/noun)
  =/  groups  .^(groups:g %gy /(scot %p our)/groups/(scot %da now)/groups)
  =/  group  (~(got by groups) rid)
::  :*  members=fleet
::      tags  :: +$  tags  (jug tag ship)
::      policy :: +$  policy [%invite diff]
::      hidden :: +$  ?
::  ==
  *group:store
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
