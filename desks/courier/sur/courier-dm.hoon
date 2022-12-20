::  courier-dm [realm]
::
|%

::  /~lomder-librun/dms
::  /~lomder-librun/0v.000.000.000.000
+$  courier-path    (pair @p @tas)
+$  courier-type    ?(%dm %group-dm %channel)
::
+$  dm-previews     (map courier-path message-preview)
+$  dm-inbox        (mop time message)
::
+$  dm-preview
  $:  
      path=courier-path
      to=(set ship)
      type=courier-type
      last-time-sent=@da
      last-message=(list content-types)
      profiles=(map ship profile-metadata)
      unread-count=@ud
      time=time
  ==
::
+$  blocks
  $%  [%image src=cord height=@ud width=@ud alt=cord]
      [%cite =cite]
  ==
::
+$  courier-message
  $:  path=(pair courier-path time)
      content=(pair (list block) (list contents))
      reactions=(map reacts (set ship))
      time=time
  ==
::
+$  content-types
  $@  @t
  $%  [%italics p=(list content-types)]
      [%bold p=(list content-types)]
      [%strike p=(list content-types)]
      [%blockquote p=(list content-types)]
      [%inline-code p=cord]
      [%ship p=ship]
      [%block p=@ud q=cord]
      [%code p=cord]
      [%tag p=cord]
      [%link p=cord q=cord]
      [%break ~]
  ==
::
+$  profile-metadata
  $:  nickname=cord
      color=cord
      avatar=cord
      starred=(unit time)
      deleted=(unit time)
      edited=(unit time)
  ==

::
::  reacts
::
+$  reacts  ?(%like %dislike %love %haha %wow %sad %angry)
+$  metadata
  $:  
      ::  in some cases we wont have profiles in the channel type
      profiles=(unit (map ship profile-metadata))
      reactions=(map reacts (set ship))
  ==
::

--