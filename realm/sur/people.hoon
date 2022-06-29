::  @author:  ~lodlev-migdev
::  people: feature definitions used by the people agent. the people agent
::    syncs with %contact-store while also providing additional support
::    for Realm integration.
::
/-  contact-store
|%
::  $role - user roles which drive Realm permissioning
::
+$  role  ?(%owner %admin %member %initiate)
::  $metaspace - selective aspects of a broader space used for
::    efficiency purposes
+$  metaspace
  $:  =ship
      =role
  ==
+$  person  [rank=@t]
+$  me
  $:  spaces=(map @t (list metaspace))
      people=(map @t person)
      contacts=(map ship contact:contact-store)
  ==
--