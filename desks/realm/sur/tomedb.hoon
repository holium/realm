|%
+$  space         @tas     :: space name.  if no space this is 'our'
+$  app           @tas     :: app name (reduce namespace collisions).  if no app this is 'all'
+$  bucket        @tas     :: bucket name (with its own permissions).  if no bucket this is 'def'
+$  key           @t
+$  value         @t
:: +$  json-value    [%s @t]  :: value (JSON encoded as a string).  Store with %s so we aren't constantly adding it to requests.
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
+$  perm     [read=perm-level write=perm-level admin=perm-level]
::
::  **************************************
::  replicate kv-store as top level object for retrieving diffs
++  kv-sort
  |=  [a=kv-key b=kv-key]
  ^-  ?
  (gth timestamp.a timestamp.b)
::
++  kvon     ((on kv-key value) kv-sort)
::
+$  kv-key    [timestamp=@da ship=@t =space =app =bucket =key]
+$  realm-kv  ((mop kv-key value) kv-sort)
::
::  **************************************
::
+$  kv-meta   (map key [created-by=ship updated-at=@da]) :: timestamp of last update
+$  kv-data   (map key value)
+$  store     (map bucket [=perm invites=invited meta=kv-meta data=kv-data])
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
      :: [%get value=?(~ json-value)]
      [%all data=kv-data]
      [%perm write=?(%yes %no) admin=?(%yes %no)]
  ==
::
--

