const RNNoise = require('rnnoise-wasm');

let processor;

// Initialize the rnnoise processor
RNNoise.create(4096).then((proc) => {
  processor = proc;
});

onmessage = async function (e) {
  if (!processor) {
    postMessage(null);
    return;
  }

  const input = new Float32Array(e.data);
  const output = processor.process(input);

  postMessage(output.buffer, [output.buffer]);
};
