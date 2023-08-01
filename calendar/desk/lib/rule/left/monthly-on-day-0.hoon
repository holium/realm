:+  'Monthly on Day'
  :~  ['Start' %da]
      ['Offset' %dl]
  ==
'''
|=  args=(map @t arg)
=/  start=@da  +:;;($>(%da arg) (~(got by args) 'Start'))
=/  =delta     +:;;($>(%dl arg) (~(got by args) 'Offset'))
^-  $-(@ud (each dext rule-exception))
|=  idx=@ud
=/  day=(unit @da)  ((monthly-on-day start) idx)
?~  day
  [%| %rule-error (crip "This day does not exist in this month.")]
[%& 0 (apply-delta u.day delta)]
'''
