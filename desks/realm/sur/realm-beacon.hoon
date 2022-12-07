/-  hark
|%
::
+$  note
  $:  id=@uvH                         :: note id (from hark)
      content=(list content:hark)     :: content as markdown (cord)
      tim=time                        :: note time sent
  ==
::
+$  action
  $%
      :: [%connect-provider prov=@tas]
      [%seen id=@ud]
  ==
::
+$  reaction
  $%  ::[%seen id=@ud]
      [%new-note =note]
  ==
::
:: +$  view
::   $%  [%latest =(list @ud)]
::   ==
--

