// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ComputeGateway
 * @notice Gateway contract for submitting compute jobs to Qubic network
 * @dev Trustless compute coprocessor connecting Ethereum to Qubic's bare-metal execution
 */
contract ComputeGateway is Ownable, ReentrancyGuard {

    // ========== ENUMS ==========

    enum JobStatus {
        Pending,      // Job submitted to Ethereum, waiting for bridge
        Processing,   // Bridge picked up job, executing on Qubic
        Completed,    // Result submitted back to Ethereum
        Failed        // Error occurred during execution
    }

    // ========== STRUCTS ==========

    struct Job {
        address requester;           // Address that submitted the job
        uint8 taskType;             // Type of computation (0=PrimeFinder, 1=MonteCarlo, etc.)
        bytes inputData;            // Encoded input parameters
        uint256 fee;                // Fee paid for computation
        JobStatus status;           // Current job status
        bytes resultData;           // Encoded result (empty until completed)
        bytes32 resultHash;         // Hash of result for verification
        uint256 submittedAt;        // Timestamp when job was submitted
        uint256 completedAt;        // Timestamp when job was completed
        address computeProvider;    // Bridge node that executed the job
    }

    // ========== STATE VARIABLES ==========

    // Job storage
    mapping(uint256 => Job) public jobs;
    uint256 public nextJobId;

    // Fee configuration
    uint256 public minFeePerJob;

    // Authorized compute nodes (bridge agents)
    mapping(address => bool) public authorizedComputeNodes;

    // Statistics
    uint256 public totalJobsCompleted;
    uint256 public totalJobsFailed;

    // ========== EVENTS ==========

    event JobRequested(
        uint256 indexed jobId,
        address indexed requester,
        uint8 taskType,
        bytes inputData,
        uint256 fee,
        uint256 timestamp
    );

    event JobCompleted(
        uint256 indexed jobId,
        bytes32 resultHash,
        bytes resultData,
        address indexed computeProvider,
        uint256 timestamp
    );

    event JobFailed(
        uint256 indexed jobId,
        string reason,
        address indexed computeProvider,
        uint256 timestamp
    );

    event ComputeNodeAuthorized(address indexed node, uint256 timestamp);
    event ComputeNodeRevoked(address indexed node, uint256 timestamp);
    event MinFeeUpdated(uint256 oldFee, uint256 newFee, uint256 timestamp);
    event FeesWithdrawn(address indexed owner, uint256 amount, uint256 timestamp);

    // ========== ERRORS ==========

    error InsufficientFee(uint256 required, uint256 provided);
    error JobDoesNotExist(uint256 jobId);
    error JobAlreadyCompleted(uint256 jobId);
    error JobAlreadyFailed(uint256 jobId);
    error NotAuthorizedComputeNode(address caller);
    error InvalidJobStatus(uint256 jobId, JobStatus currentStatus);
    error NoFeesToWithdraw();
    error WithdrawalFailed();

    // ========== CONSTRUCTOR ==========

    constructor(uint256 _minFeePerJob) Ownable(msg.sender) {
        minFeePerJob = _minFeePerJob;
    }

    // ========== EXTERNAL FUNCTIONS ==========

    /**
     * @notice Submit a compute job request
     * @param taskType Type of computation to perform
     * @param inputData Encoded input parameters for the computation
     * @return jobId The unique identifier for this job
     */
    function requestCompute(
        uint8 taskType,
        bytes calldata inputData
    ) external payable nonReentrant returns (uint256 jobId) {
        // Validate fee
        if (msg.value < minFeePerJob) {
            revert InsufficientFee(minFeePerJob, msg.value);
        }

        // Create new job
        jobId = nextJobId++;

        jobs[jobId] = Job({
            requester: msg.sender,
            taskType: taskType,
            inputData: inputData,
            fee: msg.value,
            status: JobStatus.Pending,
            resultData: "",
            resultHash: bytes32(0),
            submittedAt: block.timestamp,
            completedAt: 0,
            computeProvider: address(0)
        });

        emit JobRequested(
            jobId,
            msg.sender,
            taskType,
            inputData,
            msg.value,
            block.timestamp
        );
    }

    /**
     * @notice Submit result for a compute job (called by authorized bridge)
     * @param jobId The job identifier
     * @param resultData The encoded result data
     */
    function submitResult(
        uint256 jobId,
        bytes calldata resultData
    ) external nonReentrant {
        // Verify caller is authorized
        if (!authorizedComputeNodes[msg.sender]) {
            revert NotAuthorizedComputeNode(msg.sender);
        }

        // Verify job exists
        if (jobId >= nextJobId) {
            revert JobDoesNotExist(jobId);
        }

        Job storage job = jobs[jobId];

        // Verify job status
        if (job.status == JobStatus.Completed) {
            revert JobAlreadyCompleted(jobId);
        }
        if (job.status == JobStatus.Failed) {
            revert JobAlreadyFailed(jobId);
        }

        // Update job
        job.status = JobStatus.Completed;
        job.resultData = resultData;
        job.resultHash = keccak256(resultData);
        job.completedAt = block.timestamp;
        job.computeProvider = msg.sender;

        totalJobsCompleted++;

        emit JobCompleted(
            jobId,
            job.resultHash,
            resultData,
            msg.sender,
            block.timestamp
        );
    }

    /**
     * @notice Mark a job as failed (called by authorized bridge)
     * @param jobId The job identifier
     * @param reason Reason for failure
     */
    function markJobFailed(
        uint256 jobId,
        string calldata reason
    ) external nonReentrant {
        // Verify caller is authorized
        if (!authorizedComputeNodes[msg.sender]) {
            revert NotAuthorizedComputeNode(msg.sender);
        }

        // Verify job exists
        if (jobId >= nextJobId) {
            revert JobDoesNotExist(jobId);
        }

        Job storage job = jobs[jobId];

        // Verify job status
        if (job.status == JobStatus.Completed) {
            revert JobAlreadyCompleted(jobId);
        }
        if (job.status == JobStatus.Failed) {
            revert JobAlreadyFailed(jobId);
        }

        // Update job
        job.status = JobStatus.Failed;
        job.completedAt = block.timestamp;
        job.computeProvider = msg.sender;

        totalJobsFailed++;

        emit JobFailed(jobId, reason, msg.sender, block.timestamp);
    }

    // ========== ADMIN FUNCTIONS ==========

    /**
     * @notice Authorize a compute node (bridge agent)
     * @param node Address to authorize
     */
    function authorizeComputeNode(address node) external onlyOwner {
        authorizedComputeNodes[node] = true;
        emit ComputeNodeAuthorized(node, block.timestamp);
    }

    /**
     * @notice Revoke authorization from a compute node
     * @param node Address to revoke
     */
    function revokeComputeNode(address node) external onlyOwner {
        authorizedComputeNodes[node] = false;
        emit ComputeNodeRevoked(node, block.timestamp);
    }

    /**
     * @notice Update minimum fee per job
     * @param newMinFee New minimum fee in wei
     */
    function updateMinFee(uint256 newMinFee) external onlyOwner {
        uint256 oldFee = minFeePerJob;
        minFeePerJob = newMinFee;
        emit MinFeeUpdated(oldFee, newMinFee, block.timestamp);
    }

    /**
     * @notice Withdraw accumulated fees (owner only)
     */
    function withdrawFees() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;

        if (balance == 0) {
            revert NoFeesToWithdraw();
        }

        (bool success, ) = payable(owner()).call{value: balance}("");
        if (!success) {
            revert WithdrawalFailed();
        }

        emit FeesWithdrawn(owner(), balance, block.timestamp);
    }

    // ========== VIEW FUNCTIONS ==========

    /**
     * @notice Get job details
     * @param jobId The job identifier
     * @return job The complete job struct
     */
    function getJob(uint256 jobId) external view returns (Job memory job) {
        if (jobId >= nextJobId) {
            revert JobDoesNotExist(jobId);
        }
        return jobs[jobId];
    }

    /**
     * @notice Get job status
     * @param jobId The job identifier
     * @return status Current job status
     */
    function getJobStatus(uint256 jobId) external view returns (JobStatus status) {
        if (jobId >= nextJobId) {
            revert JobDoesNotExist(jobId);
        }
        return jobs[jobId].status;
    }

    /**
     * @notice Get job result (only for completed jobs)
     * @param jobId The job identifier
     * @return resultData The result bytes
     */
    function getJobResult(uint256 jobId) external view returns (bytes memory resultData) {
        if (jobId >= nextJobId) {
            revert JobDoesNotExist(jobId);
        }

        Job memory job = jobs[jobId];
        if (job.status != JobStatus.Completed) {
            revert InvalidJobStatus(jobId, job.status);
        }

        return job.resultData;
    }

    /**
     * @notice Check if address is authorized compute node
     * @param node Address to check
     * @return isAuthorized True if authorized
     */
    function isAuthorizedNode(address node) external view returns (bool isAuthorized) {
        return authorizedComputeNodes[node];
    }

    /**
     * @notice Get contract statistics
     * @return _nextJobId Next job ID to be assigned
     * @return _totalCompleted Total completed jobs
     * @return _totalFailed Total failed jobs
     * @return _minFee Minimum fee per job
     */
    function getStats() external view returns (
        uint256 _nextJobId,
        uint256 _totalCompleted,
        uint256 _totalFailed,
        uint256 _minFee
    ) {
        return (nextJobId, totalJobsCompleted, totalJobsFailed, minFeePerJob);
    }
}
