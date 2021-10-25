import React, { useEffect, useState } from 'react';
import './SelectCharacter.css';
import { ethers } from 'ethers';
import LoadingIndicator from '../LoadingIndicator';

import { CONTRACT_ADDRESS, transformCharacterData } from '../../constants';
import NftGameBuildspace from '../../utils/NftGameBuildspace.json';

const SelectCharacter = ({ setCharacterNFT }) => {
  const [characters, setCharacters] = useState([]);
  const [gameContract, setGameContract] = useState(null);
  const [mintingCharacter, setMintingCharacter] = useState(false);

  useEffect(() => {
    const { ethereum } = window;

    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        NftGameBuildspace.abi,
        signer
      );

      setGameContract(gameContract);
    } else {
      console.log('Ethereum object not found');
    }
  }, []);

useEffect(() => {
  const getCharacters = async () => {
    try {
      console.log('Getting contract characters to mint');
      const charactersTxn = await gameContract.getAllDefaultCharacters();
      console.log('charactersTxn:', charactersTxn);
      const characters = charactersTxn.map((characterData) =>
        transformCharacterData(characterData)
      );
      setCharacters(characters);
    } catch (error) {
      console.error('Something went wrong fetching characters:', error);
    }
  };

  const onCharacterMint = async (sender, tokenId, characterIndex) => {
    console.log(
      `CharacterNFTMinted - sender: ${sender} tokenId: ${tokenId.toNumber()} characterIndex: ${characterIndex.toNumber()}`
    );
    alert(`Your NFT is all done -- see it here: https://testnets.opensea.io/assets/${gameContract}/${tokenId.toNumber()}`)

    if (gameContract) {
      const characterNFT = await gameContract.checkIfUserHasNFT();
      console.log('CharacterNFT: ', characterNFT);
      setCharacterNFT(transformCharacterData(characterNFT));
    }
  };

  if (gameContract) {
    getCharacters();
    gameContract.on('CharacterNFTMinted', onCharacterMint);
  }

  return () => {
    if (gameContract) {
      gameContract.off('CharacterNFTMinted', onCharacterMint);
    }
  };
}, [gameContract]);

  const renderCharacters = () =>
    characters.map((character, index) => (
      <div className="character-item" key={character.name}>
        <div className="name-container">
          <p>{character.name}</p>
        </div>
        <video src={character.imageURI} alt={character.name} autoPlay loop />
        <button
          type="button"
          className="character-mint-button"
          onClick={mintCharacterNFTAction(index)}
        >
        {`Mint ${character.name}`}
        </button>
      </div>
    )
  );

  const mintCharacterNFTAction = (characterId) => async () => {
  try {
    if (gameContract) {
      setMintingCharacter(true);
      console.log('Minting character in progress...');
      const mintTxn = await gameContract.mintCharacterNFT(characterId);
      await mintTxn.wait();
      console.log('mintTxn:', mintTxn);
      setMintingCharacter(false);
    }
  } catch (error) {
    setMintingCharacter(false);
    console.warn('MintCharacterAction Error:', error);
  }
};

  return (
   <div className="select-character-container">
    <h2>Mint Your Hero. Choose wisely.</h2>
    {characters.length > 0 && (
      <div className="character-grid">{renderCharacters()}</div>
    )}
    {mintingCharacter && (
      <div className="loading">
        <div className="indicator">
          <LoadingIndicator />
          <p>Minting In Progress...</p>
        </div>
      </div>
    )}
  </div>
  );
};

export default SelectCharacter;