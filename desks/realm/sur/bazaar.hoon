/-  spaces=spaces-store, docket
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
+$  sorts   [pinned=(list app-id) suite=(list app-id) recommended=(list app-id)]
::
::  $ranks: gives the ordinal of the app within the space
::  note that pinned ordinals are sequential and containing no 'gaps'; however
::  because of the UI design, suite apps can have non-sequential (w/ gaps)
::  ordinals depending on where the user places the app in the suite
::  (e.g 0, 3, 4) where slots 1 and 2 would show as empty in the UI
+$  slots   [pinned=@ud suite=@ud]
::
::  $sieve: space specific metadata
+$  sieve
  $:  =slots
      recommendations=[total=@ud members=(set ship)]
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
+$  app-lite                [id=app-id =sieve]
+$  app-full                [id=app-id =sieve entry=app-catalog-entry]

::  various organizations of data (transient/ephemeral datasets)
::   used to facilitate scrying and data transfers between other
::   ships and local/remote agents
::  note: of these 4 maps, only space-apps-lite is maintained in agent state
+$  app-index-full          (map app-id app-full)
+$  app-index-lite          (map app-id app-lite)
+$  space-apps-lite         (map space-path:spaces [index=app-index-lite =sorts])  :: INCLUDED IN AGENT STATE
+$  space-apps-full         (map space-path:spaces [index=app-index-full =sorts])
+$  sites                   (set [ship desk])

+$  my
  $:  recommendations=(set app-id)
  ==

:: +$  pinned-apps             (map space-path:spaces (map app-id @ud))
:: +$  recommended-apps        (map space-path:spaces (map app-id @ud))
:: +$  suite-apps              (map space-path:spaces (map app-id @ud))
::
::  $app-catalog: for efficiencies sake, this is the one "master" list of apps
::    a ship is aware of; from the apps installed on the ship to apps 'imported'
::    from remote spaces. this is to reduce memory req's for apps that are
::    included across multiple spaces. [app-header] data is referenced to orient an
::    app (tags/ranks) relative to a given space
+$  app-catalog-entry
  :: $:  recommended=@ud
  $:  =app
  ==
+$  app-catalog             (map app-id app-catalog-entry)  :: INCLUDED IN AGENT STATE
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
:: 'private' ship-to-ship (member-to-host) pokes (no json encode/decode req'd)
+$  interaction
  $%  [%member-recommend path=space-path:spaces =app-full]
      [%member-unrecommend path=space-path:spaces =app-full]
  ==
::
+$  reaction
  $%  [%initial =space-apps-full =my]
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
      [%my-recommendations recommendations=(set app-id)]
  ==
::
::  Scry views
::
+$  view
  $%  [%catalog =app-catalog]
      [%apps =app-index-full]
      [%sites sites=(set [ship desk])]
  ==
--