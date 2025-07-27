// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title DexStreet Fee Collector
/// @notice Captures 1.5% fee on each trade
/// @dev Compatible with Ethereum, BSC, and Base

contract DexStreetFeeCollector {
    address payable public feeWallet = payable(address(0)); // CONFIGURE THIS WALLET

    event FeeTaken(address from, uint256 feeAmount, uint256 timestamp);

    constructor(address payable _feeWallet) {
        require(_feeWallet != address(0), "Invalid fee wallet");
        feeWallet = _feeWallet;
    }

    /// @notice Takes 1.5% fee from a transaction amount
    /// @param token The token to be transferred
    /// @param amount The total amount being sent
    function takeFee(address token, uint256 amount) external {
        uint256 fee = (amount * 15) / 1000; // 1.5%
        require(fee > 0, "Fee too small");

        IERC20(token).transferFrom(msg.sender, feeWallet, fee);
        emit FeeTaken(msg.sender, fee, block.timestamp);
    }
}

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}
