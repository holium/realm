/-  spaces=spaces-store, docket=docket, treaty=treaty
|%
+$  app-id  @tas
+$  native-app
  $:  title=@t
      info=@t
      color=cord
      icon=cord
  ==
::
+$  web-app
  $:  title=@t
      href=cord
      favicon=cord
  ==
::
+$  install-status   ?(%started %failed %suspended %installed %uninstalled %desktop %treaty)
+$  urbit-app
  $:  =docket:docket
      host=(unit ship)
      =install-status
  ==
::
+$  app
  $%  [%native =native-app]
      [%web =web-app]
      :: [%urbit =docket:docket host=(unit ship) install-status=?(%started %failed %suspended %installed %uninstalled %desktop %treaty)]
      [%urbit =docket:docket host=(unit ship) install-status=?(%started %failed %suspended %installed %uninstalled %desktop %treaty)]
      :: [%missing ~]
  ==
::
::  $catalog: for efficiencies sake, this is the one "master" list of apps
::    a ship is aware of; from the apps installed on the ship to apps 'imported'
::    from remote spaces. this is to reduce memory req's for apps that are
::    included across multiple spaces. [app-header] data is referenced to orient an
::    app (tags/ranks) relative to a given space
::
+$  catalog           (map app-id app)
+$  grid-index        (map @ud app-id)  ::  tracks the order of installed apps for our app grid
+$  recommendations   (set app-id)      ::  all of our recommended apps
::
::  $stalls: a stall tracks metadata around the suite and recommended apps
::
+$  member-set        (set ship)
+$  recommended       (map app-id member-set)
+$  stalls            (map space-path:spaces stall)
+$  stall 
  $:  suite=(list app-id) 
      =recommended
    ==
::
::  $kits:  tracks the pinned apps per space
::
+$  kits              (map space-path:spaces kit)
+$  kit               (set app-id)
::
+$  action
  $%  
      [%pin path=space-path:spaces =app-id index=(unit @ud)]
      [%unpin path=space-path:spaces =app-id]
      :: [%set-pin-order path=space-path:spaces =kit]
      [%recommend =app-id]
      [%unrecommend =app-id]
      [%suite-add path=space-path:spaces =app-id index=@ud]
      [%suite-remove path=space-path:spaces =app-id]
      [%install-app =ship =desk]
      [%uninstall-app =desk]
  ==
+$  reaction
  $%  [%initial =catalog =stalls =kits]
      :: [%remote-space path=space-path =space-apps]
      :: [%pin path=space-path:spaces =app-id index=(unit @ud)]
      :: [%unpin path=space-path:spaces =app-id]
      :: [%set-pin-order path=space-path:spaces =kit]
      :: [%recommend path=space-path:spaces =app-id]
      :: [%unrecommend path=space-path:spaces =app-id]
      :: [%suite-add path=space-path:spaces =app-id index=@ud]
      :: [%suite-remove path=space-path:spaces =app-id]
      :: [%set-suite-order path=space-path:spaces ord=(list app-id)]
      :: [%app-install-status-changed =app-id =app]
      [%app-install-start =app-id =urbit-app]
      [%app-install-update =app-id =urbit-app]
      [%app-install-done =app-id =urbit-app]
      [%app-uninstalled =app-id =urbit-app]
      :: [%treaty-added [=ship =desk] =docket:docket]
  ==
+$  view
  $%  [%catalog =catalog]
      [%installed =catalog]
      [%providers =allies:ally:treaty]
      :: [%apps =app-index-full]
  ==
--