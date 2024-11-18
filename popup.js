(async () => {
    const request = await fetch('https://raw.githubusercontent.com/Syauqi-Ali/Fix-Hummatech-Error/refs/heads/main/updatedCode.js', {
        headers: {
            Authorization: 'Token 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'
        }
    });
    const response = await request.text();
    console.log(response);
})();