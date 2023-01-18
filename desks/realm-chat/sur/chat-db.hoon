::  chat-db [realm]
::
|%

::  3 bits of info in a uniq-id: timestamp, sender, msg-part-id
::  order by timestamp first
::  then sender
::  then msg-part-id
++  idx-sort
  |=  [a=uniq-id b=uniq-id]
  ?:  (gth timestamp.msg-id.a timestamp.msg-id.b)
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
+$  path-id  @uvH   :: produced by (sham [path])
+$  path-row
  $:  id=@uvH
      =path
      metadata=(map cord cord)
      type=@tas     :: not officially specified, up to user to interpret for maybe %dm vs %group or %chat vs %board or whatever
  ==
::
+$  paths-table  (map path-id path-row)
::
+$  msg-id    [timestamp=@da sender=ship] :: paired with ship for uniqueness in global scope (like when two ships happen to send messages at exactly the same time)
+$  msg-part-id  @ud            :: continuously incrementing numeric id, but only within a message
+$  message   (list msg-part)   :: all the msg-part that have the same msg-id and path-id
+$  msg-part
  $:  =path-id
      =msg-id
      =msg-part-id
      =content
      reply-to=(pair path-id msg-id)
      metadata=(map cord cord)
      timestamp=@da
  ==
+$  content
  $%  [@t p=cord] :: general data type
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
      [%link p=cord q=cord]  :: p is visible name, q is actual link, they can be the same
      [%image p=cord]
      [%ur-link p=cord]      :: for links to places on the urbit network
      [%break ~]
  ==
::
+$  uniq-id  [=msg-id =msg-part-id]
+$  messages-table  ((mop uniq-id msg-part) idx-sort)
::
+$  peer-row
  $:  =path-id
      patp=ship
      role=?(%member %host)
  ==
::
+$  peers-table  (map path-id (list peer-row))
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
      [%create-path =path]
      [%leave-path =path]
      [%insert =message]
      [%edit =message]
      [%delete =path-id =msg-id]
      [%add-peer =path-id patp=ship]
      [%kick-peer =path-id patp=ship]
  ==
::
+$  db-dump
  $%  
      [%tables =tables]
  ==
::
+$  reaction
  $%  
      [%example =ship]
  ==
::
::  Scry views
::
+$  view
  $%  
      [%example =ship]
  ==
--
