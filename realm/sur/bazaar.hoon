/-  spaces, docket
|%
::
+$  glob  (map path mime)
::
+$  url   cord
::  $glob-location: How to retrieve a glob
::
+$  glob-reference
  [hash=@uvH location=glob-location]
::
+$  glob-location
  $%  [%http =url]
      [%ames =ship]
  ==
::
::  $href: Where a tile links to
::
+$  href
  $%  [%glob base=term =glob-reference]
      [%site =path]
  ==

::
+$  native-app
  $:  desk=@tas
      title=@t
      info=@t
      color=@ux
      image=cord
      =href
  ==

+$  web-app
  $:  id=@tas
      title=@t
      href=cord
  ==

+$  app
  $%  [%native =native-app]
      [%web =web-app]
  ==

+$  space-apps
  $:  pinned=(map space-path:spaces (set app))
      promoted=(map space-path:spaces (set app))
      suite=(map space-path:spaces (set app))
  ==

+$  installed-apps  (map desk charge:docket)

+$  board   ?(%pinned %recommended %suite)
+$  sample  [=ship =desk =board]
::
+$  action
  $%  [%add path=space-path:spaces =sample]
      [%remove path=space-path:spaces =sample]
  ==
::
+$  reaction
  $%  [%add path=space-path:spaces =sample]
      [%remove path=space-path:spaces =sample]
  ==
--