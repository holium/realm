/-  *calendar, s=spaces-store, m=membership
|%
+$  space      space-path:s
::
+$  banned     (set ship) :: cannot create calendars in space
::
+$  perms
  $:  admins=role
      member=(unit role)
      custom=(map ship role)
  ==
::
+$  calendars  (map cid [creator=ship =perms])
::
+$  async-create
  $%  [%space title=@t description=@t =space =perms]
      [%our title=@t description=@t]
  ==
::
+$  crud-action
  %+  pair  space
  $%  [%banned =banned]
      [%create =cid =perms] :: banned cannot create
      [%delete =cid]        :: only admins or the creator can delete
      [%reperm =cid =perms] :: only calendar-admins can reperm
  ==
::
+$  process-our  (pair cid ?(%put %del))
::
+$  our-action
  %+  pair  cid
  $?  %delete
      %accept :: forward to %calendar and add to our
      %leave  :: forward to %calendar and remove from our
  ==
::
+$  util-action  $%([%follow-many spaces=(list space)])
::
++  reaction
  =<  reaction
  |%
  +$  reaction
    $%  [%space space-reaction]
        [%calendar calendar-reaction]
    ==
  +$  space-reaction
    $%  [%watchlist p=(list cid)]
        [%banned =banned] :: banned from creating
    ==
  +$  calendar-reaction
    $%  [%calendar creator=ship =perms]
        [%perms =perms]
    ==
  --
:: ui updates
::
++  update
  $%  [%initial our=(set cid) almanac=(map space [=banned =calendars])]
      [%add-space =space =banned =calendars]
      [%del-space =space]
      [%banned =space =banned]
      [%add-calendar =space =cid creator=ship =perms]
      [%del-calendar =space =cid]
      [%perms =space =cid =perms]
      [%add-our =cid]
      [%del-our =cid]
  ==
::
::
++  spaces-peek
  =<  peek
  |%
  +$  peek
    $%  [%almanac almanac=(map space [=banned =^calendars])]
        [%our our=(map cid [@t @t])]
        [%calendars =calendars]
        [%spaces spaces=(set space)]
    ==
  +$  calendars  (map cid calendar)
  +$  calendar
    $:  title=@t
        description=@t
        creator=ship
        =perms
    ==
  --
--
