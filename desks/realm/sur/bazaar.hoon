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
  $:  title=@t
      info=@t
      color=cord
      icon=cord
      :: image=cord
      :: =href
  ==
::
+$  web-app
  $:  title=@t
      href=cord
  ==
::
+$  app-type  ?(%native %web %urbit %missing)
::
+$  tag     ?(%pinned %recommended %suite)
::
+$  tags    (set tag)
::
+$  sorts   [pinned=(list app-id) recommended=(list app-id) suite=(list app-id)]
::
::  $ranks - each app gets a rank (ordinal) relative to a
::   "grouping" (pinned/recommended/suite)
::  0th rank => default ordinal when not relative to a grouping
::  1st rank => ordinal relative to pinned
::  2nd rank => ordinal relative to recommended
::  3rd rank => ordinal relative to suite
:: +$  ranks   [default=@ud pinned=@ud recommended=@ud suite=@ud]
+$  ranks   [pinned=@ud recommended=@ud suite=@ud]
::
::  $sieve: space specific metadata
+$  sieve
  $:  =ranks
      =tags
  ==

:: +$  sieve
::   $:  mesh=?(%pinned %recommended %suite)
::       rank=@ud
::       order=(list app-id)
::       tags=(set tag)
::   ==
::  $app-detail: space independent app detail
+$  app
  $%  [%native =native-app]
      [%web =web-app]
      [%urbit =docket:docket installed=?]
      [%missing ~]
  ==
::
:: +$  app                     [=app]
+$  app-lite                [id=app-id =sieve]
+$  app-full                [id=app-id =sieve pkg=app]

::  various organizations of data (transient/ephemeral datasets)
::   used to facilitate scrying and data transfers between other
::   ships and local/remote agents
::  note: of these 4 maps, only space-apps-lite is maintained in agent state
+$  app-index-full          (map app-id app-full)
+$  app-index-lite          (map app-id app-lite)
+$  space-apps-lite         (map space-path:spaces [index=app-index-lite =sorts])  :: INCLUDED IN AGENT STATE
+$  space-apps-full         (map space-path:spaces [index=app-index-full =sorts])
+$  sites                   (set [ship desk])

:: +$  pinned-apps             (map space-path:spaces (map app-id @ud))
:: +$  recommended-apps        (map space-path:spaces (map app-id @ud))
:: +$  suite-apps              (map space-path:spaces (map app-id @ud))
::
::  $app-catalog: for efficiencies sake, this is the one "master" list of apps
::    a ship is aware of; from the apps installed on the ship to apps 'imported'
::    from remote spaces. this is to reduce memory req's for apps that are
::    included across multiple spaces. [app-header] data is referenced to orient an
::    app (tags/ranks) relative to a given space
+$  app-catalog             (map app-id app)  :: INCLUDED IN AGENT STATE
::
+$  action
  $%  [%pin path=space-path:spaces =app-id rank=(unit @ud)]
      [%unpin path=space-path:spaces =app-id]
      :: bulk pin ordering to facilitate efficiency/ease in UI
      [%set-pin-order path=space-path:spaces order=(list app-id)]
      [%recommend path=space-path:spaces =app-id]
      [%unrecommend path=space-path:spaces =app-id]
      [%suite-add path=space-path:spaces =app-id rank=@ud]
      [%suite-remove path=space-path:spaces =app-id]
      [%install-app =ship =desk]
  ==
::
+$  reaction
  $%  [%initial =space-apps-full]
      [%space-apps =space-path:spaces =app-index-full =sorts sites=(set [ship desk])]
      [%pin path=space-path:spaces =app-full ord=(list app-id)]
      [%unpin path=space-path:spaces =app-full ord=(list app-id)]
      [%set-pin-order path=space-path:spaces ord=(list app-id)]
      [%recommend path=space-path:spaces =app-full ord=(list app-id)]
      [%unrecommend path=space-path:spaces =app-full ord=(list app-id)]
      [%suite-add path=space-path:spaces =app-full ord=(list app-id)]
      [%suite-remove path=space-path:spaces =app-full ord=(list app-id)]
      [%set-suite-order path=space-path:spaces ord=(list app-id)]
      [%app-installed =app-id =app]
      [%app-uninstalled =app-id]
      [%treaty-added [=ship =desk] =docket:docket]
  ==
::
::  Scry views
::
+$  view
  $%  [%apps =app-index-full]
      [%sites sites=(set [ship desk])]
  ==
--