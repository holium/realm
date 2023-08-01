:+  'Monthly nth Weekday'
  :~  ['Start' %da]
      ['Offset' %dl]
      ['Ordinal' %od]
      ['Weekday' %ud]
  ==
'''
|=  args=(map @t arg)
=/  start=@da  +:;;($>(%da arg) (~(got by args) 'Start'))
=/  =delta     +:;;($>(%dl arg) (~(got by args) 'Offset'))
=/  =ord       +:;;($>(%od arg) (~(got by args) 'Ordinal'))
=/  w=@        +:;;($>(%ud arg) (~(got by args) 'Weekday'))
^-  $-(@ud (each dext rule-exception))
|=  idx=@ud
=/  day=(unit @da)  ((monthly-nth-weekday start ord w) idx)
?~  day
  [%| %rule-error 'This day does not exist in this month.']
[%& 0 (apply-delta u.day delta)]
'''
