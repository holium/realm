const defaultSrcs = [
  'https://images.unsplash.com/photo-1564292284419-a82fe631db14?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=Mnw0MzUxODl8MHwxfHJhbmRvbXx8fHx8fHx8fDE2ODEzMTYyNTc&ixlib=rb-4.0.3&q=80&w=400',
  'https://images.unsplash.com/photo-1663889824646-dfc296de33dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=Mnw0MzUxODl8MHwxfHJhbmRvbXx8fHx8fHx8fDE2ODEzMTYyNTc&ixlib=rb-4.0.3&q=80&w=400',
  'https://images.unsplash.com/photo-1515405295579-ba7b45403062?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=Mnw0MzUxODl8MHwxfHJhbmRvbXx8fHx8fHx8fDE2ODEzMTYyNTc&ixlib=rb-4.0.3&q=80&w=400',
  'https://images.unsplash.com/photo-1521400383156-1e315f1f7b94?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=Mnw0MzUxODl8MHwxfHJhbmRvbXx8fHx8fHx8fDE2ODEzMTYyNTc&ixlib=rb-4.0.3&q=80&w=400',
  'https://images.unsplash.com/photo-1511181832407-791900ec318e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=Mnw0MzUxODl8MHwxfHJhbmRvbXx8fHx8fHx8fDE2ODEzMTYyNTc&ixlib=rb-4.0.3&q=80&w=400',
  'https://images.unsplash.com/photo-1589383544287-a670dcc9d242?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=Mnw0MzUxODl8MHwxfHJhbmRvbXx8fHx8fHx8fDE2ODEzMTYyNTc&ixlib=rb-4.0.3&q=80&w=400',
  'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=Mnw0MzUxODl8MHwxfHJhbmRvbXx8fHx8fHx8fDE2ODEzMTYyNTc&ixlib=rb-4.0.3&q=80&w=400',
  'https://images.unsplash.com/photo-1615378536579-61c7d173e8a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=Mnw0MzUxODl8MHwxfHJhbmRvbXx8fHx8fHx8fDE2ODEzMTYyNTc&ixlib=rb-4.0.3&q=80&w=400',
  'https://images.unsplash.com/photo-1614642264762-d0a3b8bf3700?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=Mnw0MzUxODl8MHwxfHJhbmRvbXx8fHx8fHx8fDE2ODEzMTYyNTc&ixlib=rb-4.0.3&q=80&w=400',
  'https://images.unsplash.com/photo-1610294517329-d4aac71cd302?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=Mnw0MzUxODl8MHwxfHJhbmRvbXx8fHx8fHx8fDE2ODEzMTYyNTc&ixlib=rb-4.0.3&q=80&w=400',
  'https://images.unsplash.com/photo-1555546415-c5c9b54f70f9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=Mnw0MzUxODl8MHwxfHJhbmRvbXx8fHx8fHx8fDE2ODEzMTYyNTc&ixlib=rb-4.0.3&q=80&w=400',
  'https://images.unsplash.com/photo-1654361392270-563e41676c0e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=Mnw0MzUxODl8MHwxfHJhbmRvbXx8fHx8fHx8fDE2ODEzMTYyNTc&ixlib=rb-4.0.3&q=80&w=400',
  'https://images.unsplash.com/photo-1600531185345-2195d5c47dcd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=Mnw0MzUxODl8MHwxfHJhbmRvbXx8fHx8fHx8fDE2ODEzMTYyNTc&ixlib=rb-4.0.3&q=80&w=400',
  'https://images.unsplash.com/photo-1679407509869-95d525d7caed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=Mnw0MzUxODl8MHwxfHJhbmRvbXx8fHx8fHx8fDE2ODEzMTYyNTc&ixlib=rb-4.0.3&q=80&w=400',
  'https://images.unsplash.com/photo-1564053051381-5cb91813736b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=Mnw0MzUxODl8MHwxfHJhbmRvbXx8fHx8fHx8fDE2ODEzMTYyNTc&ixlib=rb-4.0.3&q=80&w=400',
  'https://images.unsplash.com/photo-1645583918683-39fd75293e80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=Mnw0MzUxODl8MHwxfHJhbmRvbXx8fHx8fHx8fDE2ODEzMTYyNTc&ixlib=rb-4.0.3&q=80&w=400',
  'https://images.unsplash.com/photo-1562898616-c98aa0ccf42a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=Mnw0MzUxODl8MHwxfHJhbmRvbXx8fHx8fHx8fDE2ODEzMTYyNTc&ixlib=rb-4.0.3&q=80&w=400',
  'https://images.unsplash.com/photo-1570356402261-a5bf3841e998?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=Mnw0MzUxODl8MHwxfHJhbmRvbXx8fHx8fHx8fDE2ODEzMTYyNTc&ixlib=rb-4.0.3&q=80&w=400',
  'https://images.unsplash.com/photo-1508767887031-185bbeb45718?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=Mnw0MzUxODl8MHwxfHJhbmRvbXx8fHx8fHx8fDE2ODEzMTYyNTc&ixlib=rb-4.0.3&q=80&w=400',
];

export const defaultImages = defaultSrcs.map((src) => ({
  src,
  author: 'John Doe',
  authorLink: 'https://unsplash.com/@johndoe',
  downloadLink: 'https://unsplash.com/photos/abc123',
}));
