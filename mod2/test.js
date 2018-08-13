const Blockchain = require('./blockchain');

const bitcoin = new Blockchain();

bitcoin.createDocument('ed', 'mydocument', 'ilawgliauwbgilauwbgilauwbgiub');
bitcoin.createTransaction(20, 'us', 'them')

bitcoin.createAndMineNewBlock('myAddress')
bitcoin.createAndMineNewBlock('myAddress')
bitcoin.createAndMineNewBlock('myAddress')
bitcoin.createDocument('ed', 'mydocument', 'ilawgliauwbgilauwbgilauwbgiub');
bitcoin.createTransaction(20, 'us', 'them')
bitcoin.createAndMineNewBlock('myAddress')
bitcoin.createAndMineNewBlock('myAddress')
bitcoin.createDocument('ed', 'mydocument', 'ilawgliauwbgilauwbgilauwbgiub');
bitcoin.createTransaction(20, 'us', 'them')
bitcoin.createAndMineNewBlock('myAddress')

bitcoin.getBalanceOfAddress('myAddress')
bitcoin.getBalanceOfAddress('us')
bitcoin.getBalanceOfAddress('them')

// bitcoin.chain[3].transactions.push(new Transaction(400, 'bye', 'hi'))
// bitcoin.chain[3].calculateHash();

console.log(bitcoin.isChainValid());