/-  *rules, p=pools
/+  vio=ventio
|%
+$  cid    id:p :: permanently fixed to a pool
+$  eid  @taeid :: event id
+$  mid  @tamid :: metadata id
+$  aid  @taaid :: args id
::
++  max-instances  10.000
::
+$  dom  [l=@ud r=@ud]
::
+$  meta
  $:  name=@t
      description=@t
      color=@t
  ==
::
+$  rsvp   ?(%yes %no %maybe)
+$  rsvps  (map ship rsvp)
::
+$  instance
  $%  [%span p=span-instance]
      [%fuld p=fullday-instance]
      [%skip ~]
  ==
::
+$  instance-row  [=aid =mid =rsvps i=instance]
::
+$  event
  $:  =dom :: instances are in this range
      def-rule=aid
      def-data=mid
      rules=(map aid [rid kind args])
      metadata=(map mid meta)
      instances=(map @ud instance-row)
  ==
:: recurrent date; birthdays, etc (consistent yearly MM/DD date)
::
+$  rdate  [date=[m=@ud d=@ud] metadata=meta]
:: %viewer can only view the calendar
:: %guest  can only view the calendar
::         and rsvp to events
:: %member can create events, can modify
::         and delete their own events
::         and rsvp to events
:: %admin  can create events, can modify
::         and delete any event, can invite
::         new members, can kick non-admins,
::         can modify the pool graylist
::         and can rsvp to events
::
+$  role  ?(%viewer %guest %member %admin)
::
+$  iref  [=eid i=@ud]      :: instance reference
::
+$  mome  [?(%l %r) =iref]  :: span moment
::
++  calendar
  =<  calendar
  |%
  +$  calendar  [metadata perms events orders]
  +$  metadata  [title=@t description=@t]
  +$  perms
    $:  roles=(map ship role)
        default-role=role
        scry=roles-scry
    ==
  +$  events
    $:  events=(map eid event)
        rdates=(map eid rdate)
    ==
  +$  orders
    $:  fullday-order=((mop @da (set iref)) gth) :: timezone independent
        span-order=((mop @da (set mome)) gth) 
    ==
  --
::
+$  roles-scry  $~([%calendar /roles-gate] [=dude:gall =path])
+$  roles-gate  $-([cid ship] (unit role))
::
+$  calendar-field
  $%  [%title title=@t]
      [%description description=@t]
      [%default-role =role]
      [%role p=(each [=ship =role] ship)]
  ==
::
+$  meta-field
  $%  [%name name=@t]
      [%description description=@t]
      [%color color=@t]
  ==
::
+$  async-create
  $%  $:  %calendar  title=@t  description=@t
          roles=(unit roles-scry)  graylist=(unit graylist-scry:p)
      ==
      [%event =cid =dom =rid =kind =args =meta]
      [%event-until =cid start=@ud until=@da =rid =kind =args =meta]
      [%event-rule =cid =eid =rid =kind =args]
      [%event-metadata =cid =eid =meta]
  ==
::
+$  calendar-action
  %+  pair  cid
  $%  [%create title=@t description=@t scry=(unit roles-scry)]
      [%update fields=(list calendar-field)]
      [%update-graylist fields=(list field:p)] :: can't edit dudes
      [%delete ~]
  ==
::
+$  event-field
  $%  [%def-rule =aid]
      [%def-data =mid]
  ==
::
+$  instance-field
  $%  [%aid =aid]
      [%mid =mid]
  ==
::
+$  event-action
  %+  pair  [=cid =eid]
  $%  [%create =dom =aid =rid =kind =args =mid =meta]
      [%create-until start=@ud until=@da =aid =rid =kind =args =mid =meta]
      [%update fields=(list event-field)]
      [%delete ~]
      [%create-rule =aid =rid =kind =args]
      [%update-rule =aid =rid =kind =args]
      [%delete-rule =aid]
      [%create-metadata =mid meta]
      [%update-metadata =mid fields=(list meta-field)]
      [%delete-metadata =mid]
      [%update-instances =dom fields=(list instance-field)]
      [%update-domain =dom]
  ==
::
+$  rdate-action
  %+  pair  cid
  $%  [%create date=[m=@ud d=@ud] =meta]
      [%update =eid]    :: (list date-field)
      [%delete =eid]
  ==
::
++  crud
  |$  [create update delete]
  $%  [%c p=create]
      [%u p=update]
      [%d p=delete]
  ==
::
+$  event-update
  $%  :: direct replace
      ::
      event-field
      [%dom =dom]
      :: put / del
      ::
      [%rule p=(each [aid [rid kind args]] aid)]
      [%metadata p=(crud [mid meta] [mid meta-field] mid)]
      [%instance p=(each [idx=@ud row=instance-row] @ud)]
  ==
::
+$  rdate-update
  $%  [%date date=[m=@ud d=@ud]]
      [%meta meta-field]
  ==
::
+$  calendar-update
  $%  :: replace whole calendar
      ::
      [%calendar cal=calendar]
      :: direct replace
      ::
      calendar-field
      :: create / update / delete
      ::
      [%event p=(crud [eid event] [eid event-update] eid)]
      [%rdate p=(crud [eid rdate] [eid rdate-update] eid)]
  ==
::
+$  home-update  $%([%calendar p=(each cid cid)])
::
+$  real-instance
  $:  =rid  =kind  =args  =meta
      i=$%([%span p=span] [%fuld p=fullday])
  ==
::
+$  range  (map iref real-instance)
::
++  peek
  $%  [%rules rules=(map rid rule)]
      [%rule =rule]
      [%calendars calendars=(map cid calendar)]
      [%calendar =calendar]
      [%range =range] 
      [%role role=(unit role)]
  ==
::
+$  cals-vent
  $@  ~
  $%  [%cid =cid]
      [%eid =eid]
      [%aid =aid]
      [%mid =mid]
  ==
--
