/-  *spaces-store
|%
+$  provider  $~(~hostyv ship)
::
+$  meta-space
  $:  path=space-path :: [ship cord]
      name=space-name :: cord
      description=space-description :: cord
      picture=@t
      color=@t
  ==
+$  spaces  (map space-path meta-space)
+$  action
  $%  [%set-provider =provider]
      [%add-space meta-space]
      [%remove-space path=space-path]
  ==
+$  reaction
  $%  [%initial =spaces]
      $>(%add-space action)
      $>(%remove-space action)
  ==
--
