/-  hark
|%
::
+$  note
  $:  id=@uvH                         :: note id (from hark)
      desk=@tas
      inbox=cord
      content=(list content:hark)     :: content as markdown (cord)
      tim=time                        :: note time sent
      seen=?                          :: seen/unseen
  ==
::
+$  action
  $%
      [%saw-note =id:hark]
      [%saw-inbox =seam:hark]
      [%saw-all ~]
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

