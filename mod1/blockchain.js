const sha256 = require('sha256')

function Blockchain(){
    this.chain = [];
    this.pendingTransactions = [];
    this.pendingDocuments = []
}

Blockchain.prototype.createNewBlock = (nonce, previousBlockHash, hash)=>{
    const newBlock = {
        index: this.chain.length+1,
        timestamp: Date.now(),
        transactions: this.pendingTransactions,
        documents: this.newDocuments,
        nonce: nonce,
        hash: hash,
        previousBlockHash: previousBlockHash
    };

    this.pendingTransactions = [];
    this.newDocuments = [];
    this.chain.push(newBlock);

    return newBlock;
}

Blockchain.prototype.getLastBlock = ()=>{
    return this.chain[this.chain.length-1];
}

Blockchain.prototype.createNewTransaction = (amount, sender, recipient)=>{
    const newTransaction = {
        amount: amount,
        sender: sender,
        recipient: recipient
    };  

    this.pendingTransactions.push(newTransaction)
    //return this.getLastBlock()['index']+1;
    return this.getLastBlock().index+1;
}

Blockchain.prototype.createNewDocument = (owner, title, document)=>{
    const newDocument = {
        owner: owner,
        title: title,
        document: document
    };  

    this.pendingDocuments.push(newDocument)
    //return this.getLastBlock()['index']+1;
    return this.getLastBlock().index+1;
}

Blockchain.prototype.hashBlock = (previousBlockHash, currentBlockData, nonce)=>{
    const dataAsString = previousBlockHash+nonce.toString()+JSON.stringify(currentBlockData)
    const hash = sha256(dataAsString);
    return hash;
}

Blockchain.prototype.proofOfWork = (previousBlockHash, currentBlockData)=>{
    let nonce = 0;
    let hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
    while (hash.substring(0,4) != '0000') {
        nonce++;
        hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
    }
    return nonce;
}

module.exports = Blockchain;