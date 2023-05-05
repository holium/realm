import { motion } from 'framer-motion';

// Word wrapper
const Wrapper = (props: any) => {
  // We'll do this to prevent wrapping of words using CSS
  return <span className="word-wrapper">{props.children}</span>;
};

// AnimatedText
// Handles the deconstruction of each word and character to setup for the
// individual character animations
export const AnimatedText = (props: { text: string }) => {
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
      return;
    }
    return word.push('\u00A0');
  });

  return (
    <>
      {words.map((word, index) => {
        return (
          // Wrap each word in the Wrapper component
          <Wrapper key={`${word}-${index}`}>
            {words[index].flat().map((element: any, index: number) => {
              return (
                <span
                  style={{
                    overflow: 'hidden',
                    display: 'inline-block',
                  }}
                  key={index}
                >
                  <motion.span
                    style={{ display: 'inline-block' }}
                    variants={item}
                  >
                    {element}
                  </motion.span>
                </span>
              );
            })}
          </Wrapper>
        );
      })}
    </>
  );
};