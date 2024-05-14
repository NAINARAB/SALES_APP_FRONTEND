
const LocalDate = (dateObj) => {
    const receivedDate = dateObj ? new Date(dateObj) : new Date();
    return receivedDate.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const LocalDateWithTime = (dateObj) => {
    const receivedDate = dateObj ? new Date(dateObj) : new Date();
    return receivedDate.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const ISOString = (dateObj) => {
    const receivedDate = dateObj ? new Date(dateObj) : new Date();
    return receivedDate.toISOString().split('T')[0]
}

const isEqualNumber = (a, b) => {
    return Number(a) === Number(b)
}

const isGraterNumber = (a, b) => {
    return Number(a) > Number(b)
}

const isLesserNumber = (a, b) => {
    return Number(a) < Number(b)
}


export {
    LocalDate,
    LocalDateWithTime,
    ISOString,
    isEqualNumber,
    isGraterNumber,
    isLesserNumber,
}