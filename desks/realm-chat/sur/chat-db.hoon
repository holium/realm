::  chat-db [realm]
::
|%

::  3 bits of info in a uniq-id: timestamp, sender, msg-part-id
::  order by timestamp first
::  then sender
::  then msg-part-id
++  idx-sort
  |=  [a=uniq-id b=uniq-id]
  ?.  =(timestamp.msg-id.a timestamp.msg-id.b)
    (gth timestamp.msg-id.a timestamp.msg-id.b)
  :: same timestamp, so either ships sent msg at same time, or order by
  :: msg-part-id
  ?:  =(sender.msg-id.a sender.msg-id.b)
    :: they are the same ship, so order by msg-part-id
    (gth msg-part-id.a msg-part-id.b)
  :: they are different ships, so just order by ship id
  (gth sender.msg-id.a sender.msg-id.b)
::
::  database types
::
+$  path-row
  $:  =path
      metadata=(map cord cord)
      type=@tas     :: not officially specified, up to user to interpret for maybe %dm vs %group or %chat vs %board or whatever
      created-at=time
      updated-at=time  :: updated when %edit-path-medatata is hit
  ==
::
+$  paths-table  (map path path-row)
::
+$  msg-id    [timestamp=@da sender=ship] :: paired with ship for uniqueness in global scope (like when two ships happen to send messages at exactly the same time)
+$  msg-part-id  @ud            :: continuously incrementing numeric id, but only within a message
+$  message   (list msg-part)   :: all the msg-part that have the same msg-id and path
+$  reply-to  (unit (pair path msg-id))
+$  msg-part
  $:  =path
      =msg-id
      =msg-part-id
      =content
      =reply-to
      metadata=(map cord cord)
      created-at=@da
      updated-at=@da  :: set to now.bowl when %edit action. means it can be out of sync between ships, but shouldn't matter
  ==
+$  content
  $%  [%custom name=cord value=cord] :: general data type
      [%plain p=cord]
      [%bold p=cord]
      [%italics p=cord]
      [%strike p=cord]
      [%bold-italics p=cord]
      [%bold-strike p=cord]
      [%italics-strike p=cord]
      [%bold-italics-strike p=cord]
      [%blockquote p=cord]
      [%inline-code p=cord]
      [%ship p=ship]
      [%code p=cord]
      [%link p=cord]
      [%image p=cord]
      [%ur-link p=cord]      :: for links to places on the urbit network
      [%react p=cord]        :: for emojii reactions to messages
      [%break ~]
  ==
::
+$  uniq-id  [=msg-id =msg-part-id]
+$  messages-table  ((mop uniq-id msg-part) idx-sort)
++  msgon  ((on uniq-id msg-part) idx-sort)
::
+$  peer-row
  $:  =path
      patp=ship
      role=?(%member %host)
      created-at=time
      updated-at=time  :: not used really yet, but if we implement a way to change peers role, then this would be needed
  ==
::
+$  peers-table  (map path (list peer-row))
::
+$  table-name   ?(%paths %messages %peers)
+$  table
  $%  [%paths =paths-table]
      [%messages =messages-table]
      [%peers =peers-table]
  ==
+$  tables  (list table)
::
::  agent details
::
+$  action
  $%  
      [%create-path =path-row]
      [%edit-path-metadata =path metadata=(map cord cord)]
      [%leave-path =path]
      [%insert =insert-message-action]
      [%edit =edit-message-action]
      [%delete =msg-id]
      [%add-peer =path patp=ship timestamp=time]
      [%kick-peer =path patp=ship]
  ==
+$  minimal-fragment        [=content =reply-to metadata=(map cord cord)]
+$  insert-message-action   [timestamp=@da =path fragments=(list minimal-fragment)]
+$  edit-message-action     [=msg-id =path fragments=(list minimal-fragment)]
::
+$  db-dump
  $%  
      [%tables =tables]
  ==
+$  db-change-type
  $%
    [%add-row =db-row]
    [%upd-paths-row =path-row]
    [%del-paths-row =path]
    [%del-peers-row =path =ship]
    [%del-messages-row =uniq-id]
  ==
+$  db-row
  $%  [%paths =path-row]
      [%messages =msg-part]
      [%peers =peer-row]
  ==
+$  db-change  (list db-change-type)
::
--
