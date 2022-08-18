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

+$  web-app
  $:  id=app-id
      title=@t
      href=cord
  ==

+$  app
  $%  [%native =native-app]
      [%web =web-app]
  ==
::
+$  tag  ?(%pinned %recommended %suite %installed)
+$  tags  (set tag)
::  $app-entry: app metadata common to all apps and
::    used for resolution
+$  app-entry
      :: $rank: can be used for sorting apps; and simultaneously
      ::   (in the case of recommended apps) represent the # of "likes"
  $:  =ship
      rank=@u
      =tags
  ==
::
+$  app-view
  $:  meta=app-entry
      =app
  ==
::  $app-index: index of app ids. used to perform fast lookups
::   into the apps 'directory' when scrying
+$  app-index     (map app-id app-entry)
+$  space-apps    (map space-path:spaces app-index)
:: +$  pinned        (map space-path:spaces (set @tas))
:: +$  recommended   (map space-path:spaces (set @tas))
:: +$  suite         (map space-path:spaces (set @tas))
::  $apps: @tas is id in the case of web apps, and
::    desk name in the case of native apps
+$  apps  (map app-id app)
::
::  $activity: recent activity. e.g. new recommended/pinned/suite app
::    changes (added/removed/modified), new members joined. new apps
::    installed and made available to space (allow link to add
::    newly installed app to board.bazaar type???)
:: +$  activity
::
+$  action
  $%  [%pin path=space-path:spaces =app-id]
      [%unpin path=space-path:spaces =app-id]
      [%like path=space-path:spaces =app-id]
      [%dislike path=space-path:spaces =app-id]
      [%suite-add path=space-path:spaces =app-id]
      [%suite-remove path=space-path:spaces =app-id]
  ==
::
+$  reaction
  $%  [%initial =space-apps]
      [%space-apps =space-path:spaces =app-index]
  ==
::
::  Scry views
::
+$  view
  $%  [apps=app-index]
  ==
--