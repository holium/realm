::  people [realm]:
::
::  People management lib within Realm. Mostly handles [de]serialization
::    to/from json from types stored in people sur.
::
::  Permissions management is centralized in the spaces agent. People
::   agent synch's permissions with spaces. People agent also
::   synch's contacts from contact-store.
::
::
/-  sur=friends
/+  res=resource
=<  [sur .]
=,  sur
|%
++  contact-to-friend
  |=  [ufriend=(unit friend:sur) =contact:sur]
  ^-  friend:sur
  =/  friend  ?~(ufriend *friend:sur u.ufriend)
  =/  contact-info
    :*  nickname.contact
        bio.contact
        color.contact
        avatar.contact
        cover.contact
        groups.contact
    ==
  friend(contact-info `contact-info)
::
++  rolodex-to-friends
  |=  [=friends:sur =rolodex:sur]
  ^-  friends:sur
  %-  ~(gas by friends)
  %+  turn  ~(tap by rolodex)
  |=  [=ship =contact:sur]
  ^-  [^ship friend:sur]
  =/  ufriend  (~(get by friends) ship)
  [ship (contact-to-friend ufriend contact)]
::
++  purge-contact-info
  |=  =old=friend:sur
  ^-  friend:sur
  =|  =new=friend:sur
  %=  new-friend
    pinned  pinned.old-friend
    tags    tags.old-friend
    status  status.old-friend
  ==
::
++  field-edit
  |=  [=friend:sur field=edit-field:sur]
  ^-  friend:sur
  ?~  contact-info.friend  !!
  ?+  -.field      friend
    %nickname      friend(nickname.u.contact-info nickname.field)
    %bio           friend(bio.u.contact-info bio.field)
    %color         friend(color.u.contact-info color.field)
    %avatar        friend(avatar.u.contact-info avatar.field)
    %add-group     friend(groups.u.contact-info (~(put in groups.u.contact-info.friend) resource.field))
    %remove-group  friend(groups.u.contact-info (~(del in groups.u.contact-info.friend) resource.field))
    %cover         friend(cover.u.contact-info cover.field)
  ==
::
++  nu                                              ::  parse number as hex
  |=  jon=json
  ?>  ?=([%s *] jon)
  (rash p.jon hex)
::
++  enjs
  =,  enjs:format
  |%
  ++  reaction
    |=  rct=^reaction
    ^-  json
    %-  pairs
    :_  ~
    ^-  [cord json]
    ?-  -.rct
        %friends
      [%friends (frens:encode friends.rct)]
      ::
        %friend
      :-  %friend
      %-  pairs
      :~  [%ship s+(scot %p ship.rct)]
          [%friend (fren:encode friend.rct)]
      ==
      ::
        %new-friend
      :-  %new-friend
      %-  pairs
      :~  [%ship s+(scot %p ship.rct)]
          [%friend (fren:encode friend.rct)]
      ==
      ::
        %bye-friend
      :-  %bye-friend
      (pairs [%ship s+(scot %p ship.rct)]~)
    ==
  ::
  ++  action
    |=  act=^action
    ^-  json
    %+  frond  %visa-action
    %-  pairs
    :_  ~
    ^-  [cord json]
    ?-  -.act
    ::
        %add-friend
      :-  %add-friend
      %-  pairs
      :~  [%ship s+(scot %p ship.act)]
      ==
    ::
        %edit-friend
      :-  %edit-friend
      %-  pairs
      :~  [%ship s+(scot %p ship.act)]
          [%pinned [%b pinned.act]]
          [%tags [%a (turn ~(tap in tags.act) |=(tag=cord s+tag))]]
      ==
    ::
        %remove-friend
      :-  %remove-friend
      %-  pairs
      :~  [%ship s+(scot %p ship.act)]
      ==
    ::
    ::  Receiving
    ::
        %be-fren
      :-  %be-fren
      ~
    ::
        %yes-fren
      :-  %yes-fren
      ~
    ::
        %bye-fren
      :-  %bye-fren
      ~
    ==
  ::
  ++  view :: encodes for on-peek
    |=  view=^view
    ^-  json
    %-  pairs
    :_  ~
    ^-  [cord json]
    ?-  -.view
        %friends
      [%friends (frens:encode friends.view)]
    ==
  --
::
++  dejs
  =,  dejs:format
  |%
  ++  action
    |=  jon=json
    ^-  ^action
    =<  (decode jon)
    |%
    ++  decode
      %-  of
      :~  [%add-friend add-friend]
          [%edit-friend edit-friend]
          [%remove-friend remove-friend]
          [%be-fren ul]
          [%yes-fren ul]
          [%bye-fren ul]
      ==
    ::
    ++  add-friend
      %-  ot
      :~  [%ship (su ;~(pfix sig fed:ag))]
      ==
    ::
    ++  edit-friend
      %-  ot
      :~  [%ship (su ;~(pfix sig fed:ag))]
          [%pinned bo]
          [%tags (as cord)]
      ==
    ::
    ++  remove-friend
      %-  ot
      :~  [%ship (su ;~(pfix sig fed:ag))]
      ==
    ::
    --
  --
::
++  encode
  =,  enjs:format
  |%
  ++  frens
    |=  =friends
    ^-  json
    %-  pairs
    %+  turn  ~(tap by friends)
    |=  [=^ship =friend]
    ^-  [cord json]
    [(scot %p ship) (fren friend)]
  ::
  ++  fren
    |=  =friend
    ^-  json
    %-  pairs:enjs:format
    :~  ['pinned' b+pinned.friend]
        ['tags' [%a (turn ~(tap in tags.friend) |=(tag=cord s+tag))]]
        ['status' s+status.friend]
        :-  'contact-info'
          ?~  contact-info.friend  ~
          %-  pairs
          ^-  (list [@t json])
          :~  ['nickname' s+nickname.u.contact-info.friend]
              ['bio' s+bio.u.contact-info.friend]
              ['color' s+(scot %ux color.u.contact-info.friend)]
              ['avatar' ?~(avatar.u.contact-info.friend ~ s+u.avatar.u.contact-info.friend)]
              ['cover' ?~(cover.u.contact-info.friend ~ s+u.cover.u.contact-info.friend)]
              ['groups' a+(turn ~(tap in groups.u.contact-info.friend) (cork enjs-path:res (lead %s)))]
          ==
    ==
  ::
  --
--
