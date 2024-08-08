// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract AgentRegistration is Ownable, Pausable, ReentrancyGuard {
    struct Agent {
        string agentType;
        address agentAddress;
        uint256 reputation;
        bool isActive;
        uint256 registrationTime;
        uint256 lastActivityTime;
    }

    mapping(address => Agent) public agents;
    address[] public agentList;
    mapping(string => uint256) public agentTypeCount;

    uint256 public constant MAX_REPUTATION = 1000;
    uint256 public constant MIN_REPUTATION = 0;

    event AgentRegistered(address indexed agentAddress, string agentType);
    event AgentUpdated(address indexed agentAddress, string agentType, uint256 newReputation);
    event AgentDeactivated(address indexed agentAddress);
    event AgentReactivated(address indexed agentAddress);

    constructor() {
        _pause(); // Start paused for security
    }

    function registerAgent(string memory _agentType) external whenNotPaused nonReentrant {
        require(agents[msg.sender].agentAddress == address(0), "Agent already registered");
        require(bytes(_agentType).length > 0, "Agent type cannot be empty");
        
        agents[msg.sender] = Agent({
            agentType: _agentType,
            agentAddress: msg.sender,
            reputation: 100,
            isActive: true,
            registrationTime: block.timestamp,
            lastActivityTime: block.timestamp
        });
        
        agentList.push(msg.sender);
        agentTypeCount[_agentType]++;
        
        emit AgentRegistered(msg.sender, _agentType);
    }

    function updateAgentReputation(address _agentAddress, uint256 _newReputation) external onlyOwner {
        require(agents[_agentAddress].agentAddress != address(0), "Agent not registered");
        require(_newReputation >= MIN_REPUTATION && _newReputation <= MAX_REPUTATION, "Invalid reputation value");

        agents[_agentAddress].reputation = _newReputation;
        agents[_agentAddress].lastActivityTime = block.timestamp;

        emit AgentUpdated(_agentAddress, agents[_agentAddress].agentType, _newReputation);
    }

    function deactivateAgent(address _agentAddress) external onlyOwner {
        require(agents[_agentAddress].isActive, "Agent already inactive");
        agents[_agentAddress].isActive = false;
        agentTypeCount[agents[_agentAddress].agentType]--;
        emit AgentDeactivated(_agentAddress);
    }

    function reactivateAgent(address _agentAddress) external onlyOwner {
        require(!agents[_agentAddress].isActive, "Agent already active");
        agents[_agentAddress].isActive = true;
        agentTypeCount[agents[_agentAddress].agentType]++;
        emit AgentReactivated(_agentAddress);
    }

    function getAgentDetails(address _agentAddress) external view returns (Agent memory) {
        return agents[_agentAddress];
    }

    function getAgentCount() external view returns (uint256) {
        return agentList.length;
    }

    function getActiveAgentCount() public view returns (uint256) {
        uint256 activeCount = 0;
        for (uint i = 0; i < agentList.length; i++) {
            if (agents[agentList[i]].isActive) {
                activeCount++;
            }
        }
        return activeCount;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
