::
::  courier-dm [realm]
::
/-  c-path=courier-path
/-  cite
|%
::
+$  chats       (map path:c-path (pair preview chat))
+$  chat-type   ?(%dm %group-dm)
+$  m-path      (pair path:c-path time)
::
+$  preview
  $:  =path:c-path
      to=(set ship)
      type=chat-type
      last-sent=time
      last-message=(list inline)
      profiles=(map ship profile)
      unread-count=@ud
  ==
::
+$  chat
  $:  =path:c-path
      to=(set ship)
      type=chat-type
      log=((mop time message) lte)
      unread-count=@ud
      profiles=(map ship profile)
      created-at=time
  ==
::
+$  message
  $:  path=m-path
      content=[(list blocks) (list inline)]
      reactions=(map reacts (set ship))
      sent-at=time
  ==
::
+$  profile
  $:  nickname=cord
      color=cord
      avatar=cord
  ==
::
+$  reacts  ?(%like %dislike %love %haha %wow %sad %angry)
::
::  %chat inline and blocks
::
+$  blocks
  $%  [%image src=cord height=@ud width=@ud alt=cord]
      [%cite =cite]
  ==
::
+$  inline
  $@  @t
  $%  [%italics p=(list inline)]
      [%bold p=(list inline)]
      [%strike p=(list inline)]
      [%blockquote p=(list inline)]
      [%inline-code p=cord]
      [%ship p=ship]
      [%block p=@ud q=cord]
      [%code p=cord]
      [%tag p=cord]
      [%link p=cord q=cord]
      [%break ~]
  ==
::
::
::
+$  action
  $%  [%create-chat type=chat-type to=(set ship)]
      [%leave-chat =path:c-path]
      [%send-message =path:c-path =message]
      :: [%read-chat =path:c-path]
      :: [%delete-chat =path:c-path]
      :: [%pin-chat =path:c-path]
      :: [%unpin-chat =path:c-path]
      :: [%react path=m-path react=reacts]
  ==
::
+$  reaction
  $%  [%message-created type=chat-type to=(set ship)]
      [%message-left =path:c-path]
      [%message-sent =path:c-path =preview]
      [%message-received =path:c-path =message]
      [%chat-read =path:c-path]
      [%chat-deleted =path:c-path]
      :: [%chat-pinned =path:c-path]
      :: [%chat-unpinned =path:c-path]
      [%reacted path=m-path =ship react=reacts]
  ==
::
--