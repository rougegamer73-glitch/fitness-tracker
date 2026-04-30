const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { ethers } = require('ethers');

const User = require('../models/User');

const router = express.Router();

router.get('/status', (_req, res) => {
  res.status(200).json({
    message: 'Auth routes ready',
    walletSignatureLogin: true
  });
});

router.post('/nonce', async (req, res, next) => {
  try {
    const walletAddress = normalizeWalletAddress(req.body.walletAddress);
    const nonce = createNonce();

    const user = await User.findOneAndUpdate(
      { walletAddress },
      {
        $set: { nonce },
        $setOnInsert: {
          walletAddress,
          displayName: 'FitChain User',
          createdAt: new Date()
        }
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true
      }
    );

    res.status(200).json({
      walletAddress: user.walletAddress,
      nonce,
      message: buildLoginMessage(walletAddress, nonce)
    });
  } catch (error) {
    next(error);
  }
});

router.post('/verify', async (req, res, next) => {
  try {
    const walletAddress = normalizeWalletAddress(req.body.walletAddress);
    const { signature, displayName } = req.body;

    if (!signature || typeof signature !== 'string') {
      throwHttpError('Signature is required', 400);
    }

    const user = await User.findOne({ walletAddress });

    if (!user) {
      throwHttpError('Nonce must be requested before verification', 400);
    }

    const message = buildLoginMessage(walletAddress, user.nonce);
    const recoveredAddress = normalizeWalletAddress(
      ethers.verifyMessage(message, signature)
    );

    if (recoveredAddress !== walletAddress) {
      throwHttpError('Invalid signature', 401);
    }

    if (displayName && typeof displayName === 'string') {
      user.displayName = displayName.trim() || user.displayName;
    }

    user.nonce = createNonce();
    await user.save();

    const token = jwt.sign(
      { walletAddress: user.walletAddress },
      getJwtSecret(),
      { expiresIn: '1d' }
    );

    res.status(200).json({
      token,
      user: formatUser(user)
    });
  } catch (error) {
    next(error);
  }
});

function createNonce() {
  return crypto.randomBytes(16).toString('hex');
}

function buildLoginMessage(walletAddress, nonce) {
  return [
    'Sign this message to authenticate with FitChain.',
    '',
    `Wallet: ${walletAddress}`,
    `Nonce: ${nonce}`
  ].join('\n');
}

function normalizeWalletAddress(walletAddress) {
  if (!walletAddress || typeof walletAddress !== 'string') {
    throwHttpError('Valid walletAddress is required', 400);
  }

  const trimmedAddress = walletAddress.trim();

  if (!ethers.isAddress(trimmedAddress)) {
    throwHttpError('Valid walletAddress is required', 400);
  }

  return trimmedAddress.toLowerCase();
}

function getJwtSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  return process.env.JWT_SECRET;
}

function formatUser(user) {
  return {
    id: user._id,
    walletAddress: user.walletAddress,
    displayName: user.displayName,
    createdAt: user.createdAt
  };
}

function throwHttpError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
}

module.exports = router;
