const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function generateCode(){
    let result = "";
    for(let i = 0; i < 6; i++) {
        const index = Math.floor(Math.random() * alphabet.length);
        result += alphabet[index];
    }
    return result;
}

module.exports = generateCode;