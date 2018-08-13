const sha256 = require('sha256');

class Transaction{
    constructor(amount, sender, recipient){
        this.amount = amount;
        this.sender = sender;
        this.recipient = recipient;
    }
}

class Document{
    constructor(owner, title, document){
        this.owner = owner;
        this.title = title;
        this.document = document;
    }
}

class Block{
    constructor(pendingTransactions, pendingDocuments, previousHash){
        this.timestamp = Date.now(),
        this.transactions = pendingTransactions,
        this.documents = pendingDocuments,
        this.nonce = 0,
        this.previousHash = previousHash,
        this.hash = this.calculateHash()
    }

    calculateHash(){
        return(sha256(this.timestamp+JSON.stringify(this.transactions)+JSON.stringify(this.documents)+this.nonce.toString()+this.previousHash))
    }

    mineBlock(difficulty){
        while (this.hash.substring(0, difficulty) !== Array(difficulty+1).join("0")) {
            this.nonce++
            this.hash = this.calculateHash();
        }
        console.log('block mined: '+ JSON.stringify(this));
    }
}

class Blockchain{
    constructor(){
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 4;
        this.miningReward = 100;
        this.pendingTransactions = [];
        this.pendingDocuments = [];
    }

    createGenesisBlock(){
        return new Block([], [], '0')
    }

    getLatestBlock(){
        return this.chain[this.chain.length-1];
    }

    createTransaction(amount, sender, recipient){
        const latestTransaction = new Transaction(amount, sender, recipient)
        this.pendingTransactions.push(latestTransaction)
    }

    createDocument(owner, title, document){
        const latestDocument = new Document(owner, title, document)
        this.pendingDocuments.push(latestDocument)
    }

    createAndMineNewBlock(miningRewardAddress){
        let block = new Block(this.pendingTransactions, this.pendingDocuments, this.getLatestBlock().hash);
        block.mineBlock(this.difficulty);

        console.log('block successfully mined');
        this.chain.push(block)

        this.pendingTransactions = [
            new Transaction(this.miningReward, null, miningRewardAddress)
        ];

        this.pendingDocuments = [];
    }

    isChainValid(){
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i-1];      
            
            if(currentBlock.hash !== currentBlock.calculateHash()){
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }
        return true;
    }

    getBalanceOfAddress(address){
        let balance = 0;

        for(const block of this.chain){
            for(const transaction of block.transactions){
                if (transaction.sender === address) {
                    balance -= transaction.amount
                }
                if (transaction.recipient === address) {
                    balance += transaction.amount
                }
            }
        }
        // return balance;
        console.log(balance);
    }
}

module.exports = Blockchain;

