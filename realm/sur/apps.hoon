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
  $:  id=@tas
      title=@t
      type=?(%native %web)
      info=@t
      color=@ux
      image=cord
      =href
  ==

+$  web-app
  $:  id=@tas
      title=@t
      type=?(%native %web)
      href=cord
  ==

+$  apps
  $%  =native-app
      =web-app
  ==
--