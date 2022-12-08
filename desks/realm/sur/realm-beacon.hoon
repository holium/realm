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
      [%seen =id:hark]
  ==
::
+$  reaction
  $%  [%seen id:hark]
      [%new-note =note]
  ==
::
:: +$  view
::   $%  [%latest =(list @ud)]
::   ==
--

