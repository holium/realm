/-  pth=spaces-path
|%
+$  space-path  path:pth
+$  stack-id    @t
+$  window-id    @t
::
+$  bounds
  $:  x=@ud       :: [1.0 - 10.0]
      y=@ud       :: [1.0 - 10.0]
      height=@ud  :: [1.0 - 10.0]
      width=@ud   :: [1.0 - 10.0]
  ==
::
+$  window
  $:  id=@t       ::  0v2.lms54.s3vdv.s2olr.ejopc.i2e63
      owner=@p    ::  ~lomder-librun
      app=cord    ::  engram
      path=cord   ::  /apps/engram/<doc-id>
      access=?(%write %read)
      type=?(%urbit %web %native)
      metadata=(map cord cord)
      z-index=@   ::  11
      =bounds     ::  [x=1.0 y=1.0 height=8.0 width=6.5]
  ==
::
+$  stack
  $:  id=@t
      host=ship
      type=?(%singleplayer %multiplayer)
      windows=(map window-id window)
      metadata=(map cord cord)
  ==
::
+$  composer
  $:  space=space-path
      current=stack-id
      our=stack
      stacks=(map stack-id stack)
  ==
::
+$  compositions  (map space-path composer)
::
+$  action
  $%  [%add-space =space-path]
      [%remove-space =space-path]
      [%add-stack =space-path =stack]
      [%remove-stack =space-path =stack-id]
      [%set-current-stack =space-path =stack-id]
      [%set-window =space-path =stack-id =window]
      [%remove-window =space-path =stack-id window-id=@t]
  ==
::
+$  view
  $%  [%compositions =compositions]
  ==
::
--
