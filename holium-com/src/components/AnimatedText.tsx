import { motion } from 'framer-motion';

// AnimatedText
// Handles the deconstruction of each word and character to setup for the
// individual character animations
export const AnimatedText = (props: { text: string; replay: boolean }) => {
  // Framer Motion variant object, for controlling animation
  const item = {
    hidden: {
      y: '200%',
      transition: { ease: [0.455, 0.03, 0.515, 0.955], duration: 0.85 },
    },
    visible: {
      y: 0,
      transition: { ease: [0.455, 0.03, 0.515, 0.955], duration: 0.75 },
    },
  };

  //  Split each word of props.text into an array
  const splitWords = props.text.split(' ');

  // Create storage array
  const words: any[] = [];

  // Push each word into words array
  for (const [, item] of splitWords.entries()) {
    words.push(item.split(''));
  }

  // Add a space ("\u00A0") to the end of each word
  words.map((word, index) => {
    if (index === words.length - 1) {
      // eslint-disable-next-line array-callback-return
      return;
    }
    return word.push('\u00A0');
  });

  return (
    <motion.span
      initial="hidden"
      animate={props.replay ? 'visible' : 'hidden'}
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.025,
          },
        },
        hidden: {
          transition: {
            staggerChildren: 0.025,
          },
        },
      }}
    >
      {words.map((word) => {
        return word.flat().map((character: any, index: number) => (
          <span
            style={{
              overflow: 'hidden',
              display: 'inline-block',
            }}
            key={index}
          >
            <motion.span style={{ display: 'inline-block' }} variants={item}>
              {character}
            </motion.span>
          </span>
        ));
      })}
    </motion.span>
  );
};
