pragma solidity ^0.4.25;


import 'openzeppelin-solidity/contracts/token/ERC20/ERC20Pausable.sol';


/**
    The LevelApp Token is totaly preminted on creation and is assigned to
    the distributor address. All the initial distribution is done by the distributor

    Total emission is 10 billion LVL and is constant forever

    The transfers can be paused by a pauser (can be assigned by the distributor)
    in case of an emergency or a need to migrate to a new contract.
*/
contract LevelToken is ERC20Pausable{

    string public constant name = "LevelApp Token";
    string public constant symbol = "LVL";
    uint public constant decimals = 8;

    uint private constant TOTAL_EMISSION = 10000000000;

    constructor(address distributor) public{
        //Make the distributor a pauser
        addPauser(distributor);
        //Remove contract creator from pausers
        renouncePauser();
        //All the emission is minted at contract creation
        //and is managed by distributor
        _mint(distributor, TOTAL_EMISSION*(10**decimals));
    }
}
