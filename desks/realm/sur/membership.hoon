|%
::
+$  role            ?(%initiate %member %admin %owner)
+$  roles           (set role)
+$  status          ?(%invited %joined %host)
+$  member
  $:  =roles
      =status
      :: pinned=?
  ==
+$  members         (map ship member)
+$  membership      (map [ship=ship space=cord] members)
::
--