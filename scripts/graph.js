import {RGBtoHSL, HSLtoRGB, RGBtoHSV, HSVtoRGB} from './colorManipulation.js';

// nacteme obrazek a vykreslime jej na canvas
export async function loadImage() {

    let img, imgData

    let origImg = document.getElementById('myImage')
    let src = document.getElementById("myImage").src

    var canvas = document.getElementById('myCanvas');
    var context = canvas.getContext('2d');

    const imageLoadPromise = new Promise(resolve => {
        img = new Image();
        img.onload = function () {
            canvas.width = img.width
            canvas.height = img.height
            context.drawImage(img, 0, 0);
            origImg.style.display = 'none';
            canvas.style.display = 'block';

            imgData = context.getImageData(0, 0, canvas.width, canvas.height)

            resolve();
        };

        img.src = src;
    });

    await imageLoadPromise;
    return imgData
}

// funkce modifikujici hondoty pixelu podle hodnoty slideru
export function editPixels(value, imgDataOrig, type) {
    var canvas = document.getElementById('myCanvas');
    var context = canvas.getContext('2d');

    let img = context.getImageData(0, 0, canvas.width, canvas.height)
    let imgData = img.data

    console.log(img.data[1], img.data[1 + 1], img.data[1 + 2])
    // console.log(RGBtoHSB(img.data[1], img.data[1 + 1], img.data[1 + 2]))
    // console.log(HSVtoRGB(RGBtoHSB(img.data[1], img.data[1 + 1], img.data[1 + 2])))

    for (let i = 0; i < imgData.length; i += 4) {
        let pix, newPix
        if (type === "H") {
            pix = RGBtoHSL(img.data[i], img.data[i + 1], img.data[i + 2])
            pix[0] = parseInt(value)
            newPix = HSLtoRGB([pix[0], pix[1], pix[2]])
        } else if (type === "S") {
            pix = RGBtoHSL(img.data[i], img.data[i + 1], img.data[i + 2])
            pix[1] = parseInt(value) / 100
            newPix = HSLtoRGB([pix[0], pix[1], pix[2]])
        } else if (type === "B") {
            pix = RGBtoHSV(img.data[i], img.data[i + 1], img.data[i + 2])
            pix[2] = parseInt(value) / 100
            newPix = HSVtoRGB([pix[0], pix[1], pix[2]])
        }
        imgData[i] = newPix[0]
        imgData[i + 1] = newPix[1]
        imgData[i + 2] = newPix[2]
    }

    context.putImageData(img, 0, 0);

    return img
}

// funkce ktera z image objektu vytvori reprezentaci mnozstvi jednotlivych pixelu
// pro pozdejsi vykresleni histogramu
export function getPixelMatrix(imgData) {

    let data = imgData.data

    // vytvorime matici hodnot jednotlivych pixelu
    var colorMatrix = Array(3).fill(0).map(() => Array(256).fill(0))

    for (let i = 0; i < data.length; i += 4) {
        colorMatrix[0][data[i]] += 1
        colorMatrix[1][data[i + 1]] += 1
        colorMatrix[2][data[i + 2]] += 1
    }

    return colorMatrix;
}

// funkce ktera pomoci Chartjs vytvori graf a naplni jej daty z matice
export function createGraph(inArr) {

    var labelArray = Array.from(Array(265).keys())

    var ctx = document.getElementById('myChart').getContext('2d');
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: labelArray,
            datasets: [{
                label: 'Red',
                data: inArr[0],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                ],
                borderWidth: 1,
                pointRadius: 0,
            }, {
                label: 'Green',
                data: inArr[1],
                backgroundColor: [
                    'rgba(101, 193, 107, 0.2)',
                ],
                borderColor: [
                    'rgba(101, 193, 107, 1)',
                ],
                borderWidth: 1,
                pointRadius: 0,
            }, {
                label: 'Blue',
                data: inArr[2],
                backgroundColor: [
                    'rgba(54, 162, 235, 0.2)',
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                ],
                borderWidth: 1,
                pointRadius: 0,
            }
            ]
        },
        options: {

            scales: {
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'number of pixels'
                    },
                    ticks: {
                        padding: 5,
                        beginAtZero: true,
                        min: 0,
                    }
                }],
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'pixel value'
                    },
                    ticks: {
                        padding: 5,
                        type: 'linear',
                        position: 'bottom',
                        beginAtZero: true,
                        max: 260,
                    }
                }]
            }
        }
    })
}
