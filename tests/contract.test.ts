import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address, BigInt } from "@graphprotocol/graph-ts"
import { EntriesBought } from "../generated/schema"
import { EntriesBought as EntriesBoughtEvent } from "../generated/Contract/Contract"
import { handleEntriesBought } from "../src/contract"
import { createEntriesBoughtEvent } from "./contract-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let account = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let round = BigInt.fromI32(234)
    let accountEntries = BigInt.fromI32(234)
    let payment = BigInt.fromI32(234)
    let newEntriesBoughtEvent = createEntriesBoughtEvent(
      account,
      round,
      accountEntries,
      payment
    )
    handleEntriesBought(newEntriesBoughtEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("EntriesBought created and stored", () => {
    assert.entityCount("EntriesBought", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "EntriesBought",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "account",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "EntriesBought",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "round",
      "234"
    )
    assert.fieldEquals(
      "EntriesBought",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "accountEntries",
      "234"
    )
    assert.fieldEquals(
      "EntriesBought",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "payment",
      "234"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
