|%
+$  type 
  $?  %vote
      %rating
      %comment
      %tag
      %link
      %follow
      %relay
      @tas
  ==
+$  id        [=ship t=@da] :: ship is who created the row, t is when it was created since that's inherently unique in one-at-a-time only creation fashion
::
:: pre-built data-types
::

:: like/dislike upvote/downvote
+$  vote
  $:  up=?              :: true for like/upvote, false for dislike/downvote
      =ship             :: who cast this vote
      parent-type=type  :: table name of the thing this vote is attached to
      parent-id=id      :: id of the thing this vote is attached to
      parent-path=path
  ==

:: 5 star rating, 100% scoring, etc
+$  rating
  $:  value=@rd         :: the rating. any real number. up to app to parse properly
      max=@rd           :: the maximum rating the application allows. (useful for aggregating, and making display agnostic)
      =ship             :: who made this rating
      format=@tas       :: an app-specific code for indicating what "kind" of rating it is (5-star or 100% or 7/10 cats or whatever)
      parent-type=type  :: table name of the thing being rated
      parent-id=id      :: id of the thing being rated
      parent-path=path
  ==

:: plain text snippet referencing some other object
+$  comment
  $:  txt=@t            :: the comment
      =ship             :: the commenter
      parent-type=type  :: table name of the thing being commented on
      parent-id=id      :: id of the thing being commented on
      parent-path=path
  ==

:: tag some <thing> with metadata (ex: 'funny' 'based' 'programming' etc)
+$  tag
  $:  tag=@t            :: the tag (ex: 'based')
      =ship             :: the tagger
      parent-type=type  :: table name of the thing being tagged
      parent-id=id      :: id of the thing being tagged
      parent-path=path
  ==

:: directionally link two objects in some way
:: ex: ~zod has a :comment and a :post that expands upon it. he can
:: connect the two with a :link like:
::   ['inspiration' 'inspired by' ~zod %comment [~zod 0] %post [~zod 1]]
:: which the ui can then display at the bottom of the post with some fancy styling.
+$  link
  $:  key=@t            :: the key of the link, what the computer uses to find (ex: 'based')
      =ship             :: the linker
      from-type=type    :: table name of the thing being linked from
      from-id=id        :: id of the thing being linked from
      from-path=path
      to-type=type      :: table name of the thing being linked to
      to-id=id          :: id of the thing being linked to
      to-path=path
  ==

:: classic social graph information
+$  follow
  $:  leader=ship
      follower=ship     
      domain=path   :: maybe I only want to follow ~zod's %recipes, not their %rumors posts
  ==

:: the relay table is necessary for making retweets work on urbit
:: the goal includes the ability to count retweets within a space
::  (should come with ability to relay to all paths or just to a
::  particular path)
+$  relay
  $:  what=id
      =type
      revision=@ud
      target-path=path
      original-path=path
  ==
--

