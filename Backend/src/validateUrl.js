function isValidUrl(url){
    try {
        const validatedURL = new URL(url);
        if (validatedURL.protocol === "http:" || validatedURL.protocol === "https:") {
            return true;
        }
        return false;
    } catch (error) {
        return false;
    }
}

module.exports = isValidUrl;