|%
::
++  supported-providers  (silt `(list @t)`['hark-store' 'hark' 'beacon' ~])
::
+$  action
  $%
      [%connect-provider prov=@tas]
      [%seen id=@ud]
  ==
::
+$  reaction
  $%  [%seen id=@ud]
  ==
+$  view
  $%  [%latest =(list @ud)]
  ==
--

