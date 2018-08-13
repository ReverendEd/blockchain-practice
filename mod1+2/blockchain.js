function Blockchain(){
    this.chain = [];
    this.newTransactions = [];
    this.newDocuments = []
}

Blockchain.prototype.createNewBlock = (nonce, previousBlockHash, hash)=>{
    const newBlock = {
        index: this.chain.length+1,
        timestamp: Date.now(),
        transactions: this.newTransactions,
        documents: this.newDocuments,
        nonce: nonce,
        hash: hash,
        previousBlockHash: previousBlockHash
    };

    this.newTransactions = [];
    this.newDocuments = [];
    this.chain.push(newBlock);

    return newBlock;
}

Blockchain.prototype.getLastBlock = ()=>{
    return this.chain[this.chain.length-1];
}

module.exports = Blockchain;