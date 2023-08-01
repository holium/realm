/+  *hora
|%
+$  rule-type  ?(%both %left %fuld %skip)
:: source, type and name
:: null for source means the rule is hardcoded
:: versioning recommended but not enforced
::
+$  rule-flag  (trel (unit ship) rule-type term)
+$  rid        rule-flag
::
+$  zone-flag  (unit (pair ship path)) :: ~ is UTC
+$  localtime  [tz=zone-flag dext]
:: types for basic timezone functions
::
+$  tz-to-utc-list  $-(@da (list @da))
+$  tz-to-utc       $-(dext (unit @da))
+$  utc-to-tz       $-(@da (unit dext))
:: parameter structure for a given recurrence rule
:: order matters for frontend parameter display
::
+$  parm  (list (pair @t term))
+$  args  (map @t arg)
:: both: the rule determines both left and right ends
:: left: the rule determines the left end, and the
::       right end is determined by duration
:: fuld: fullday (must be divisible by ~d1)
:: skip: a skip exception denoting a skipped instance
::
+$  kind  
  $%  [%both lz=zone-flag rz=zone-flag]
      [%left tz=zone-flag d=@dr]
      [%fuld ~]
      [%skip ~]
  ==
::
+$  rule  [name=@t =parm hoon=@t]
::
+$  span-exception
  $%  rule-exception
      [%bad-index l=(unit localtime) r=(unit localtime)]
      [%out-of-bounds tz=zone-flag d=@da] :: right end out-of-bounds
      $:  %out-of-order 
          l=[loc=localtime utc=@da] 
          r=[loc=localtime utc=@da]
      ==
  ==
::
+$  span-instance     (each span span-exception)
+$  fullday-instance  (each fullday rule-exception)
:: types for basic recurrence rule functions
::
+$  to-both        $-(@ud (each [dext dext] rule-exception))
:: only start (left) is specified; end (right) comes from duration
::
+$  to-left        $-(@ud (each dext rule-exception))
::
+$  to-span        $-(@ud span-instance)
+$  to-fullday     $-(@ud fullday-instance)
::
+$  to-to-both     $-(args to-both)
+$  to-to-left     $-(args to-left)
+$  to-to-fullday  $-(args to-fullday)
::
+$  rule-field
  $%  [%name name=@t]
      [%parm =parm]
      [%hoon hoon=@t]
  ==
::
+$  rule-update  $%(rule-field [%rule =rule])
::
+$  rule-action
  %+  pair  rid
  $%  [%create =rule]
      [%update fields=(list rule-field)]
      [%delete ~]
  ==
--
