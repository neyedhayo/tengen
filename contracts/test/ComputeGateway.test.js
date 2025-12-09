const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ComputeGateway", function () {
  let computeGateway;
  let owner;
  let bridge;
  let user1;
  let user2;
  let unauthorized;

  const MIN_FEE = ethers.parseEther("0.001"); // 0.001 ETH
  const TASK_TYPE_PRIME_FINDER = 0;
  const TASK_TYPE_MONTE_CARLO = 1;

  beforeEach(async function () {
    // Get signers
    [owner, bridge, user1, user2, unauthorized] = await ethers.getSigners();

    // Deploy contract
    const ComputeGateway = await ethers.getContractFactory("ComputeGateway");
    computeGateway = await ComputeGateway.deploy(MIN_FEE);
    await computeGateway.waitForDeployment();

    // Authorize bridge node
    await computeGateway.connect(owner).authorizeComputeNode(bridge.address);
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await computeGateway.owner()).to.equal(owner.address);
    });

    it("Should set the correct minimum fee", async function () {
      expect(await computeGateway.minFeePerJob()).to.equal(MIN_FEE);
    });

    it("Should initialize nextJobId to 0", async function () {
      expect(await computeGateway.nextJobId()).to.equal(0);
    });

    it("Should initialize statistics to 0", async function () {
      expect(await computeGateway.totalJobsCompleted()).to.equal(0);
      expect(await computeGateway.totalJobsFailed()).to.equal(0);
    });
  });

  describe("Job Submission", function () {
    it("Should submit job with correct fee", async function () {
      const inputData = ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256", "uint256"],
        [1000, 10]
      );

      const tx = await computeGateway.connect(user1).requestCompute(
        TASK_TYPE_PRIME_FINDER,
        inputData,
        { value: MIN_FEE }
      );

      await expect(tx)
        .to.emit(computeGateway, "JobRequested")
        .withArgs(0, user1.address, TASK_TYPE_PRIME_FINDER, inputData, MIN_FEE, await getBlockTimestamp(tx));

      expect(await computeGateway.nextJobId()).to.equal(1);
    });

    it("Should reject job with insufficient fee", async function () {
      const inputData = ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256", "uint256"],
        [1000, 10]
      );

      const insufficientFee = MIN_FEE - 1n;

      await expect(
        computeGateway.connect(user1).requestCompute(
          TASK_TYPE_PRIME_FINDER,
          inputData,
          { value: insufficientFee }
        )
      ).to.be.revertedWithCustomError(computeGateway, "InsufficientFee");
    });

    it("Should accept job with excess fee", async function () {
      const inputData = ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256", "uint256"],
        [1000, 10]
      );

      const excessFee = MIN_FEE * 2n;

      await expect(
        computeGateway.connect(user1).requestCompute(
          TASK_TYPE_PRIME_FINDER,
          inputData,
          { value: excessFee }
        )
      ).to.not.be.reverted;

      const job = await computeGateway.getJob(0);
      expect(job.fee).to.equal(excessFee);
    });

    it("Should increment jobId correctly", async function () {
      const inputData = ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256", "uint256"],
        [1000, 10]
      );

      await computeGateway.connect(user1).requestCompute(
        TASK_TYPE_PRIME_FINDER,
        inputData,
        { value: MIN_FEE }
      );

      await computeGateway.connect(user2).requestCompute(
        TASK_TYPE_MONTE_CARLO,
        inputData,
        { value: MIN_FEE }
      );

      expect(await computeGateway.nextJobId()).to.equal(2);
    });

    it("Should store job data correctly", async function () {
      const inputData = ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256", "uint256"],
        [1000, 10]
      );

      await computeGateway.connect(user1).requestCompute(
        TASK_TYPE_PRIME_FINDER,
        inputData,
        { value: MIN_FEE }
      );

      const job = await computeGateway.getJob(0);
      expect(job.requester).to.equal(user1.address);
      expect(job.taskType).to.equal(TASK_TYPE_PRIME_FINDER);
      expect(job.inputData).to.equal(inputData);
      expect(job.fee).to.equal(MIN_FEE);
      expect(job.status).to.equal(0); // Pending
      expect(job.resultData).to.equal("0x");
      expect(job.resultHash).to.equal(ethers.ZeroHash);
    });
  });

  describe("Result Submission", function () {
    let jobId;
    const inputData = ethers.AbiCoder.defaultAbiCoder().encode(
      ["uint256", "uint256"],
      [1000, 10]
    );
    const resultData = ethers.AbiCoder.defaultAbiCoder().encode(
      ["uint256"],
      [1033]
    );

    beforeEach(async function () {
      const tx = await computeGateway.connect(user1).requestCompute(
        TASK_TYPE_PRIME_FINDER,
        inputData,
        { value: MIN_FEE }
      );
      await tx.wait();
      jobId = 0;
    });

    it("Should allow authorized node to submit result", async function () {
      const tx = await computeGateway.connect(bridge).submitResult(jobId, resultData);

      const resultHash = ethers.keccak256(resultData);

      await expect(tx)
        .to.emit(computeGateway, "JobCompleted")
        .withArgs(jobId, resultHash, resultData, bridge.address, await getBlockTimestamp(tx));

      const job = await computeGateway.getJob(jobId);
      expect(job.status).to.equal(2); // Completed
      expect(job.resultData).to.equal(resultData);
      expect(job.resultHash).to.equal(resultHash);
      expect(job.computeProvider).to.equal(bridge.address);
      expect(await computeGateway.totalJobsCompleted()).to.equal(1);
    });

    it("Should reject result from unauthorized address", async function () {
      await expect(
        computeGateway.connect(unauthorized).submitResult(jobId, resultData)
      ).to.be.revertedWithCustomError(computeGateway, "NotAuthorizedComputeNode");
    });

    it("Should reject result for non-existent job", async function () {
      const nonExistentJobId = 999;
      await expect(
        computeGateway.connect(bridge).submitResult(nonExistentJobId, resultData)
      ).to.be.revertedWithCustomError(computeGateway, "JobDoesNotExist");
    });

    it("Should reject duplicate result submission", async function () {
      await computeGateway.connect(bridge).submitResult(jobId, resultData);

      await expect(
        computeGateway.connect(bridge).submitResult(jobId, resultData)
      ).to.be.revertedWithCustomError(computeGateway, "JobAlreadyCompleted");
    });

    it("Should not allow result submission for failed job", async function () {
      await computeGateway.connect(bridge).markJobFailed(jobId, "Test failure");

      await expect(
        computeGateway.connect(bridge).submitResult(jobId, resultData)
      ).to.be.revertedWithCustomError(computeGateway, "JobAlreadyFailed");
    });
  });

  describe("Job Failure", function () {
    let jobId;
    const inputData = ethers.AbiCoder.defaultAbiCoder().encode(
      ["uint256", "uint256"],
      [1000, 10]
    );

    beforeEach(async function () {
      const tx = await computeGateway.connect(user1).requestCompute(
        TASK_TYPE_PRIME_FINDER,
        inputData,
        { value: MIN_FEE }
      );
      await tx.wait();
      jobId = 0;
    });

    it("Should allow authorized node to mark job as failed", async function () {
      const reason = "Qubic network timeout";
      const tx = await computeGateway.connect(bridge).markJobFailed(jobId, reason);

      await expect(tx)
        .to.emit(computeGateway, "JobFailed")
        .withArgs(jobId, reason, bridge.address, await getBlockTimestamp(tx));

      const job = await computeGateway.getJob(jobId);
      expect(job.status).to.equal(3); // Failed
      expect(job.computeProvider).to.equal(bridge.address);
      expect(await computeGateway.totalJobsFailed()).to.equal(1);
    });

    it("Should reject failure marking from unauthorized address", async function () {
      await expect(
        computeGateway.connect(unauthorized).markJobFailed(jobId, "Test")
      ).to.be.revertedWithCustomError(computeGateway, "NotAuthorizedComputeNode");
    });

    it("Should not allow marking completed job as failed", async function () {
      const resultData = ethers.AbiCoder.defaultAbiCoder().encode(["uint256"], [1033]);
      await computeGateway.connect(bridge).submitResult(jobId, resultData);

      await expect(
        computeGateway.connect(bridge).markJobFailed(jobId, "Test")
      ).to.be.revertedWithCustomError(computeGateway, "JobAlreadyCompleted");
    });
  });

  describe("Admin Functions", function () {
    describe("Compute Node Authorization", function () {
      it("Should allow owner to authorize compute node", async function () {
        const newNode = user2.address;
        const tx = await computeGateway.connect(owner).authorizeComputeNode(newNode);

        await expect(tx)
          .to.emit(computeGateway, "ComputeNodeAuthorized")
          .withArgs(newNode, await getBlockTimestamp(tx));

        expect(await computeGateway.isAuthorizedNode(newNode)).to.be.true;
      });

      it("Should allow owner to revoke compute node", async function () {
        const tx = await computeGateway.connect(owner).revokeComputeNode(bridge.address);

        await expect(tx)
          .to.emit(computeGateway, "ComputeNodeRevoked")
          .withArgs(bridge.address, await getBlockTimestamp(tx));

        expect(await computeGateway.isAuthorizedNode(bridge.address)).to.be.false;
      });

      it("Should reject authorization from non-owner", async function () {
        await expect(
          computeGateway.connect(user1).authorizeComputeNode(user2.address)
        ).to.be.revertedWithCustomError(computeGateway, "OwnableUnauthorizedAccount");
      });
    });

    describe("Fee Management", function () {
      it("Should allow owner to update minimum fee", async function () {
        const newFee = ethers.parseEther("0.002");
        const tx = await computeGateway.connect(owner).updateMinFee(newFee);

        await expect(tx)
          .to.emit(computeGateway, "MinFeeUpdated")
          .withArgs(MIN_FEE, newFee, await getBlockTimestamp(tx));

        expect(await computeGateway.minFeePerJob()).to.equal(newFee);
      });

      it("Should reject fee update from non-owner", async function () {
        const newFee = ethers.parseEther("0.002");
        await expect(
          computeGateway.connect(user1).updateMinFee(newFee)
        ).to.be.revertedWithCustomError(computeGateway, "OwnableUnauthorizedAccount");
      });
    });

    describe("Fee Withdrawal", function () {
      beforeEach(async function () {
        // Submit some jobs to accumulate fees
        const inputData = ethers.AbiCoder.defaultAbiCoder().encode(
          ["uint256", "uint256"],
          [1000, 10]
        );

        await computeGateway.connect(user1).requestCompute(
          TASK_TYPE_PRIME_FINDER,
          inputData,
          { value: MIN_FEE }
        );

        await computeGateway.connect(user2).requestCompute(
          TASK_TYPE_MONTE_CARLO,
          inputData,
          { value: MIN_FEE }
        );
      });

      it("Should allow owner to withdraw fees", async function () {
        const contractBalance = await ethers.provider.getBalance(await computeGateway.getAddress());
        const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);

        const tx = await computeGateway.connect(owner).withdrawFees();
        const receipt = await tx.wait();
        const gasUsed = receipt.gasUsed * receipt.gasPrice;

        await expect(tx)
          .to.emit(computeGateway, "FeesWithdrawn")
          .withArgs(owner.address, contractBalance, await getBlockTimestamp(tx));

        const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);
        expect(ownerBalanceAfter).to.equal(ownerBalanceBefore + contractBalance - gasUsed);

        const finalContractBalance = await ethers.provider.getBalance(await computeGateway.getAddress());
        expect(finalContractBalance).to.equal(0);
      });

      it("Should reject withdrawal from non-owner", async function () {
        await expect(
          computeGateway.connect(user1).withdrawFees()
        ).to.be.revertedWithCustomError(computeGateway, "OwnableUnauthorizedAccount");
      });

      it("Should reject withdrawal when no fees available", async function () {
        await computeGateway.connect(owner).withdrawFees();

        await expect(
          computeGateway.connect(owner).withdrawFees()
        ).to.be.revertedWithCustomError(computeGateway, "NoFeesToWithdraw");
      });
    });
  });

  describe("View Functions", function () {
    let jobId;
    const inputData = ethers.AbiCoder.defaultAbiCoder().encode(
      ["uint256", "uint256"],
      [1000, 10]
    );

    beforeEach(async function () {
      const tx = await computeGateway.connect(user1).requestCompute(
        TASK_TYPE_PRIME_FINDER,
        inputData,
        { value: MIN_FEE }
      );
      await tx.wait();
      jobId = 0;
    });

    it("Should return correct job status", async function () {
      expect(await computeGateway.getJobStatus(jobId)).to.equal(0); // Pending

      const resultData = ethers.AbiCoder.defaultAbiCoder().encode(["uint256"], [1033]);
      await computeGateway.connect(bridge).submitResult(jobId, resultData);

      expect(await computeGateway.getJobStatus(jobId)).to.equal(2); // Completed
    });

    it("Should return job result for completed job", async function () {
      const resultData = ethers.AbiCoder.defaultAbiCoder().encode(["uint256"], [1033]);
      await computeGateway.connect(bridge).submitResult(jobId, resultData);

      expect(await computeGateway.getJobResult(jobId)).to.equal(resultData);
    });

    it("Should reject getting result for pending job", async function () {
      await expect(
        computeGateway.getJobResult(jobId)
      ).to.be.revertedWithCustomError(computeGateway, "InvalidJobStatus");
    });

    it("Should return correct statistics", async function () {
      const resultData = ethers.AbiCoder.defaultAbiCoder().encode(["uint256"], [1033]);
      await computeGateway.connect(bridge).submitResult(jobId, resultData);

      const tx = await computeGateway.connect(user2).requestCompute(
        TASK_TYPE_MONTE_CARLO,
        inputData,
        { value: MIN_FEE }
      );
      await tx.wait();

      await computeGateway.connect(bridge).markJobFailed(1, "Test failure");

      const [nextId, completed, failed, minFee] = await computeGateway.getStats();
      expect(nextId).to.equal(2);
      expect(completed).to.equal(1);
      expect(failed).to.equal(1);
      expect(minFee).to.equal(MIN_FEE);
    });
  });

  // Helper function to get block timestamp
  async function getBlockTimestamp(tx) {
    const receipt = await tx.wait();
    const block = await ethers.provider.getBlock(receipt.blockNumber);
    return block.timestamp;
  }
});
