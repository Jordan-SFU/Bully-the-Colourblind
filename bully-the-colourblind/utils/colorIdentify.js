export async function identifyColour(hsl) {
    const response = await fetch(`https://www.thecolorapi.com/id?rgb=${hsl}&format=json`);
    const data = await response.json();
    return data;
}