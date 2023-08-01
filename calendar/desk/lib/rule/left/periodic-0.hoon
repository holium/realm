:+  'Periodic'
  :~  ['Start' %da]
      ['Offset' %dl]
      ['Period' %dr]
  ==
'''
|=  args=(map @t arg)
=/  start=@da   +:;;($>(%da arg) (~(got by args) 'Start'))
=/  =delta      +:;;($>(%dl arg) (~(got by args) 'Offset'))
=/  period=@dr  +:;;($>(%dr arg) (~(got by args) 'Period'))
^-  $-(@ud (each dext rule-exception))
|=  idx=@ud
=/  =time  (add (sane-fd start) (mul idx period))
[%& 0 (apply-delta time delta)]
'''
