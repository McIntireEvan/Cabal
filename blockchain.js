var SHA256 = require("crypto-js/sha256");

/**
 * Basic data structure to hold all of a block's data in one place
 */
class Block {

    /**
     * Initializes a block with all the relevant data
     * @param {number} index Position in the blockchain
     * @param {Object} data JSON Object holding transaction data
     * @param {number} timestamp Timestamp of block creation
     * @param {String} prevHash The SHA256 hash of the previous block
     * @param {String} hash The SHA256 hash of the rest of the data
     */
    constructor(index, data, timestamp, prevHash, hash) {
        this.index = index;
        this.data = data;
        this.timestamp = timestamp;
        this.prevHash = prevHash;
        this.hash = hash;
    }
}

/**
 * Contains core logic and data for the Blockchain
 */
class BlockChain {
    constructor() {
        this.blocks = [this.generateGenesisBlock()];
        this.locked = false;
        this.pendingData = {};

        // Attempts to generate a block every 30 seconds for debug/proof of concept
        setInterval(this.generateBlock(), 30 * 1000);
    }

    /**
     * Generates the hardcoded genesis block
     */
    generateGenesisBlock() {
        return new Block(0, "Genesis Block", 1505691963, "",
            "52b36609ba32c196688c42caca87bd03033b1d7af24f052885abe61d9ce3ad3c");
    }

    /**
     * Attempts to add data that will be processed into the next block
     * @param {String} key
     * @param {Object} data
     */
    addData(key, data) {
        if(this.locked) {
            return false;
        }

        //TODO: Verify data
        pendingData[key] = data;
        return true;
    }

    /**
     * Generates a new block using the pending data
     */
    generateBlock() {
        // Fail instantly if we have no data
        if(Object.keys(this.pendingData).length == 0) {
            return false;
        }
        // Prevent new data from being added while we do this
        this.locked = true;

        //Gather all the necessary data and metadata
        var timestamp = (new Date().getTime) / 1000
        var index = this.blocks.length;
        var prevHash = this.blocks[index - 1].hash;
        var hash = this.hashBlock(index, pendingData, timestamp, prevHash);
        var newBlock = new Block(index, pendingData, timestamp, prevHash, hash);

        this.blocks.push(newBlock);
        pendingData = {};

        this.locked = false;
    }

    /**
     * Generates the hash for a block based on the other metadata
     * @param {Number} index
     * @param {Object} data
     * @param {Number} timestamp
     * @param {String} prevHash
     */
    hashBlock(index, data, timestamp, prevHash) {
        return SHA256(index + data + timestamp + prevHash).toString();
    }

    /**
     * Attempts to add a block from a peer
     * @param {Block} block
     */
    addPeerBlock(block) {
        if(verifyBlock(this.blocks[this.blocks.length - 1], block)) {
            this.blocks.push(newBlock);
        } else {
            //TODO: Error handling, request chain
        }
    }

    /**
     * Verifies that the index and previousHash of a block are valid
     * @param {Block} oldBlock The older block
     * @param {Block} newBlock The newer block
     */
    verifyBlock(oldBlock, newBlock) {
        if(newBlock.index != oldBlock.index + 1) {
            return false;
        }

        if(newBlock.prevHash != oldBlock.hash) {
            return false;
        }

        return true;
    }

    /**
     * Verifies that all the blocks in a chain are valid
     * @param {BlockChain} otherChain
     */
    verifyChain(otherChain) {
        for(var i = otherChain.length - 1; i > 1; i--) {
            if(!verifyBlock(otherChain.blocks[i-1], otherChain.blocks[i])) {
                return false;
            }
        }

        if(otherChain.blocks[0] != this.generateGenesisBlock()) {
            return false;
        }

        return true;
    }

    /**
     * Very naive chain replacement method
     * If the other chain is longer, accept it. Otherwise, don't.
     * @param {BlockChain} otherChain
     */
    replaceChain(otherChain) {
        if(otherChain.blocks.length < this.blocks.length) {
            return false;
        }

        if(!verifyChain(otherChain)) {
            return false;
        }

        if(otherChain.blocks.length > this.blocks.length) {
            this.blocks = otherChain.blocks;

            cleanData(this.blocks[this.blocks.length - 1]);
            return true;
        }
    }

    /**
     * Cleans pending data that was already included in a block
     * @param {Block} block
     */
    cleanData(block) {
        for(var key in this.pendingData.keys) {
            if(pendingData.hasOwnProperty(key)) {
                for(var cKey in block.data) {
                    if(block.data.hasOwnProperty(cKey)) {
                        if(pendingData[key] == block.data[cKey] && key == cKey) {
                            delete pendingData[key];
                        }
                    }
                }
            }
        }
    }
}