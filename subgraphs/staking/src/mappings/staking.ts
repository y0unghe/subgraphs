import { BigInt, store } from '@graphprotocol/graph-ts'
import { log } from 'matchstick-as'
import {
  Claim,
  IncentiveCreated,
  IncentiveUpdated,
  Stake,
  Subscribe,
  Unstake,
  Unsubscribe,
} from '../../generated/Staking/Staking'
import {
  getOrCreateFarm,
  getOrCreateIncentive,
  getOrCreateRewardClaim,
  getOrCreateStake,
  getOrCreateSubscription,
  getOrCreateToken,
  getOrCreateUser,
  getSubscription,
  getSubscriptionByIncentiveId,
} from '../../src/functions'

export function onIncentiveCreated(event: IncentiveCreated): void {
  let creator = getOrCreateUser(event.params.creator.toHex())
  let rewardToken = getOrCreateToken(event.params.rewardToken.toHex())
  let token = getOrCreateToken(event.params.token.toHex())
  let farm = getOrCreateFarm(event.params.token.toHex(), event)

  let incentive = getOrCreateIncentive(event.params.id.toString(), event)
  incentive.farm = farm.id
  incentive.createdBy = creator.id
  incentive.stakeToken = token.id
  incentive.rewardToken = rewardToken.id
  incentive.lastRewardTime = event.params.startTime
  incentive.endTime = event.params.endTime
  incentive.rewardAmount = event.params.amount
  incentive.createdAtBlock = event.block.number
  incentive.createdAtTimestamp = event.block.timestamp
  incentive.modifiedAtBlock = event.block.number
  incentive.modifiedAtTimestamp = event.block.timestamp

  incentive.save()
}

export function onIncentiveUpdated(event: IncentiveUpdated): void {
  let incentive = getOrCreateIncentive(event.params.id.toString(), event)
  // incentive = accrueRewards(incentive, event.block.timestamp)

  let newStartTime = event.params.newStartTime.toI32()
  let newEndTime = event.params.newEndTime.toI32()
  let timestamp = event.block.timestamp.toI32()
  let changeAmount = event.params.changeAmount

  if (newStartTime != 0) {
    if (newStartTime < timestamp) {
      newStartTime = timestamp
    }
    incentive.lastRewardTime = BigInt.fromI32(newStartTime)
  }

  if (newEndTime != 0) {
    if (newEndTime < timestamp) {
      newEndTime = timestamp
    }
    incentive.endTime = BigInt.fromI32(newEndTime)
  }

  let zero = BigInt.fromU32(0)
  if (changeAmount > zero) {
    incentive.rewardAmount = incentive.rewardAmount.plus(event.params.changeAmount)
  } else if (changeAmount < zero) {
    let amount = changeAmount.abs()
    if (amount > incentive.rewardAmount) {
      incentive.rewardAmount = zero
    } else {
      incentive.rewardAmount = incentive.rewardAmount.minus(amount)
    }
  }

  incentive.modifiedAtBlock = event.block.number
  incentive.modifiedAtTimestamp = event.block.timestamp
  incentive.save()
}

export function onStake(event: Stake): void {
  let token = getOrCreateToken(event.params.token.toHex())
  let user = getOrCreateUser(event.params.user.toHex())

  let stake = getOrCreateStake(user.id, token.id)
  stake.liquidity = stake.liquidity.plus(event.params.amount)
  stake.user = user.id
  stake.token = token.id
  stake.createdAtBlock = event.block.number
  stake.createdAtTimestamp = event.block.timestamp
  stake.save()

  for (let i = 1; i <= user.totalSubscriptionCount.toI32(); i++) {
    let subscription = getSubscription(user.id, i.toString())

    if (subscription !== null) {
      let incentive = getOrCreateIncentive(subscription.incentive, event)

      incentive.liquidityStaked = incentive.liquidityStaked.plus(event.params.amount)
      incentive.modifiedAtBlock = event.block.number
      incentive.modifiedAtTimestamp = event.block.timestamp
      incentive.save()
    }
  }
}

export function onUnstake(event: Unstake): void {
  let token = getOrCreateToken(event.params.token.toHex())
  let user = getOrCreateUser(event.params.user.toHex())

  let stake = getOrCreateStake(user.id, token.id)
  stake.liquidity = stake.liquidity.minus(event.params.amount)
  stake.user = user.id
  stake.createdAtBlock = event.block.number
  stake.createdAtTimestamp = event.block.timestamp
  stake.save()

  for (let i = 1; i <= user.totalSubscriptionCount.toI32(); i++) {
    let subscription = getSubscription(user.id, i.toString())

    if (subscription !== null) {
      let incentive = getOrCreateIncentive(subscription.incentive, event)

      incentive.liquidityStaked = incentive.liquidityStaked.minus(event.params.amount)
      incentive.modifiedAtBlock = event.block.number
      incentive.modifiedAtTimestamp = event.block.timestamp
      incentive.save()
    }
  }
}

export function onSubscribe(event: Subscribe): void {
  let incentive = getOrCreateIncentive(event.params.id.toString(), event)
  let user = getOrCreateUser(event.params.user.toHex())

  let stake = getOrCreateStake(user.id, incentive.stakeToken)

  incentive.liquidityStaked = incentive.liquidityStaked.plus(stake.liquidity)
  incentive.modifiedAtBlock = event.block.number
  incentive.modifiedAtTimestamp = event.block.timestamp
  incentive.save()

  user.totalSubscriptionCount = user.totalSubscriptionCount.plus(BigInt.fromU32(1))
  user.activeSubscriptionCount = user.activeSubscriptionCount.plus(BigInt.fromU32(1))
  user.save()

  let subscription = getOrCreateSubscription(user.id, user.totalSubscriptionCount.toString())

  subscription.user = user.id
  subscription.incentive = event.params.id.toString()
  subscription.createdAtBlock = event.block.number
  subscription.createdAtTimestamp = event.block.timestamp
  subscription.token = incentive.stakeToken
  subscription.save()
}

export function onUnsubscribe(event: Unsubscribe): void {
  let incentive = getOrCreateIncentive(event.params.id.toString(), event)
  let user = getOrCreateUser(event.params.user.toHex())
  user.activeSubscriptionCount = user.activeSubscriptionCount.minus(BigInt.fromU32(1))
  user.save()
  let stake = getOrCreateStake(user.id, incentive.stakeToken)

  incentive.liquidityStaked = incentive.liquidityStaked.minus(stake.liquidity)
  incentive.modifiedAtBlock = event.block.number
  incentive.modifiedAtTimestamp = event.block.timestamp
  incentive.save()
  let subscription = getSubscriptionByIncentiveId(user, event.params.id.toString())
  if (subscription !== null) {
    store.remove('_Subscription', subscription.id)
  } else {
    log.error('onUnsubscribe: Missing subscription, inconsistent subgraph state.', [])
  }
}

export function onClaim(event: Claim): void {
  let user = getOrCreateUser(event.params.user.toHex())
  let incentive = getOrCreateIncentive(event.params.id.toString(), event)
  incentive.modifiedAtBlock = event.block.number
  incentive.modifiedAtTimestamp = event.block.timestamp
  incentive.save()

  user.rewardClaimCount = user.rewardClaimCount.plus(BigInt.fromI32(1))
  user.save()

  let rewardClaim = getOrCreateRewardClaim(user.id, user.rewardClaimCount.toString())
  rewardClaim.token = incentive.rewardToken
  rewardClaim.user = user.id
  rewardClaim.incentive = incentive.id
  rewardClaim.amount = event.params.amount
  rewardClaim.save()
}
