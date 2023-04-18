::  friends [realm]
::
/-  resource, *contact-store, membership, *realm-common
|%
+$  key  [=ship =time]
::
++  idx-sort
  |=  [a=key b=key]
  ?.  =(time.a time.b)
    (gth time.a time.b)
  :: same timestamp, order by ship (don't care)
  (gth ship.a ship.b)
::  friends: our ordered map to easily get updates by time.
::
+$  friends    ((mop key friend) idx-sort)
++  fon        ((on key friend) idx-sort)
::  friend-times: map of ship to time for resolving the mop.
::
+$  friend-times  (map ship time)
::
+$  tags       (set @t)
+$  status     ?(%online %away %dnd %offline %invisible)
::
::  $friend: these values are mostly used by us for bookkeeping on peers.
::  contact-info and status are updated by peers - should be done via SSS.
::
+$  friend
  $:  =version
      pinned=_|
      =tags
      created-at=@da
      updated-at=@da
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
      phone-number=(unit @t)
      ::
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
      relationship=?(%our %fren %received %sent %know %blocked)
      :: %invisible is used by us only, communicated to peers as %offline
      :: defaults to %offline
      =status
      ::
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
::
::  $contact-info: what a peer decides to tell us about themselves.
::
+$  contact-info
  $:  nickname=@t    :: passport set name (required)
      color=@t           :: passport set color
      twitter=(unit @t)  :: twitter handle
      bio=(unit @t)
      avatar=(unit @t)
      cover=(unit @t)
      featured-url=(unit @t)  :: can be used for personal site, linktree, opensea...
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
+$  friends-action-0
      ::  `friend` actions issued from Realm UI to our %friends agent
      ::  Upgrade: start using new version.
  $%  [%add-friend =ship]
      [%edit-friend =ship pinned=? =tags]
      [%remove-friend =ship]
      [%block-friend =ship]
      [%unblock-friend =ship]
      :: editing our own contact information
      :: could support diffs, but this is simpler
      ::
      [%set-contact-info =contact-info]
      [%set-status =status]
  ==
::
:: +$  friends-update-0
::   $%
::   ==
::
::  Ship to ship actions
::
+$  friends-push
  $%  ::  sent-friend: ship sends you friend request
      ::  accept-friend: ship accepts your friend request
      ::  bye-friend: ship notifies you that it has cancelled friend request or unfriended you.
      [%sent-friend ~]
      [%accept-friend ~]
      [%bye-friend ~]
  ==
::
::  Ship to ship updates
::
+$  friends-pull
  $%  [%status =status]
      [%contact-info =contact-info]
  ==
::
:: Old types
::
+$  friends-0  (map ship friend-0)
+$  friends-1  (map ship friend-1)
::
+$  friend-0
  $:  pinned=?
      =tags
      status=?(%fren %following %follower)
  ==
::
+$  friend-1
  $:  pinned=_|
      =tags
      status=?(%fren %following %follower %contact %our)
      contact-info=(unit contact-info-0)
  ==
::
+$  contact-info-0
  $:  nickname=@t
      bio=@t
      color=@ux
      avatar=(unit @t)
      cover=(unit @t)
  ==
::
+$  contact-info-edit-0
  $:  nickname=(unit @t)
      bio=(unit @t)
      color=(unit @ux)
      avatar=(unit @t)
      cover=(unit @t)
  ==
--
