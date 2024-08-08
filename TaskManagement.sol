// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract TaskManagement is Ownable, Pausable, ReentrancyGuard {
    enum TaskStatus { Created, Assigned, InProgress, Completed, Verified, Cancelled }

    struct Task {
        uint256 id;
        string description;
        address creator;
        address assignedTo;
        TaskStatus status;
        uint256 creationTime;
        uint256 completionTime;
        string[] requiredSkills;
        uint256 complexity;
        uint256 reward;
    }

    mapping(uint256 => Task) public tasks;
    uint256 public taskCounter;

    event TaskCreated(uint256 indexed taskId, address indexed creator, string description);
    event TaskAssigned(uint256 indexed taskId, address indexed assignedTo);
    event TaskStatusUpdated(uint256 indexed taskId, TaskStatus newStatus);
    event TaskCompleted(uint256 indexed taskId, address indexed completedBy, uint256 completionTime);

    constructor() {
        _pause(); // Start paused for security
    }

    function createTask(string memory _description, string[] memory _requiredSkills, uint256 _complexity, uint256 _reward) 
        external 
        whenNotPaused 
        nonReentrant 
        returns (uint256) 
    {
        require(bytes(_description).length > 0, "Description cannot be empty");
        require(_requiredSkills.length > 0, "At least one skill is required");
        require(_complexity > 0 && _complexity <= 10, "Complexity must be between 1 and 10");
        
        uint256 taskId = taskCounter++;
        tasks[taskId] = Task({
            id: taskId,
            description: _description,
            creator: msg.sender,
            assignedTo: address(0),
            status: TaskStatus.Created,
            creationTime: block.timestamp,
            completionTime: 0,
            requiredSkills: _requiredSkills,
            complexity: _complexity,
            reward: _reward
        });

        emit TaskCreated(taskId, msg.sender, _description);
        return taskId;
    }

    function assignTask(uint256 _taskId, address _assignedTo) external onlyOwner {
        require(tasks[_taskId].id == _taskId, "Task does not exist");
        require(tasks[_taskId].status == TaskStatus.Created, "Task is not in Created status");
        
        tasks[_taskId].assignedTo = _assignedTo;
        tasks[_taskId].status = TaskStatus.Assigned;
        
        emit TaskAssigned(_taskId, _assignedTo);
        emit TaskStatusUpdated(_taskId, TaskStatus.Assigned);
    }

    function updateTaskStatus(uint256 _taskId, TaskStatus _newStatus) external nonReentrant {
        require(tasks[_taskId].id == _taskId, "Task does not exist");
        require(tasks[_taskId].assignedTo == msg.sender || owner() == msg.sender, "Not authorized");
        require(_newStatus != TaskStatus.Created && _newStatus != TaskStatus.Assigned, "Invalid status update");
        
        if (_newStatus == TaskStatus.Completed) {
            require(tasks[_taskId].status == TaskStatus.InProgress, "Task must be in progress to complete");
            tasks[_taskId].completionTime = block.timestamp;
            emit TaskCompleted(_taskId, msg.sender, block.timestamp);
        }

        tasks[_taskId].status = _newStatus;
        emit TaskStatusUpdated(_taskId, _newStatus);
    }

    function getTaskDetails(uint256 _taskId) external view returns (Task memory) {
        require(tasks[_taskId].id == _taskId, "Task does not exist");
        return tasks[_taskId];
    }

    function getTasksCount() external view returns (uint256) {
        return taskCounter;
    }

    function getTasksByStatus(TaskStatus _status) external view returns (uint256[] memory) {
        uint256[] memory taskIds = new uint256[](taskCounter);
        uint256 count = 0;
        
        for (uint256 i = 0; i < taskCounter; i++) {
            if (tasks[i].status == _status) {
                taskIds[count] = i;
                count++;
            }
        }
        
        // Resize the array to the actual count
        assembly { mstore(taskIds, count) }
        
        return taskIds;
    }

    function cancelTask(uint256 _taskId) external onlyOwner {
        require(tasks[_taskId].id == _taskId, "Task does not exist");
        require(tasks[_taskId].status != TaskStatus.Completed && tasks[_taskId].status != TaskStatus.Verified, "Cannot cancel completed or verified task");
        
        tasks[_taskId].status = TaskStatus.Cancelled;
        emit TaskStatusUpdated(_taskId, TaskStatus.Cancelled);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
