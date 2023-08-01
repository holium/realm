:+  'Monthly on Day'
  :~  ['Start' %da]
  ==
'''
|=  args=(map @t arg)
=/  start=@da  +:;;($>(%da arg) (~(got by args) 'Start'))
^-  $-(@ud (each fullday rule-exception))
|=  idx=@ud
=/  day=(unit @da)  ((monthly-on-day start) idx)
?~  day
  [%| %rule-error (crip "This day does not exist in this month.")]
[%& (sane-fd u.day)]
'''

