// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

interface IUniswapV2Router {
    function swapExactETHForTokensSupportingFeeOnTransferTokens(
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external payable;
}

contract DexStreetSniperRouter {
    address public treasury;
    uint256 public feePercent = 10; // 1.0% = 10 / 1000
    uint256 public referrerSplit = 25; // 25% of fee to referrer
    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address _treasury) {
        treasury = _treasury;
        owner = msg.sender;
    }

    function updateTreasury(address _newTreasury) external onlyOwner {
        treasury = _newTreasury;
    }

    function updateReferrerSplit(uint256 _newSplit) external onlyOwner {
        require(_newSplit <= 100, "Max 100%");
        referrerSplit = _newSplit;
    }

    function snipeETHToToken(
        address router,
        address token,
        uint amountOutMin,
        address[] calldata path,
        uint deadline,
        address referrer
    ) external payable {
        require(msg.value > 0, "No ETH");

        uint256 fee = (msg.value * feePercent) / 1000;
        uint256 tradeAmount = msg.value - fee;

        // Perform the swap
        IUniswapV2Router(router).swapExactETHForTokensSupportingFeeOnTransferTokens{value: tradeAmount}(
            amountOutMin,
            path,
            address(this),
            deadline
        );

        // Split the fee
        uint256 referrerAmount = (fee * referrerSplit) / 100;
        uint256 treasuryAmount = fee - referrerAmount;

        if (referrer != address(0) && referrerAmount > 0) {
            (bool sent1, ) = payable(referrer).call{value: referrerAmount}("");
            require(sent1, "Referrer transfer failed");
        }

        (bool sent2, ) = payable(treasury).call{value: treasuryAmount}("");
        require(sent2, "Treasury transfer failed");

        // Transfer tokens to the user
        uint256 tokenBalance = IERC20(token).balanceOf(address(this));
        IERC20(token).transfer(msg.sender, tokenBalance);
    }

    // Withdraw stuck tokens or ETH
    function withdraw(address token) external onlyOwner {
        if (token == address(0)) {
            payable(owner).transfer(address(this).balance);
        } else {
            uint256 balance = IERC20(token).balanceOf(address(this));
            IERC20(token).transfer(owner, balance);
        }
    }

    receive() external payable {}
}
