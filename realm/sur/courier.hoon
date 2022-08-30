::  courier [realm]
::
/-  *post
|%

+$  chat-type  ?(%group %dm %pending)
+$  source  ?(%graph-store %chatstead)
::
::  $message: a generalized message structure for Realm
::
+$  graph-dm
  $:  index=cord     :: Can be either a group chat graph index or single dm-inbox graph index (or later chatstead)
      author=ship
      time-sent=@da
      contents=(list content)
  ==
::
::  TODO parse the new chatstead message
::
+$  chatstead-dm
  $:  
    id=cord     
    author=ship
    time-sent=@da
    contents=(list content)
  ==
::
+$  contact-mtd
  $:  
    color=@ux
    avatar=(unit @t)
    nickname=@t
  ==
::
+$  chat
  $:  
    :: path=cord     :: Can be either a group dm association or single dm-inbox graph association
    to=ship
    type=chat-type
    =source
    messages=(list graph-dm)
    metadata=contact-mtd
  ==
::
:: +$  paged-chat
::   $:  path=cord     :: Can be either a group dm association or single dm-inbox graph association
::       to=ship
::       type=chat-type
::       =source
::       offset=@u     ::  what page we are viewing
::       count=@u      ::  the amount of messages per page
::       pages=@u      ::  the total number of page
::       messages=(list graph-dm)
::       metadata=contact-mtd
::   ==
::
:: +$  chat-previews     (map ship message-preview)
+$  chat-previews     (list message-preview)
+$  message-preview
  $:  
    :: path=cord     
    to=ship
    type=chat-type
    =source
    last-time-sent=@da
    last-message=(list content)
    metadata=contact-mtd
  ==
::
::  %contact-store
::
+$  rolodex  (map ship contact)
+$  contact
  $:  nickname=@t
      bio=@t
      status=@t
      color=@ux
      avatar=(unit @t)
      cover=(unit @t)
      groups=(set resource)
      last-updated=@da
  ==
:: 
::
::
+$  action
  $%  
      [%accept-dm =ship]
      [%decline-dm =ship]
      [%pendings ships=(set ship)]
      [%screen screen=?]
  ==
::
+$  reaction
  $%  
      [%previews =chat-previews]    ::  loads a list of all dms
      [%dm-received =chat]          ::  a newly received dm-message
  ==
::
::  Scry views
::
+$  view
  $%  
      [%inbox =chat-previews]               ::  loads a slim preview of data for fast loading
      [%dm-log =chat]                       ::  loads the full message list and metadata for a chat
      :: [%paged-chat =paged-chat]          ::  loads a windowed chat using offset and count
  ==
::
--