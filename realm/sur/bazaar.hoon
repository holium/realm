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
+$  app-id  @tas
::
+$  native-app
  $:  desk=@tas
      title=@t
      info=@t
      color=@ux
      image=cord
      =href
  ==
::
+$  web-app
  $:  title=@t
      href=cord
  ==
::
+$  app-type  ?(%native %web %urbit %missing)
::
+$  tag     ?(%pinned %recommended %suite %installed)
::
+$  tags    (set tag)
::
::  $ranks - each app gets a rank (ordinal) relative to a
::   "grouping" (pinned/recommended/suite)
::  0th rank => default ordinal when not relative to a grouping
::  1st rank => ordinal relative to pinned
::  2nd rank => ordinal relative to recommended
::  3rd rank => ordinal relative to suite
+$  ranks   [default=@ud pinned=@ud recommended=@ud suite=@ud]
::
::  $app-header: space specific metadata
+$  app-header
  $:  =ranks
      =tags
  ==
::  $app-detail: space independent app detail
+$  app-detail
  $%  [%native =native-app]
      [%web =web-app]
      [%urbit =docket:docket]
      [%missing ~]
  ==
::
+$  app                     [id=app-id det=app-detail]
+$  app-lite                [id=app-id hdr=app-header]
+$  app-full                [id=app-id hdr=app-header det=app-detail]

+$  app-index-full          (map app-id app-full)
+$  app-index-lite          (map app-id app-lite)
+$  space-apps-lite         (map space-path:spaces app-index-lite)
+$  space-apps-full         (map space-path:spaces app-index-full)
::
::  $app-catalog: for efficiencies sake, this is the one "master" list of apps
::    a ship is aware of; from the apps installed on the ship to apps 'imported'
::    from remote spaces. this is to reduce memory req's for apps that are
::    included across multiple spaces. [app-header] data is referenced to orient an
::    app (tags/ranks) relative to a given space
+$  app-catalog             (map app-id app)
::
+$  action
  $%  [%add-tag path=space-path:spaces =app-id =tag rank=(unit @ud)]
      [%remove-tag path=space-path:spaces =app-id =tag]
      [%suite-add path=space-path:spaces =app-id rank=(unit @ud)]
      [%suite-remove path=space-path:spaces =app-id]
  ==
::
+$  reaction
  $%  [%initial =space-apps-full]
      [%space-apps =space-path:spaces =app-index-full]
      [%add-tag path=space-path:spaces =app-id =tag]
      [%remove-tag path=space-path:spaces =app-id =tag]
      [%suite-add path=space-path:spaces =app-full]
      [%suite-remove path=space-path:spaces =app-id]
      [%app-installed =app-id =app]
      [%app-uninstalled =app-id]
  ==
::
::  Scry views
::
+$  view
  $%  [%apps =app-index-full]
  ==
--