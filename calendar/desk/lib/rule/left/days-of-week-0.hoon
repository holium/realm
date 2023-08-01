:+  'Days of Week'
  :~  ['Start' %da]
      ['Offset' %dl]
      ['Weekdays' %wl]
  ==
'''
|=  args=(map @t arg)
=/  start=@da                +:;;($>(%da arg) (~(got by args) 'Start'))
=/  =delta                   +:;;($>(%dl arg) (~(got by args) 'Offset'))
=/  weekdays=(list wkd-num)  +:;;($>(%wl arg) (~(got by args) 'Weekdays'))
^-  $-(@ud (each dext rule-exception))
|=  idx=@ud
=/  day=@da  ((days-of-week start weekdays) idx)
[%& 0 (apply-delta day delta)]
'''
