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
  $:  desk=app-id
      title=@t
      info=@t
      color=@ux
      image=cord
      =href
  ==
::
+$  web-app
  $:  id=app-id
      title=@t
      href=cord
  ==
::
:: +$  app
::   $%  [%native =native-app]
::       [%web =web-app]
::   ==
::
+$  app-type  ?(%native %web %urbit %missing)
::  $app: for now , bazaar only supports %urbit apps combined
::   with associated docket info. front-end should check app-type to determine
::   the other data available in a payload
+$  app
  $%  [%native =native-app]
      [%web =web-app]
      [%urbit =docket:docket]
      [%missing ~]
  ==
+$  tag     ?(%pinned %recommended %suite %installed)
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
::  $app-entry: app metadata common to all apps and
::    used for resolution
+$  app-entry
      :: $rank: can be used for sorting apps; and simultaneously
      ::   (in the case of recommended apps) represent the # of "likes"
  $:  id=app-id
      =ship
      =ranks
      =tags
  ==
::
::  $app-view: combines bazaar specific data (e.g. app-entry) with
::    native/web/urbit data
+$  app-view
  $:  =app-entry
      =app
  ==
::  $app-views: like an app-index, but contains detail app data in addition
::    to bazaar specific data
+$  app-views      (map app-id app-view)
::  $app-index: index of app ids. used to perform fast lookups
::   into the apps 'directory' when scrying
+$  app-index     (map app-id app-entry)
+$  space-apps    (map space-path:spaces app-index)
+$  space-apps-full    (map space-path:spaces app-views)
:: +$  pinned        (map space-path:spaces (set @tas))
:: +$  recommended   (map space-path:spaces (set @tas))
:: +$  suite         (map space-path:spaces (set @tas))
::  $apps: @tas is id in the case of web apps, and
::    desk name in the case of native apps
:: +$  apps  (map app-id app)
::
::  $activity: recent activity. e.g. new recommended/pinned/suite app
::    changes (added/removed/modified), new members joined. new apps
::    installed and made available to space (allow link to add
::    newly installed app to board.bazaar type???)
:: +$  activity
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
      [%space-apps =space-path:spaces =app-index]
      [%add-tag path=space-path:spaces =app-id =tag] :: rank=(unit @ud)]
      [%remove-tag path=space-path:spaces =app-id =tag] :: rank=(unit @ud)]
      [%suite-add path=space-path:spaces =app-id rank=@ud]
      [%suite-remove path=space-path:spaces =app-id]
  ==
::
::  Scry views
::
+$  view
  $%  [%apps =app-views]
  ==
--