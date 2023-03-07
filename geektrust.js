const fs = require("fs")

const filename = process.argv[2]

const metroCards = []
const checkIns = []

const passagengerTypesPrices = [{ 'ADULT': 200, }, { 'SENIOR_CITIZEN': 100, }, { 'KID': 50, }]
const rechargeTax = 0.02

let TOTAL_COLLECTION_CENTRAL = 0
let TOTAL_COLLECTION_AIRPORT = 0
let TOTAL_DISCOUNT_CENTRAL = 0
let TOTAL_DISCOUNT_AIRPORT = 0

fs.readFile(filename, "utf8", async (err, data) => {
    /*if (err) throw err
    var inputLines = data.toString().split("\n")
    // Add your code here to process input commands
    */

    const lines = data.toString().split("\n")
    const inputCommands = getCommands(lines)

    inputCommands.forEach(({ command, args }) => {

        if (command === 'BALANCE') {
            const [mc, balance] = args
            setBalance(mc, balance)
        }

        if (command === 'CHECK_IN') {
            const [mc, passagengerType, station] = args
            checkIn(mc, passagengerType, station)
        }

        if (command === 'PRINT_SUMMARY') {
            TOTAL_COLLECTION_CENTRAL = checkIns.filter((checkIn) => checkIn.station === 'CENTRAL\r').reduce((acc, checkIn) => acc + checkIn.collected, 0)
            TOTAL_COLLECTION_AIRPORT = checkIns.filter((checkIn) => checkIn.station === 'AIRPORT\r').reduce((acc, checkIn) => acc + checkIn.collected, 0)
            TOTAL_DISCOUNT_CENTRAL = checkIns.filter((checkIn) => checkIn.station === 'CENTRAL\r').reduce((acc, checkIn) => acc + checkIn.discount, 0)
            TOTAL_DISCOUNT_AIRPORT = checkIns.filter((checkIn) => checkIn.station === 'AIRPORT\r').reduce((acc, checkIn) => acc + checkIn.discount, 0)

            const CENTRAL_ADULTS = checkIns.filter((checkIn) => checkIn.station === 'CENTRAL\r' && checkIn.passagengerType === 'ADULT').length
            const CENTRAL_SENIOR_CITIZENS = checkIns.filter((checkIn) => checkIn.station === 'CENTRAL\r' && checkIn.passagengerType === 'SENIOR_CITIZEN').length
            const CENTRAL_KIDS = checkIns.filter((checkIn) => checkIn.station === 'CENTRAL\r' && checkIn.passagengerType === 'KID').length

            const AIRPORT_ADULTS = checkIns.filter((checkIn) => checkIn.station === 'AIRPORT\r' && checkIn.passagengerType === 'ADULT').length
            const AIRPORT_SENIOR_CITIZENS = checkIns.filter((checkIn) => checkIn.station === 'AIRPORT\r' && checkIn.passagengerType === 'SENIOR_CITIZEN').length
            const AIRPORT_KIDS = checkIns.filter((checkIn) => checkIn.station === 'AIRPORT\r' && checkIn.passagengerType === 'KID').length

            console.log(`TOTAL_COLLECTION_CENTRAL ${TOTAL_COLLECTION_CENTRAL} ${TOTAL_DISCOUNT_CENTRAL}`)
            console.log('PASSANGER_TYPE_SUMMARY')
            CENTRAL_ADULTS ? console.log(`ADULT ${CENTRAL_ADULTS}`) : null
            CENTRAL_KIDS ? console.log(`KID ${CENTRAL_KIDS}`) : null
            CENTRAL_SENIOR_CITIZENS ? console.log(`SENIOR_CITIZEN ${CENTRAL_SENIOR_CITIZENS}`) : null

            console.log(`\nTOTAL_COLLECTION_AIRPORT ${TOTAL_COLLECTION_AIRPORT} ${TOTAL_DISCOUNT_AIRPORT}`)
            console.log('PASSANGER_TYPE_SUMMARY')
            AIRPORT_ADULTS ? console.log(`ADULT ${AIRPORT_ADULTS}`) : null
            AIRPORT_KIDS ? console.log(`KID ${AIRPORT_KIDS}`) : null
            AIRPORT_SENIOR_CITIZENS ? console.log(`SENIOR_CITIZEN ${AIRPORT_SENIOR_CITIZENS}`) : null
        }
    })

})

function getCommands(lines) {
    const commands = []

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        const command = {
            command: line.split(" ")[0],
            args: line.split(" ").slice(1)
        }
        commands.push(command)
    }

    return commands
}

function setBalance(mc, balance) {
    const mcExists = metroCards.find((card) => card.mc === mc)

    if (mcExists) {
        mcExists.balance = balance
        return
    }

    metroCards.push({
        mc,
        balance,
    })
}

function checkIn(mc, passagengerType, station) {
    const metroCard = metroCards.find((card) => card.mc === mc)
    const price = passagengerTypesPrices.find((price) => price[passagengerType])

    const mcCheckIns = checkIns.filter((checkIn) => checkIn.mc === mc).length
    const isSecondOnward = mcCheckIns % 2 === 0 ? true : false
    let applyDiscount = false

    if (isSecondOnward) {
        applyDiscount = false
    } else {
        applyDiscount = checkIns.filter((checkIn) => checkIn.mc === mc && checkIn.station !== station).length > 0 ? true : false
    }

    if (metroCard.balance < price[passagengerType]) {
        const difference = applyDiscount ? (price[passagengerType] / 2) - metroCard.balance : price[passagengerType] - metroCard.balance
        const taxPrice = difference * rechargeTax

        setBalance(mc, 0)

        checkIns.push({
            mc,
            passagengerType,
            station,
            collected: applyDiscount ? (price[passagengerType] / 2) + taxPrice : price[passagengerType] + taxPrice,
            discount: applyDiscount ? price[passagengerType] / 2 : 0,
        })

        return
    } else {
        const newBalance = applyDiscount ? metroCard.balance - (price[passagengerType] / 2) : metroCard.balance - price[passagengerType]

        setBalance(mc, newBalance)

        checkIns.push({
            mc,
            passagengerType,
            station,
            collected: applyDiscount ? price[passagengerType] / 2 : price[passagengerType],
            discount: applyDiscount ? price[passagengerType] / 2 : 0,
        })

        return
    }
}
