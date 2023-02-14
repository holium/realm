::  notif-db [realm]
::
|%
::
::  database types
::
+$  id  @ud
::
+$  metadata  (map cord cord)
::
+$  notif-row
  $:  =id
      app=@tas   :: %chat-db or %talk or %groups for whatever agent is creating the notification
      =path      :: whatever custom path scoped within that agent that the agent wants to use. could just be /all or similar
      type=@tas  :: not officially specified, up to user to interpret for maybe %message vs %mention or whatever
      content=@t :: any text to show on the notification
      =metadata  :: notif-db doesn't care about this either, but could be used to implement "archival" or some other concepts around grouping notifications
      created-at=time
      read-at=time
      read=?     :: %.y if the user has read the notification, automatically set to %.n to start
  ==
::
+$  notifs-table  ((mop id notif-row) gth)
::
++  notifon  ((on id notif-row) gth)
::
::  agent details
::
+$  action
  $%  
      [%create =create-action]
      [%read-id =id]
      [%read-app app=@tas]
      [%read-path app=@tas =path]
      [%read-all read=?]
      [%update =id =create-action]
      [%delete =id]
  ==
+$  create-action      [app=@tas =path type=@tas content=@t =metadata]
::
+$  db-change-type
  $%
    [%add-row =notif-row]
    [%update-all flag=?(%read %unread)]
    [%update-row =notif-row]
    [%del-row =id]
  ==
+$  db-change  (list db-change-type)
::
+$  reaction
  $%  
      [%example =ship]
  ==
--
