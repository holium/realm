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
  |=  [=ship ufriend=(unit friend:sur) =contact:sur]
  ^-  friend:sur
  =/  friend  ?~(ufriend *friend:sur u.ufriend)
  %=  friend
    is-contact    %.y
    nickname      (crip :(weld (scow %p ship) " (contact)")) :: nickname.contact
    bio           bio.contact
    color         color.contact
    avatar        avatar.contact
    cover         cover.contact
    groups        groups.contact
  ==
::
++  rolodex-to-friends
  |=  [=friends:sur =rolodex:sur]
  ^-  friends:sur
  %-  ~(gas by friends)
  %+  turn  ~(tap by rolodex)
  |=  [=ship =contact:sur]
  ^-  [^ship friend:sur]
  =/  ufriend  (~(get by friends) ship)
  [ship (contact-to-friend ship ufriend contact)]
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
  ?+  -.field      friend
    %nickname      friend(nickname nickname.field)
    %bio           friend(bio bio.field)
    %color         friend(color color.field)
    %avatar        friend(avatar avatar.field)
    %add-group     friend(groups (~(put in groups.friend) resource.field))
    %remove-group  friend(groups (~(del in groups.friend) resource.field))
    %cover         friend(cover cover.field)
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
    ::
    :: Testing
    ::
        %add-hostyv
      :-  %add-hostyv
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
        ['is-contact' b+is-contact.friend]
        ['nickname' s+nickname.friend]
        ['bio' s+bio.friend]
        ['color' s+(scot %ux color.friend)]
        ['avatar' ?~(avatar.friend ~ s+u.avatar.friend)]
        ['cover' ?~(cover.friend ~ s+u.cover.friend)]
        ['groups' a+(turn ~(tap in groups.friend) (cork enjs-path:res (lead %s)))]
    ==
  ::
  --
--
