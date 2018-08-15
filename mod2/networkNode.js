const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const Blockchain = require('./blockchain');
const uuid = require('uuid/v1');
const port = process.argv[2];
const rp = require('request-promise');

const nodeAddress = uuid().split('-').join('');

const bitcoin = new Blockchain();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.get('/blockchain', (req, res)=>{
    res.send(bitcoin);
})

app.post('/transaction', (req, res)=>{
    const blockIndex = bitcoin.chain.length+1;
    const newTransaction = req.body
    bitcoin.addTransactionToPendingTransactions(newTransaction)   
    res.json({note: `Transaction will be added to block ${blockIndex}.`})
})

app.post('/transaction/broadcast', function(req, res) {
	const newTransaction = bitcoin.createTransaction(req.body.amount, req.body.sender, req.body.recipient);
	bitcoin.addTransactionToPendingTransactions(newTransaction);
	const requestPromises = [];
	bitcoin.networkNodes.forEach(networkNodeUrl => {
		const requestOptions = {
			uri: networkNodeUrl + '/transaction',
			method: 'POST',
			body: newTransaction,
			json: true
		};
		requestPromises.push(rp(requestOptions));
    });
	Promise.all(requestPromises)
	.then(data => {
		res.json({ note: 'Transaction created and broadcast successfully.' });
	});
});

app.post('/document', (req, res)=>{
    const blockIndex = bitcoin.chain.length+1;
    const newDocument = req.body
    bitcoin.addDocumentToPendingDocuments(newDocument)   
    res.json({note: `Document will be added to block ${blockIndex}.`})
})

app.post('/document/broadcast', function(req, res) {
	const newDocument = bitcoin.createDocument(req.body.owner, req.body.title, req.body.document);
	bitcoin.addDocumentToPendingDocuments(newDocument);
	const requestPromises = [];
	bitcoin.networkNodes.forEach(networkNodeUrl => {
		const requestOptions = {
			uri: networkNodeUrl + '/document',
			method: 'POST',
			body: newDocument,
			json: true
		};
		requestPromises.push(rp(requestOptions));
    });
	Promise.all(requestPromises)
	.then(data => {
		res.json({ note: 'Document created and broadcast successfully.' });
	});
});

app.get('/mine', (req, res)=>{
    const newBlock = bitcoin.createAndMineNewBlock();
    const requestPromises = [];
	bitcoin.networkNodes.forEach(networkNodeUrl => {
		const requestOptions = {
			uri: networkNodeUrl + '/receive-new-block',
			method: 'POST',
			body: { newBlock: newBlock },
			json: true
		};

		requestPromises.push(rp(requestOptions));
	});

	Promise.all(requestPromises)
	.then(data => {
		const requestOptions = {
			uri: bitcoin.currentNodeUrl + '/transaction/broadcast',
			method: 'POST',
			body: {
				amount: bitcoin.miningReward,
				sender: "00",
				recipient: nodeAddress
			},
			json: true
		};

		return rp(requestOptions);
	})
	.then(data => {
		res.json({
			note: "New block mined & broadcast successfully",
			block: newBlock
		});
	});
})

app.post('/receive-new-block', function(req, res) {
    console.log('received new block', req.body.newBlock);
	const newBlock = req.body.newBlock;
	const lastBlock = bitcoin.getLatestBlock();
	const correctHash = lastBlock.hash === newBlock.previousHash; 
    const correctIndex = lastBlock['index'] + 1 === newBlock['index'];
    console.log(lastBlock.hash, newBlock.previousHash);
    

	if (correctHash && correctIndex) {
        console.log('good block');
		bitcoin.chain.push(newBlock);
        bitcoin.pendingTransactions = [];
        bitcoin.pendingDocuments = [];
		res.json({
			note: 'New block received and accepted.',
			newBlock: newBlock
		});
	} else {
		res.json({
			note: 'New block rejected.',
			newBlock: newBlock
		});
	}
});

app.get('/isvalid', (req, res)=>{
    const isValid = bitcoin.isChainValid();
    res.json({
        note: `bitcoin Blockchain is valid? ${isValid}`
    })
})

app.post('/getbalance', (req, res)=>{
    // console.log(req.body.address);
    const balance = bitcoin.getBalanceOfAddress(req.body.address);
    res.json({
        note: `This Address has a Balance of ${balance} bitcoins.`
    })
})

app.get('/getdocuments', (req, res)=>{
    const documents = bitcoin.getDocuments()
    res.json({
        note: `here are your documents`,
        documents: documents
    })
})

//register a node and broadcast that node to the whole network
app.post('/register-and-broadcast-node', function(req, res){
    const newNodeUrl = req.body.newNodeUrl;
    if (bitcoin.networkNodes.indexOf(newNodeUrl) == -1) bitcoin.networkNodes.push(newNodeUrl);

    const regNodesPromises = [];
    bitcoin.networkNodes.forEach(networkNodeUrl =>{
        const requestOptions = {
            uri: networkNodeUrl + '/register-node',
            method: 'POST',
            body: { newNodeUrl: newNodeUrl },
            json: true
        };
        regNodesPromises.push(rp(requestOptions));
    });

    Promise.all(regNodesPromises)
    .then(data=>{
        console.log('hi');
        //use the data
        const bulkRegisterOptions = {
            uri: newNodeUrl + '/register-nodes-bulk',
            method: 'POST',
            body: { allNetworkNodes: [ ...bitcoin.networkNodes, bitcoin.currentNodeUrl ]},
            json: true
        };
        return rp(bulkRegisterOptions);
    })
    .then(data=>{
        res.json({
            note: 'New node registered with network successfully.'
        })
    })
});

//register a node with the network
app.post('/register-node', function(req, res){
    const newNodeUrl = req.body.newNodeUrl;
    const nodeNotAlreadyPresent = bitcoin.networkNodes.indexOf(newNodeUrl) == -1;
    const notCurrentNode = bitcoin.currentNodeUrl !== newNodeUrl;
    if (nodeNotAlreadyPresent && notCurrentNode) {
        bitcoin.networkNodes.push(newNodeUrl);
    } 
    res.json({
        note: 'New node registered successfully'
    });
});

//register multiple nodes at once
app.post('/register-nodes-bulk', function(req, res){
    const allNetworkNodes = req.body.allNetworkNodes
    allNetworkNodes.forEach((networkNodeUrl)=>{
        if (bitcoin.networkNodes.indexOf(networkNodeUrl) == -1 && bitcoin.currentNodeUrl !== networkNodeUrl) {
            bitcoin.networkNodes.push(networkNodeUrl);
        } 
    });
    res.json({
        note: 'Bulk Registration Successful'
    });
});

app.listen(port, ()=>{
    console.log('listening on port', port);
});