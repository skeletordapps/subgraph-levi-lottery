import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  EntriesBought,
  GLPBought,
  GLPSent,
  Refunded,
  RoundActivated,
  WinnerSelected,
  Withdrawed
} from "../generated/Contract/Contract"

export function createEntriesBoughtEvent(
  account: Address,
  round: BigInt,
  accountEntries: BigInt,
  payment: BigInt
): EntriesBought {
  let entriesBoughtEvent = changetype<EntriesBought>(newMockEvent())

  entriesBoughtEvent.parameters = new Array()

  entriesBoughtEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )
  entriesBoughtEvent.parameters.push(
    new ethereum.EventParam("round", ethereum.Value.fromUnsignedBigInt(round))
  )
  entriesBoughtEvent.parameters.push(
    new ethereum.EventParam(
      "accountEntries",
      ethereum.Value.fromUnsignedBigInt(accountEntries)
    )
  )
  entriesBoughtEvent.parameters.push(
    new ethereum.EventParam(
      "payment",
      ethereum.Value.fromUnsignedBigInt(payment)
    )
  )

  return entriesBoughtEvent
}

export function createGLPBoughtEvent(
  sender: Address,
  beneficiary: Address,
  glpBought: BigInt,
  amountEthConverted: BigInt,
  _timestamp: BigInt
): GLPBought {
  let glpBoughtEvent = changetype<GLPBought>(newMockEvent())

  glpBoughtEvent.parameters = new Array()

  glpBoughtEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )
  glpBoughtEvent.parameters.push(
    new ethereum.EventParam(
      "beneficiary",
      ethereum.Value.fromAddress(beneficiary)
    )
  )
  glpBoughtEvent.parameters.push(
    new ethereum.EventParam(
      "glpBought",
      ethereum.Value.fromUnsignedBigInt(glpBought)
    )
  )
  glpBoughtEvent.parameters.push(
    new ethereum.EventParam(
      "amountEthConverted",
      ethereum.Value.fromUnsignedBigInt(amountEthConverted)
    )
  )
  glpBoughtEvent.parameters.push(
    new ethereum.EventParam(
      "_timestamp",
      ethereum.Value.fromUnsignedBigInt(_timestamp)
    )
  )

  return glpBoughtEvent
}

export function createGLPSentEvent(
  sender: Address,
  beneficiary: Address,
  glpSent: BigInt
): GLPSent {
  let glpSentEvent = changetype<GLPSent>(newMockEvent())

  glpSentEvent.parameters = new Array()

  glpSentEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )
  glpSentEvent.parameters.push(
    new ethereum.EventParam(
      "beneficiary",
      ethereum.Value.fromAddress(beneficiary)
    )
  )
  glpSentEvent.parameters.push(
    new ethereum.EventParam(
      "glpSent",
      ethereum.Value.fromUnsignedBigInt(glpSent)
    )
  )

  return glpSentEvent
}

export function createRefundedEvent(
  account: Address,
  round: BigInt,
  etherRefunded: BigInt,
  entriesRefunded: BigInt
): Refunded {
  let refundedEvent = changetype<Refunded>(newMockEvent())

  refundedEvent.parameters = new Array()

  refundedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )
  refundedEvent.parameters.push(
    new ethereum.EventParam("round", ethereum.Value.fromUnsignedBigInt(round))
  )
  refundedEvent.parameters.push(
    new ethereum.EventParam(
      "etherRefunded",
      ethereum.Value.fromUnsignedBigInt(etherRefunded)
    )
  )
  refundedEvent.parameters.push(
    new ethereum.EventParam(
      "entriesRefunded",
      ethereum.Value.fromUnsignedBigInt(entriesRefunded)
    )
  )

  return refundedEvent
}

export function createRoundActivatedEvent(round: BigInt): RoundActivated {
  let roundActivatedEvent = changetype<RoundActivated>(newMockEvent())

  roundActivatedEvent.parameters = new Array()

  roundActivatedEvent.parameters.push(
    new ethereum.EventParam("round", ethereum.Value.fromUnsignedBigInt(round))
  )

  return roundActivatedEvent
}

export function createWinnerSelectedEvent(
  winner: Address,
  serviceProvider: Address,
  round: BigInt,
  prize: BigInt,
  fee: BigInt,
  service: BigInt
): WinnerSelected {
  let winnerSelectedEvent = changetype<WinnerSelected>(newMockEvent())

  winnerSelectedEvent.parameters = new Array()

  winnerSelectedEvent.parameters.push(
    new ethereum.EventParam("winner", ethereum.Value.fromAddress(winner))
  )
  winnerSelectedEvent.parameters.push(
    new ethereum.EventParam(
      "serviceProvider",
      ethereum.Value.fromAddress(serviceProvider)
    )
  )
  winnerSelectedEvent.parameters.push(
    new ethereum.EventParam("round", ethereum.Value.fromUnsignedBigInt(round))
  )
  winnerSelectedEvent.parameters.push(
    new ethereum.EventParam("prize", ethereum.Value.fromUnsignedBigInt(prize))
  )
  winnerSelectedEvent.parameters.push(
    new ethereum.EventParam("fee", ethereum.Value.fromUnsignedBigInt(fee))
  )
  winnerSelectedEvent.parameters.push(
    new ethereum.EventParam(
      "service",
      ethereum.Value.fromUnsignedBigInt(service)
    )
  )

  return winnerSelectedEvent
}

export function createWithdrawedEvent(
  account: Address,
  amount: BigInt
): Withdrawed {
  let withdrawedEvent = changetype<Withdrawed>(newMockEvent())

  withdrawedEvent.parameters = new Array()

  withdrawedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )
  withdrawedEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return withdrawedEvent
}
