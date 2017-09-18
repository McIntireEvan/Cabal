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
     * Generates the hardcoded initial block
     */
    generateGenesisBlock() {
        return new Block(0, "Genesis Block", 1505691963, "",
            "52b36609ba32c196688c42caca87bd03033b1d7af24f052885abe61d9ce3ad3c");
    }

    addData(key, data) {
        if(this.locked) {
            return false;
        }

        pendingData[key] = data;
        return true;
    }

    generateBlock() {
        if(Object.keys(this.pendingData).length == 0) {
            return false;
        }
        this.locked = true;

        var timestamp = (new Date().getTime) / 1000
        var index = this.blocks.length;
        var prevHash = this.blocks[index - 1].hash;
        var hash = this.hashBlock(index, pendingData, timestamp, prevHash);
        var newBlock = new Block(index, pendingData, timestamp, prevHash, hash);

        this.blocks.push(newBlock);
        pendingData = {};

        this.locked = false;
    }

    hashBlock(index, data, timestamp, prevHash) {
        return SHA256(index + data + timestamp + prevHash).toString();
    }

    verifyBlock(oldBlock, newBlock) {

    }

    replaceChain() {

    }
}