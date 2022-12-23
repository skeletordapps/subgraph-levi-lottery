import {
  EntriesBought as EntriesBoughtEvent,
  GLPBought as GLPBoughtEvent,
  Refunded as RefundedEvent,
  RoundActivated as RoundActivatedEvent,
  WinnerSelected as WinnerSelectedEvent,
  Withdrawed as WithdrawedEvent,
} from '../generated/LeviLottoV2/LeviLottoV2'
import {
  EntriesBought,
  GLPBought,
  Refunded,
  RoundActivated,
  WinnerSelected,
  Withdrawed,
  Lotto,
  Round,
  User,
  UserEntry,
  Winner,
} from '../generated/schema'

import { BigDecimal, BigInt, ethereum, log } from '@graphprotocol/graph-ts'

export function handleEntriesBought(event: EntriesBoughtEvent): void {
  let entity = new EntriesBought(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.account = event.params.account
  entity.round = event.params.round
  entity.accountEntries = event.params.accountEntries
  entity.payment = event.params.payment

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  handleNewEntryBought(event)
}

export function handleGLPBought(event: GLPBoughtEvent): void {
  let entity = new GLPBought(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.sender = event.params.sender
  entity.beneficiary = event.params.beneficiary
  entity.glpBought = event.params.glpBought
  entity.amountEthConverted = event.params.amountEthConverted
  entity._timestamp = event.params._timestamp

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  handleGlpConverted(event)
}

export function handleRefunded(event: RefundedEvent): void {
  let entity = new Refunded(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.account = event.params.account
  entity.round = event.params.round
  entity.etherRefunded = event.params.etherRefunded
  entity.entriesRefunded = event.params.entriesRefunded

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  handleUserRefund(event)
}

export function handleRoundActivated(event: RoundActivatedEvent): void {
  let entity = new RoundActivated(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.round = event.params.round

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  handleRoundActivation(event)
}

export function handleWinnerSelected(event: WinnerSelectedEvent): void {
  let entity = new WinnerSelected(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.winner = event.params.winner
  entity.serviceProvider = event.params.serviceProvider
  entity.round = event.params.round
  entity.prize = event.params.prize
  entity.fee = event.params.fee
  entity.service = event.params.service

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  handleRoundWinner(event)
  handleCollectedFees(event)
}

export function handleWithdrawed(event: WithdrawedEvent): void {
  let entity = new Withdrawed(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.account = event.params.account
  entity.amount = event.params.amount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  handleUserClaim(event)
}

// NEW MAPPINGS

const INTERVAL = BigInt.fromI32(259200)
const START_DATE = BigInt.fromI32(1670946384)
const ENTRY_FEE = BigDecimal.fromString('0.001')

function getCurrentRound(block: BigInt): BigInt {
  return block.minus(START_DATE).div(INTERVAL).plus(BigInt.fromI32(1))
}

function getLotto(): Lotto {
  let lotto = Lotto.load('levi-lotto')

  if (!lotto) {
    lotto = new Lotto('levi-lotto')
    lotto.entryFee = ENTRY_FEE
    lotto.feesCollected = BigInt.fromI32(0)
    lotto.glpConverted = BigInt.fromI32(0)
    lotto.currentRound = BigInt.fromI32(1)
  }

  return lotto
}

function updateLotto(currentRound: BigInt, block: ethereum.Block): void {
  let lotto = getLotto()
  lotto.currentRound = currentRound
  lotto.currentBlock = block.timestamp.toString()
  lotto.save()
}

function createRound(id: string): Round {
  let round = new Round(id)
  round.status = 'OPEN'
  round.totalEntries = BigInt.fromI32(0)
  round.users = []
  round.isRefundable = false
  round.save()

  log.warning('ROUND CREATED - ' + round.id.toString(), [])
  return round
}

function createdNewRoundIfNeeds(roundCandidateId: BigInt): void {
  let newRound = Round.load(roundCandidateId.toString())

  // CREATES THE FIRST ROUND
  if (!newRound && roundCandidateId == BigInt.fromI32(1)) {
    createRound(roundCandidateId.toString())
    return
  }

  // WHEN ROUND 1 ALREADY EXISTS
  if (!newRound) {
    // LOAD CURRENT ROUND
    let currentRound = Round.load(
      roundCandidateId.minus(BigInt.fromI32(1)).toString(),
    )
    if (!currentRound) return

    // CREATES NEW ROUND
    createRound(roundCandidateId.toString())

    if (currentRound.status == 'ACTIVATED') return

    // UPDATES CURRENT ROUND'S STATUS
    currentRound.status = 'CLOSED'
    if (currentRound.users.length > 0) currentRound.isRefundable = true
    currentRound.save()
  }
}

export function handleBlock(block: ethereum.Block): void {
  let currentRound = getCurrentRound(
    BigInt.fromString(block.timestamp.toString()),
  )

  if (currentRound > BigInt.fromI32(0)) {
    updateLotto(currentRound, block)
    createdNewRoundIfNeeds(currentRound)
  }
}

export function handleNewEntryBought(event: EntriesBoughtEvent): void {
  // LOAD CURRENT ROUND
  let round = Round.load(event.params.round.toString())
  if (!round) return

  // FIND OR CREATE USER
  let user = User.load(event.params.account.toHexString())
  if (!user) {
    user = new User(event.params.account.toHexString())
    user.account = event.params.account
    user.userEntries = []
    user.balance = BigDecimal.fromString('0')
  }
  user.save()

  // UPDATE ROUND
  round.totalEntries = round.totalEntries.plus(event.params.accountEntries)
  let roundUsers = round.users
  roundUsers.push(user.id)
  round.users = roundUsers
  round.save()

  // FIND OR CREATE USER ENTRY
  const userEntryId =
    event.params.account.toHexString() + event.params.round.toString()
  let userEntry = UserEntry.load(userEntryId)
  let isNewEntry = false

  if (!userEntry) {
    isNewEntry = true
    userEntry = new UserEntry(userEntryId)
    userEntry.round = round.id
    userEntry.total = BigInt.fromI32(0)
    userEntry.totalInETH = BigDecimal.fromString('0')
    userEntry.user = user.id
    userEntry.refunded = false
  }

  userEntry.total = userEntry.total.plus(event.params.accountEntries)
  userEntry.totalInETH = userEntry.totalInETH.plus(
    BigDecimal.fromString(event.params.accountEntries.toString()).times(
      ENTRY_FEE,
    ),
  )
  userEntry.transactionHash = event.transaction.hash
  userEntry.save()

  if (isNewEntry) {
    let userEntries = user.userEntries
    userEntries.push(userEntry.id)
    user.userEntries = userEntries
    user.save()
  }
}

export function handleCollectedFees(event: WinnerSelectedEvent): void {
  let lotto = getLotto()
  let fees = lotto.feesCollected.plus(event.params.fee)
  lotto.feesCollected = fees
  lotto.save()
}

export function handleGlpConverted(event: GLPBoughtEvent): void {
  let lotto = getLotto()
  let fees = lotto.feesCollected.minus(event.params.amountEthConverted)
  let glp = lotto.glpConverted.plus(event.params.glpBought)

  lotto.feesCollected = fees
  lotto.glpConverted = glp
  lotto.save()
}

export function handleRoundWinner(event: WinnerSelectedEvent): void {
  let round = Round.load(event.params.round.toString())
  let user = User.load(event.params.winner.toHexString())

  if (round && user) {
    let winner = new Winner(round.id.toString() + user.id.toString())
    winner.user = user.id
    winner.prize = event.params.prize
    winner.round = round.id
    winner.claimed = false
    winner.transactionHash = event.transaction.hash
    winner.save()

    user.balance = user.balance.plus(
      BigDecimal.fromString(event.params.prize.toString()),
    )
    user.save()

    round.winner = winner.id
    round.status = 'CLOSED'
    round.save()
  }
}

export function handleRoundActivation(event: RoundActivatedEvent): void {
  let round = Round.load(event.params.round.toString())
  if (!round) return

  round.status = 'ACTIVATED'
  round.isRefundable = false
  round.save()
}

export function handleUserRefund(event: RefundedEvent): void {
  const userEntryId =
    event.params.account.toString() + event.params.round.toString()
  let userEntry = UserEntry.load(userEntryId)

  if (userEntry) {
    userEntry.refunded = true
    userEntry.save()
  }
}

export function handleUserClaim(event: WithdrawedEvent): void {
  let user = User.load(event.params.account.toHexString())
  if (user) {
    user.balance = BigDecimal.fromString('0')
    user.save()
  }
}