:+  'Yearly on Date'
  :~  ['Start' %da]
      ['Offset' %dl]
  ==
'''
|=  args=(map @t arg)
=/  start=@da  +:;;($>(%da arg) (~(got by args) 'Start'))
=/  =delta     +:;;($>(%dl arg) (~(got by args) 'Offset'))
^-  $-(@ud (each dext rule-exception))
|=  idx=@ud
=/  day=(unit @da)  ((yearly-on-date start) idx)
?~  day
  [%| %rule-error (crip "This date does not exist.")]
[%& 0 (apply-delta u.day delta)]
'''
