// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DealoraAgreement {
    address public owner;

    struct Record {
        bytes32 sowHash;
        address client;
        address freelancer;
        uint256 budget;
        uint256 lockedAt;
        bool exists;
    }

    mapping(string => Record) public records;
    mapping(string => string) public txHashes;

    event AgreementLocked(string indexed agreementId, bytes32 sowHash, address client, address freelancer, uint256 budget, uint256 lockedAt, string txHash);

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function lockAgreement(string calldata agreementId, bytes32 sowHash, address freelancer, uint256 budget) external {
        require(!records[agreementId].exists, "already locked");
        require(freelancer != address(0), "freelancer required");
        records[agreementId] = Record({
            sowHash: sowHash,
            client: msg.sender,
            freelancer: freelancer,
            budget: budget,
            lockedAt: block.timestamp,
            exists: true
        });
        emit AgreementLocked(agreementId, sowHash, msg.sender, freelancer, budget, block.timestamp, "");
    }

    function getAgreement(string calldata agreementId) external view returns (bytes32, address, address, uint256, uint256, bool) {
        Record memory r = records[agreementId];
        return (r.sowHash, r.client, r.freelancer, r.budget, r.lockedAt, r.exists);
    }

    function verify(string calldata agreementId, bytes32 sowHash) external view returns (bool) {
        return records[agreementId].sowHash == sowHash && records[agreementId].exists;
    }
}
