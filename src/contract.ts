import {
  EntriesBought as EntriesBoughtEvent,
  GLPBought as GLPBoughtEvent,
  Refunded as RefundedEvent,
  RoundActivated as RoundActivatedEvent,
  WinnerSelected as WinnerSelectedEvent,
  Withdrawed as WithdrawedEvent,
} from '../generated/Contract/Contract'
import {
  EntriesBought,
  GLPBought,
  Refunded,
  RoundActivated,
  WinnerSelected,
  Withdrawed,
} from '../generated/schema'

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
