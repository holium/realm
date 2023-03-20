/-  store=bookmark
/+  default-agent, dbug, lib=bookmark
|%
+$  versioned-state
  $%  state-0
  ==
+$  state-0  [%0 =bookmarks:store =settings:store]
+$  card  card:agent:gall
--
%-  agent:dbug
=|  state-0
=*  state  -
^-  agent:gall
=<
  |_  =bowl:gall
  +*  this  .
      def   ~(. (default-agent this %.n) bowl)
      core   ~(. +> [bowl ~])
  ::
  ++  on-init
    ^-  (quip card _this)
    `this
  ::
  ++  on-save
    ^-  vase
    !>(state)
  ::
  ++  on-load
    |=  old-state=vase
    ^-  (quip card _this)
    =/  old  !<(versioned-state old-state)
    ?-  -.old
      %0  `this(state old)
    ==
  ::
  ++  on-poke
    |=  [=mark =vase]
    ^-  (quip card _this)
    ?>  (team:title our.bowl src.bowl)
    ?+  mark  (on-poke:def mark vase)
        %bookmark-action
      =^  cards  state
        ^-  (quip card _state)
        (action:core !<(action:store vase))
      [cards this]
    ==
  ++  on-watch  on-watch:def
  ++  on-leave  on-leave:def
  ++  on-peek
    |=  =path
    ^-  (unit (unit cage))
    ?+    path  (on-peek:def path)
        [%x %all ~] :: ~/scry/bookmark/all.json
      ?>  (team:title our.bowl src.bowl)
      ``noun+!>((view:enjs:lib [%bookmarks bookmarks]))
        [%x %settings ~] :: ~/scry/bookmark/settings.json
      ?>  (team:title our.bowl src.bowl)
      ``noun+!>((view:enjs:lib [%settings settings]))
      ::
    ==
  ++  on-agent  on-agent:def
  ++  on-arvo   on-arvo:def
  ++  on-fail   on-fail:def
  --
|_  [=bowl:gall cards=(list card)]
::
++  core  .
++  action
  |=  act=action:store
  ^-  (quip card _state)
  ?-  -.act
    %add-bookmark  (handle-add-bookmark +.act)
    %remove-bookmark  (handle-remove-bookmark +.act)
    %set-settings  (handle-set-settings +.act)
  ==
::
++  handle-add-bookmark
  |=  [=url:store =permissions:store]
  =.  bookmarks  (~(put by bookmarks) [url permissions])
  `state
::
++  handle-remove-bookmark
  |=  =url:store
  =.  bookmarks  (~(del by bookmarks) url)
  `state
::
++  handle-set-settings
  |=  =settings:store
  =.  settings.state  settings
  `state
::
--

