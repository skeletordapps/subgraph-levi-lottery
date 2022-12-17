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
  UserEntry
} from '../generated/schema'

import {
  BigDecimal,
  BigInt,
  ethereum,
} from "@graphprotocol/graph-ts";

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

  handleRound(event)
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
}



// NEW MAPPINGS

export function handleBlockWithCreateOnContract(block: ethereum.Block): void {
  let lotto = getLotto()
  lotto.save()

}

function getLotto(): Lotto {
  let lotto = Lotto.load("levi-lotto")

  if (!lotto) {
    const fee = BigDecimal.fromString("0.001")
    lotto = new Lotto("levi-lotto")
    lotto.entryFee = fee
    lotto.feesCollected = BigInt.fromI32(0)
    lotto.glpConverted = BigInt.fromI32(0)
  }

  return lotto
}

export function handleCollectedFees(event: WinnerSelectedEvent): void {
  let lotto = getLotto()
  let fees = lotto.feesCollected + event.params.fee
  lotto.feesCollected = fees
  lotto.save()
}

export function handleGlpConverted(event: GLPBoughtEvent): void {
  let lotto = getLotto()
  let fees = lotto.feesCollected - event.params.amountEthConverted
  let glp = lotto.glpConverted + event.params.glpBought

  lotto.feesCollected = fees
  lotto.glpConverted = glp
  lotto.save()
}

export function handleRoundWinner(event: WinnerSelectedEvent): void {
  let round = Round.load(event.params.round.toString())
  let user = User.load(event.params.winner.toString())

  if (round && user) {
    round.winner = user.id
    round.save()
  }
}

// export function handleUser(event: EntriesBoughtEvent): void {
//   let user = User.load(event.params.account.toString())
//   let round = Round.load(event.params.round.toString())

//   if (!user) {
//     user = new User(event.params.account.toString())
//     user.account = event.params.account
//     user.userEntries = []
//     user.balance = BigInt.fromI32(0)
//   }

//   const userEntryId = event.params.account.toString() + event.params.round.toString()
//   let userEntry = UserEntry.load(userEntryId)

//   if (!userEntry) {
//     userEntry = new UserEntry(userEntryId)
//     userEntry.total = event.params.accountEntries
//   }

//   userEntry.round = round.id

//   let userEntries = user.userEntries
//   userEntries.push(userEntry.id)
//   user.userEntries = userEntries
  
//   userEntry.save()
//   user.save()
// }

export function handleRound(event: EntriesBoughtEvent): void {
  let round = Round.load(event.params.round.toString())
  let user = User.load(event.params.account.toString())

  if (!round) {
    round = new Round(event.params.round.toString())
    round.status = "OPEN"
    round.totalEntries = BigInt.fromI32(0)
    round.users = []
  }

  round.totalEntries += event.params.accountEntries
  
  if (!user) {
    user = new User(event.params.account.toString())
    user.account = event.params.account
    user.userEntries = []
    user.balance = BigInt.fromI32(0)
  }

  user.save()

  if (round.users.length >= 5) {
    round.status = "ACTIVATED"
  }
  
  let roundUsers = round.users
  roundUsers.push(user.id)
  round.users = roundUsers
  round.save()
  const userEntryId = event.params.account.toString() + event.params.round.toString()
  let userEntry = UserEntry.load(userEntryId)

  if (!userEntry) {
    userEntry = new UserEntry(userEntryId)
    userEntry.round = round.id
    userEntry.total = event.params.accountEntries
  }

  userEntry.save()

  let userEntries = user.userEntries
  userEntries.push(userEntry.id)
  user.userEntries = userEntries
  
  user.save()
}