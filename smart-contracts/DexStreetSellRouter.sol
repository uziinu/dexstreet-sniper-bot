// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function approve(address spender, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

interface IUniswapV2Router {
    function swapExactTokensForETHSupportingFeeOnTransferTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external;
}

contract DexStreetSellRouter {
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

    function sellTokenForETH(
        address router,
        address token,
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        uint256 deadline,
        address referrer
    ) external {
        require(amountIn > 0, "No tokens");

        // Transfer tokens from user to this contract
        IERC20(token).transferFrom(msg.sender, address(this), amountIn);

        // Approve router
        IERC20(token).approve(router, amountIn);

        // Swap tokens to ETH
        IUniswapV2Router(router).swapExactTokensForETHSupportingFeeOnTransferTokens(
            amountIn,
            amountOutMin,
            path,
            address(this),
            deadline
        );

        // Split ETH fee
        uint256 totalETH = address(this).balance;
        uint256 fee = (totalETH * feePercent) / 1000;
        uint256 userETH = totalETH - fee;
        uint256 referrerAmount = (fee * referrerSplit) / 100;
        uint256 treasuryAmount = fee - referrerAmount;

        if (referrer != address(0) && referrerAmount > 0) {
            (bool sent1, ) = payable(referrer).call{value: referrerAmount}("");
            require(sent1, "Referrer transfer failed");
        }

        (bool sent2, ) = payable(treasury).call{value: treasuryAmount}("");
        require(sent2, "Treasury transfer failed");

        // Send ETH to user
        (bool sent3, ) = payable(msg.sender).call{value: userETH}("");
        require(sent3, "ETH transfer to user failed");
    }

    receive() external payable {}
}
