::  friends [realm]
::
/-  resource, *contact-store, membership
|%
::
::  $friends: specifically used for the our space.
::
+$  friends-0     (map ship friend-0)
+$  friends-1  (map ship friend-1)
+$  friends   (map ship friend)
+$  is-public   ?
::
::  $friend: specifically used for the our space, keeps track of another
::    ship and allows metadata.
::
+$  friend-state  ?(%added %mutual)
+$  friend-tags   (set cord)
+$  friend-0
  $:  pinned=?
      tags=friend-tags
      status=?(%fren %following %follower)
  ==  
+$  friend-1
  $:  pinned=_|
      tags=friend-tags
      status=?(%fren %following %follower %contact %our)
      contact-info=(unit contact-info-0)
  ==
::
::  $friend: these values are mostly used by us for bookkeeping on peers.
::  contact-info and status is received by peers.
::
+$  friend
  $:  pinned=_|
      tags=(set @t)
      ::
      :: public -> only set by us. If public, others can discover us
      :: by searching twitter handle or Realm username.
      :: linking contacts allows discovery via phone number.
      ::
      :: your phone number will _never_ be visible to anyone.
      ::
      :: private: those that "know" you (have shared space(s)/DMs with you)
      :: can see your profile.
      ::
      :: public=(unit _|)
      :: this should probably be stored elsewhere
      phone-number=(unit @t)
      :: %our = us
      :: %fren = friend (sent/received and accepted)
      :: %received = live friend request received
      :: %sent = live friend request sent
      :: %contact = legacy contact-store??
      ::
      :: %block = I blocked you. - last message is me going offline.
      :: Further friend requests are auto-denied,
      :: and we don't send them any updates.
      ::
      :: %know - Have shared space(s)/DMs together. Is this like %contact?
      :: This may present scaling issues - we can kill
      :: "knows" data when you no longer share a connection.
      ::
      :: defaults to %know
      relationship=?(%our %fren %received %sent %contact %know %block %contact)
      :: %invisible is used by us only, communicated to peers as %offline
      :: defaults to %offline
      status=?(%online %away %dnd %offline %invisible)
      :: Taking live status updates further:
      :: These are decent ideas but we need to weigh 
      :: implementation time + extra traffic over Urbit.  Putting them as ideas for later
      :: Bazaar could be scried for apps/spaces we already know about, 
      :: otherwise (for public spaces / apps) a database query would be required
      :: to resolve from space-path to public space name, etc.
      ::
      :: platform=?(%desktop %mobile)
      :: curr-space=(unit space-path)
      :: curr-app=(unit app-path)
      :: curr-room=(unit room-path)
      contact-info=(unit contact-info)
      :: stretch: I should be able to set photos / names
      :: for friends that override theirs.
      ::
      :: I should be able to set my name / photo for different spaces.
  ==
+$  contact-info-0
  $:  nickname=@t
      bio=@t
      color=@ux
      avatar=(unit @t)
      cover=(unit @t)
  ==
::
::  $contact-info: what a peer decides to tell us about themselves.
::
+$  contact-info
  $:  nickname=@t    :: passport set name (required)
      color=@t             :: passport set color
      twitter=(unit @t)  :: twitter handle
      bio=(unit @t)
      avatar=(unit @t)
      cover=(unit @t)
      featured-url=(unit @t)  :: can be used for personal site, linktree, opensea...
  ==
::
+$  contact-info-edit-0
  $:  nickname=(unit @t)
      bio=(unit @t)
      color=(unit @ux)
      avatar=(unit @t)
      cover=(unit @t)
  ==
::
::  $contact-info-edit: updates from peer about their information.
::  this should eventually be done via SSS.
::
+$  contact-info-edit
  $:  nickname=(unit @t)
      color=(unit @t)
      twitter=(unit @t)
      bio=(unit @t)
      avatar=(unit @t)
      cover=(unit @t)
      featured-url=(unit @t)
  ==
::
+$  action
  $%  
      [%add-friend =ship]
      [%edit-friend =ship pinned=? tags=friend-tags]
      [%remove-friend =ship]
      ::  Poke friend actions
      [%be-fren ~]
      [%yes-fren ~]
      [%bye-fren ~]
      [%set-contact =ship contact-info=contact-info-edit]
      [%share-contact =ship]
      [%set-sync sync=?]
  ==
::
+$  reaction
  $%  
      [%friends =friends]
      [%friend =ship =friend]       :: reacts when old friend is updated
      [%new-friend =ship =friend]   :: reacts when a new friend is added
      [%bye-friend =ship]           :: reacts when a friend is removed 
  ==
::
::  Scry views
::
+$  view
  $%  
      [%friends =friends]
      [%contact-info =contact-info]
  ==
--
