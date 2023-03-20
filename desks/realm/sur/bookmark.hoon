/-  *membership, spaces-path
|%
::
+$  space-path  path:spaces-path
+$  url  cord
::
+$  bookmarks  (map url permissions)
+$  our-bookmarks  bookmarks
+$  space-bookmarks  (map space-path bookmarks)
::
+$  permissions
  $:  view=(set role)
      edit=(set role)
      delete=(set role)
  ==
::
+$  settings
  $:  setting=(unit cord)  :: tbd
  ==
::
+$  action
  $%  [%add-bookmark =url =permissions]
      [%remove-bookmark =url]
      [%set-settings ~]
  ==
::
--
