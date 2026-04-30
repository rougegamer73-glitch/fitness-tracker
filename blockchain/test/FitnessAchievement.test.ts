import { expect } from "chai";
import { ethers } from "hardhat";

describe("FitnessAchievement", function () {
  async function deployFitnessAchievement() {
    const [owner] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("FitnessAchievement");
    const contract = await Factory.deploy();
    await contract.deployed();
    return { contract, owner };
  }

  it("logs workout on-chain", async function () {
    const { contract, owner } = await deployFitnessAchievement();

    await expect(contract.logWorkout("Running", 3000, 220, 30)).to.emit(
      contract,
      "WorkoutLogged"
    );

    expect(await contract.getWorkoutCount(owner.address)).to.equal(1);
    const workouts = await contract.getWorkouts(owner.address);
    expect(workouts[0].exerciseType).to.equal("Running");
  });

  it("returns user stats", async function () {
    const { contract, owner } = await deployFitnessAchievement();

    await contract.logWorkout("Walking", 4000, 180, 40);
    await contract.logWorkout("Cycling", 2000, 150, 25);

    const stats = await contract.getUserStats(owner.address);
    expect(stats[0]).to.equal(2);
    expect(stats[1]).to.equal(6000);
    expect(stats[2]).to.equal(330);
    expect(stats[3]).to.equal(65);
  });

  it("auto-claims FIRST_WORKOUT", async function () {
    const { contract, owner } = await deployFitnessAchievement();
    await contract.logWorkout("Gym", 1000, 80, 20);

    expect(await contract.hasAchievement(owner.address, "FIRST_WORKOUT")).to.equal(true);
    expect(await contract.getRewardBalance(owner.address)).to.equal(10);
  });

  it("auto-claims TEN_THOUSAND_STEPS", async function () {
    const { contract, owner } = await deployFitnessAchievement();
    await contract.logWorkout("Running", 10000, 200, 45);

    expect(await contract.hasAchievement(owner.address, "TEN_THOUSAND_STEPS")).to.equal(true);
    expect(await contract.getRewardBalance(owner.address)).to.equal(35);
  });

  it("prevents duplicate manual claim", async function () {
    const { contract } = await deployFitnessAchievement();
    await contract.logWorkout("Walking", 2000, 100, 20);

    await expect(contract.claimAchievement("FIRST_WORKOUT")).to.be.revertedWith("Already claimed");
  });

  it("updates reward balance for all earned achievements", async function () {
    const { contract, owner } = await deployFitnessAchievement();
    await contract.logWorkout("Running", 10000, 500, 60);

    expect(await contract.hasAchievement(owner.address, "FIRST_WORKOUT")).to.equal(true);
    expect(await contract.hasAchievement(owner.address, "TEN_THOUSAND_STEPS")).to.equal(true);
    expect(await contract.hasAchievement(owner.address, "FIVE_HUNDRED_CALORIES")).to.equal(true);
    expect(await contract.getRewardBalance(owner.address)).to.equal(55);
  });
});
