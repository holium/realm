/-  hark
|%
::
+$  note
  $:  id=@uvH                         :: note id (from hark)
      content=(list content:hark)     :: content as markdown (cord)
      tim=time                        :: note time sent
      seen=?                          :: seen/unseen
  ==
::
+$  action
  $%
      [%seen =id:hark]
  ==
::
+$  reaction
  $%  [%seen =id:hark]
      [%new-note =note]
  ==
::
+$  view
  $%  [%all notes=(map id:hark note)]
      [%seen notes=(map id:hark note)]
      [%unseen notes=(map id:hark note)]
  ==
--

