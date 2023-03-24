|%
+$  space         @tas              :: space name.  if no space this is 'our'
+$  app           @tas              :: app name (reduce namespace collisions).  if no app this is 'all'
+$  bucket        @tas              :: bucket name (with its own permissions).  if no bucket this is 'def'
+$  key           @t                :: key name
+$  value         @t                :: value in kv store
+$  json-value    [%s value]        :: value (JSON encoded as a string).  Store with %s so we aren't constantly adding it to requests.
+$  ships         (set ship)
+$  invited       (map ship invite-level)
::
+$  perm-level
  $%  %our
      %space
      %open
      %unset
      %yes
      %no
  ==
::
+$  invite-level
  $%  %read
      %write
      %admin
      %block
  ==
::
+$  meta
  $:  created-by=ship
      updated-by=ship
      created-at=time
      updated-at=time
  ==
::
+$  perm     [read=perm-level write=perm-level admin=perm-level]
::
+$  kv-data  (map key json-value)
+$  kv-meta  (map key meta)
+$  store    (map bucket [=perm invites=invited meta=kv-meta data=kv-data])
::
+$  tome-data  [=store]
::
::  Actions and updates
::
+$  tomedb-action
  $%  [%init-tome ship=@t =space =app]
      [%init-kv ship=@t =space =app =bucket =perm]
  ==
::
+$  tomedb-kv-action
    :: can be sent by any ship
  $%  [%set-value ship=@t =space =app =bucket =key =value]
      [%remove-value ship=@t =space =app =bucket =key]
      [%clear-kv ship=@t =space =app =bucket]
      [%verify-kv ship=@t =space =app =bucket]
  :: must not be Tome owner (these are proxies for watching a foreign Tome)
      [%watch-kv ship=@t =space =app =bucket]
      [%team-kv ship=@t =space =app =bucket]
  :: must be Tome owner (manage permissions and invites)
      [%perm-kv ship=@t =space =app =bucket =perm]
      [%invite-kv ship=@t =space =app =bucket guy=@t level=invite-level]
  ==
::
+$  tomedb-kv-reaction
  $%  [%set =key =value]
      [%remove =key]
      [%clear ~]
    ::
      [%get value=?(~ json-value)]
      [%all data=kv-data]
      [%perm write=?(%yes %no) admin=?(%yes %no)]
  ==
::
--

