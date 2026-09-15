// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DealoraEscrow {
    address public owner;

    struct EscrowRecord {
        bytes32 sowHash;
        address client;
        address freelancer;
        uint256 budget;
        uint256 funded;
        uint256 released;
        uint256 lockedAt;
        bool exists;
    }

    struct Milestone {
        uint256 amount;
        bool submitted;
        bool approved;
        bool paid;
        uint256 submittedAt;
        uint256 approvedAt;
    }

    mapping(string => EscrowRecord) public records;
    mapping(string => mapping(uint256 => Milestone)) public milestones;
    mapping(string => uint256) public milestoneCount;

    event AgreementLocked(string indexed agreementId, bytes32 sowHash, address client, address freelancer, uint256 budget, uint256 lockedAt);
    event Funded(string indexed agreementId, address from, uint256 amount, uint256 totalFunded);
    event MilestoneAdded(string indexed agreementId, uint256 indexed milestoneId, uint256 amount);
    event MilestoneSubmitted(string indexed agreementId, uint256 indexed milestoneId, address freelancer);
    event MilestoneApproved(string indexed agreementId, uint256 indexed milestoneId);
    event MilestonePaid(string indexed agreementId, uint256 indexed milestoneId, address freelancer, uint256 amount);
    event ChangesRequested(string indexed agreementId, uint256 indexed milestoneId);

    modifier onlyClient(string calldata agreementId) {
        require(records[agreementId].client == msg.sender, "only client");
        _;
    }

    modifier onlyFreelancer(string calldata agreementId) {
        require(records[agreementId].freelancer == msg.sender, "only freelancer");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function lockAgreement(string calldata agreementId, bytes32 sowHash, address freelancer, uint256 budget) external {
        require(!records[agreementId].exists, "already locked");
        require(freelancer != address(0), "freelancer required");
        records[agreementId] = EscrowRecord({
            sowHash: sowHash,
            client: msg.sender,
            freelancer: freelancer,
            budget: budget,
            funded: 0,
            released: 0,
            lockedAt: block.timestamp,
            exists: true
        });
        emit AgreementLocked(agreementId, sowHash, msg.sender, freelancer, budget, block.timestamp);
    }

    function fund(string calldata agreementId) external payable onlyClient(agreementId) {
        require(records[agreementId].exists, "not found");
        require(msg.value > 0, "no value");
        records[agreementId].funded += msg.value;
        emit Funded(agreementId, msg.sender, msg.value, records[agreementId].funded);
    }

    function addMilestone(string calldata agreementId, uint256 amount) external onlyClient(agreementId) {
        require(records[agreementId].exists, "not found");
        uint256 id = milestoneCount[agreementId];
        milestones[agreementId][id] = Milestone(amount, false, false, false, 0, 0);
        milestoneCount[agreementId] = id + 1;
        emit MilestoneAdded(agreementId, id, amount);
    }

    function submitMilestone(string calldata agreementId, uint256 milestoneId) external onlyFreelancer(agreementId) {
        Milestone storage m = milestones[agreementId][milestoneId];
        require(m.amount > 0, "not found");
        require(!m.submitted, "already submitted");
        m.submitted = true;
        m.submittedAt = block.timestamp;
        emit MilestoneSubmitted(agreementId, milestoneId, msg.sender);
    }

    function requestChanges(string calldata agreementId, uint256 milestoneId) external onlyClient(agreementId) {
        Milestone storage m = milestones[agreementId][milestoneId];
        require(m.submitted && !m.approved, "not submitted");
        m.submitted = false;
        emit ChangesRequested(agreementId, milestoneId);
    }

    function approveMilestone(string calldata agreementId, uint256 milestoneId) external onlyClient(agreementId) {
        Milestone storage m = milestones[agreementId][milestoneId];
        require(m.submitted && !m.approved, "not submitted");
        require(records[agreementId].funded >= records[agreementId].released + m.amount, "insufficient escrow");
        m.approved = true;
        m.approvedAt = block.timestamp;
        emit MilestoneApproved(agreementId, milestoneId);
        // auto release
        m.paid = true;
        records[agreementId].released += m.amount;
        (bool ok, ) = records[agreementId].freelancer.call{value: m.amount}("");
        require(ok, "transfer failed");
        emit MilestonePaid(agreementId, milestoneId, records[agreementId].freelancer, m.amount);
    }

    function getAgreement(string calldata agreementId) external view returns (bytes32, address, address, uint256, uint256, uint256, uint256, bool) {
        EscrowRecord memory r = records[agreementId];
        return (r.sowHash, r.client, r.freelancer, r.budget, r.funded, r.released, r.lockedAt, r.exists);
    }

    function verify(string calldata agreementId, bytes32 sowHash) external view returns (bool) {
        return records[agreementId].sowHash == sowHash && records[agreementId].exists;
    }
}
