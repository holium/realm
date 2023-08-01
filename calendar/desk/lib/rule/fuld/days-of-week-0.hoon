:+  'Days of Week'
  :~  ['Start' %da]
      ['Weekdays' %wl]
  ==
'''
|=  args=(map @t arg)
=/  start=@da                +:;;($>(%da arg) (~(got by args) 'Start'))
=/  weekdays=(list wkd-num)  +:;;($>(%wl arg) (~(got by args) 'Weekdays'))
^-  $-(@ud (each fullday rule-exception))
|=  idx=@ud
=/  day=@da  ((days-of-week start weekdays) idx)
[%& (sane-fd ((days-of-week start weekdays) idx))]
'''
