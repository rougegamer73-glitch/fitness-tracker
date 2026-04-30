// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract FitnessAchievement {
    struct Workout {
        string exerciseType;
        uint256 steps;
        uint256 calories;
        uint256 durationMinutes;
        uint256 timestamp;
    }

    mapping(address => Workout[]) private workouts;
    mapping(address => uint256) private rewardBalances;
    mapping(address => string[]) private achievements;
    mapping(address => mapping(string => bool)) private claimedAchievements;

    event WorkoutLogged(
        address indexed user,
        string exerciseType,
        uint256 steps,
        uint256 calories,
        uint256 durationMinutes,
        uint256 timestamp
    );

    event AchievementClaimed(
        address indexed user,
        string achievementCode,
        uint256 reward
    );

    function logWorkout(
        string memory exerciseType,
        uint256 steps,
        uint256 calories,
        uint256 durationMinutes
    ) public {
        require(durationMinutes > 0, "Duration must be greater than zero");

        workouts[msg.sender].push(
            Workout({
                exerciseType: exerciseType,
                steps: steps,
                calories: calories,
                durationMinutes: durationMinutes,
                timestamp: block.timestamp
            })
        );

        emit WorkoutLogged(
            msg.sender,
            exerciseType,
            steps,
            calories,
            durationMinutes,
            block.timestamp
        );

        _autoClaimIfEligible(msg.sender, "FIRST_WORKOUT");
        _autoClaimIfEligible(msg.sender, "TEN_THOUSAND_STEPS");
        _autoClaimIfEligible(msg.sender, "FIVE_HUNDRED_CALORIES");
    }

    function claimAchievement(string memory achievementCode) public {
        require(
            !claimedAchievements[msg.sender][achievementCode],
            "Already claimed"
        );
        require(
            isEligibleForAchievement(msg.sender, achievementCode),
            "Not eligible"
        );

        uint256 reward = getRewardForAchievement(achievementCode);
        require(reward > 0, "Invalid achievement");

        claimedAchievements[msg.sender][achievementCode] = true;
        achievements[msg.sender].push(achievementCode);
        rewardBalances[msg.sender] += reward;

        emit AchievementClaimed(msg.sender, achievementCode, reward);
    }

    function getWorkouts(address user) public view returns (Workout[] memory) {
        return workouts[user];
    }

    function getWorkoutCount(address user) public view returns (uint256) {
        return workouts[user].length;
    }

    function getUserStats(
        address user
    )
        public
        view
        returns (
            uint256 totalWorkouts,
            uint256 totalSteps,
            uint256 totalCalories,
            uint256 totalDurationMinutes
        )
    {
        Workout[] memory userWorkouts = workouts[user];
        totalWorkouts = userWorkouts.length;

        for (uint256 i = 0; i < userWorkouts.length; i++) {
            totalSteps += userWorkouts[i].steps;
            totalCalories += userWorkouts[i].calories;
            totalDurationMinutes += userWorkouts[i].durationMinutes;
        }
    }

    function getRewardBalance(address user) public view returns (uint256) {
        return rewardBalances[user];
    }

    function getUserAchievements(
        address user
    ) public view returns (string[] memory) {
        return achievements[user];
    }

    function hasAchievement(
        address user,
        string memory achievementCode
    ) public view returns (bool) {
        return claimedAchievements[user][achievementCode];
    }

    function getRewardForAchievement(
        string memory achievementCode
    ) public pure returns (uint256) {
        bytes32 code = keccak256(abi.encodePacked(achievementCode));

        if (code == keccak256(abi.encodePacked("FIRST_WORKOUT"))) {
            return 10;
        }

        if (code == keccak256(abi.encodePacked("TEN_THOUSAND_STEPS"))) {
            return 25;
        }

        if (code == keccak256(abi.encodePacked("FIVE_HUNDRED_CALORIES"))) {
            return 20;
        }

        return 0;
    }

    function isEligibleForAchievement(
        address user,
        string memory achievementCode
    ) public view returns (bool) {
        bytes32 code = keccak256(abi.encodePacked(achievementCode));
        (uint256 totalWorkouts, uint256 totalSteps, uint256 totalCalories, ) = getUserStats(user);

        if (code == keccak256(abi.encodePacked("FIRST_WORKOUT"))) {
            return totalWorkouts >= 1;
        }

        if (code == keccak256(abi.encodePacked("TEN_THOUSAND_STEPS"))) {
            return totalSteps >= 10000;
        }

        if (code == keccak256(abi.encodePacked("FIVE_HUNDRED_CALORIES"))) {
            return totalCalories >= 500;
        }

        return false;
    }

    function _autoClaimIfEligible(
        address user,
        string memory achievementCode
    ) internal {
        if (
            !claimedAchievements[user][achievementCode] &&
            isEligibleForAchievement(user, achievementCode)
        ) {
            uint256 reward = getRewardForAchievement(achievementCode);
            claimedAchievements[user][achievementCode] = true;
            achievements[user].push(achievementCode);
            rewardBalances[user] += reward;

            emit AchievementClaimed(user, achievementCode, reward);
        }
    }
}