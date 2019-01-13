const { NlpManager } = require('node-nlp');

const manager = new NlpManager({ languages: ['es'] });
// Adds the utterances and intents for the NLP
manager.addDocument('es', 'Hasta Luego', 'greetings.bye');
manager.addDocument('es', 'Gracias, Hasta Luego', 'greetings.bye.thanks');
// manager.addDocument('en', 'okay see you later', 'greetings.bye');
// manager.addDocument('en', 'bye for now', 'greetings.bye');
// manager.addDocument('en', 'i must go', 'greetings.bye');
// manager.addDocument('en', 'hello', 'greetings.hello');
// manager.addDocument('en', 'hi', 'greetings.hello');
// manager.addDocument('en', 'howdy', 'greetings.hello');

// Train also the NLG
manager.addAnswer('es', 'greetings.bye', 'Hasta Luego, Buen día');
manager.addAnswer('es', 'greetings.bye.thanks', 'Fue un gusto ayudarte!');
// manager.addAnswer('en', 'greetings.hello', 'Hey there!');
// manager.addAnswer('en', 'greetings.hello', 'Greetings!');

// Train and save the model.
(async () => {
    await manager.train();
    manager.save();
    const response = await manager.process('es', 'Hasta luego, Gracias');
    console.log(response);  
})();