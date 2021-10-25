const main = async () => {
  const gameContractFactory = await hre.ethers.getContractFactory("NftGameBuildspace");
  const gameContract = await gameContractFactory.deploy(
    ["Rollish", "Jetri", "Musser"], // Names
    [
      "https://i.imgur.com/rbF4C2f.mp4", // Videos
      "https://i.imgur.com/E6kiGpJ.mp4",
      "https://i.imgur.com/cvhvyuq.mp4"
    ],
    [100, 200, 300], // HP (Hit Points) values
    [50, 100, 75], // Attack damage values
    "Boz", // Boss name
    "https://i.imgur.com/jJDcPQY.mp4", // Boss video
    10000, // Boss hp
    50 // Boss attack damage
  );
  await gameContract.deployed();
  console.log("Contract deployed to:", gameContract.address);

  let txn;
  // We only have three characters.
  // an NFT w/ the character at index 2 of our array.
  txn = await gameContract.mintCharacterNFT(2);
  await txn.wait();

  // Get the value of the NFT's URI.
  let returnedTokenUri = await gameContract.tokenURI(1);
  console.log("Token URI:", returnedTokenUri);

  // Attack boss
  txn = await gameContract.attackBoss();
  await txn.wait();
  // Attack boss again
  txn = await gameContract.attackBoss();
  await txn.wait();
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();