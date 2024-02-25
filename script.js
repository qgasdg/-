document.getElementById('image-upload').addEventListener('change', fileUpload);
document.getElementById('first-image-complete').addEventListener('click', secondStep);
let spectrum = {
    R: { min: 255, max: 0 },
    G: { min: 255, max: 0 },
    B: { min: 255, max: 0 }
};

function fileUpload(event) {
    const fileInput = event.target;
    const imageContainer = document.getElementById('image-container');
    const selectionBox = document.createElement('div');
    selectionBox.setAttribute('id', 'selection-box');

    const canvas = document.createElement('canvas');
    canvas.id = "canvas";
    const ctx = canvas.getContext('2d');

    const reader = new FileReader();

    reader.onload = function (e) {
        const image = new Image();
        // image.setAttribute('src', e.target.result);
        image.src = e.target.result;

        image.onload = function() {

            function getCoordinates() {
                return [selectionBox.offsetLeft, selectionBox.offsetTop, selectionBox.offsetWidth, selectionBox.offsetHeight];
            }

            function getSpectrum() {
                let arr= getCoordinates();
                console.log(arr);
                const imageData = ctx.getImageData(arr[0], arr[1], arr[2], arr[3]);
                console.log(imageData);

                for (let i = 0; i < imageData.data.length; i += 4) {
                    spectrum.R.min = Math.min(spectrum.R.min, imageData.data[i]);
                    spectrum.R.max = Math.max(spectrum.R.max, imageData.data[i]);
                    spectrum.G.min = Math.min(spectrum.G.min, imageData.data[i + 1]);
                    spectrum.G.max = Math.max(spectrum.G.max, imageData.data[i + 1]);
                    spectrum.B.min = Math.min(spectrum.B.min, imageData.data[i + 2]);
                    spectrum.B.max = Math.max(spectrum.B.max, imageData.data[i + 2]);
                }

                console.log(spectrum);
                delSpectrum();
            }

            function delSpectrum() {
                const resultCanvas = document.createElement('canvas');
                const resultCtx = resultCanvas.getContext('2d');
                resultCanvas.id = 'resultCanvas';
                resultCanvas.width = image.width;
                resultCanvas.height = image.height;

                resultCtx.drawImage(image, 0, 0);

                const imageData = ctx.getImageData(0, 0, resultCanvas.width, resultCanvas.height);

                for (let i = 0; i < imageData.data.length; i += 4) {
                    const pixel = {
                        R: imageData.data[i],
                        G: imageData.data[i + 1],
                        B: imageData.data[i + 2]
                    };

                    if (
                        pixel.R >= spectrum.R.min && pixel.R <= spectrum.R.max &&
                        pixel.G >= spectrum.G.min && pixel.G <= spectrum.G.max &&
                        pixel.B >= spectrum.B.min && pixel.B <= spectrum.B.max
                    ) {
                        imageData.data[i] = 255;
                        imageData.data[i + 1] = 255;
                        imageData.data[i + 2] = 255;
                    }
                }

                ctx.putImageData(imageData, 0, 0);
            }

            canvas.width = image.width;
            canvas.height = image.height;

            imageContainer.style.setProperty('width', `${image.width}px`);
            imageContainer.style.setProperty('height', `${image.height}px`);

            ctx.drawImage(image, 0, 0);
            imageContainer.appendChild(canvas);
            imageContainer.appendChild(selectionBox);
            // imageContainer.style.setProperty('backgroundImage', `url(${e.target.result})`);
            // imageContainer.style.setProperty('backgroundSize', 'cover');
            // imageContainer.style.setProperty('backgroundPosition', 'center');
            //
            // imageContainer.style.width = `${image.width}px`;
            // imageContainer.style.height = `${image.height}px`;

            // imageContainer.style.backgroundImage = `url('${e.target.result}')`;
            // imageContainer.style.backgroundSize = 'cover';
            // imageContainer.style.backgroundPosition = 'center';
            // imageContainer.style.opacity = '0';

            let startSelection = false;

            imageContainer.addEventListener('mousedown', (e) => {
                startSelection = true;
                spectrum = {
                    R: { min: 255, max: 0 },
                    G: { min: 255, max: 0 },
                    B: { min: 255, max: 0 }
                };
                const { offsetX, offsetY } = e;
                selectionBox.style.left = offsetX + 'px';
                selectionBox.style.top = offsetY + 'px';
                selectionBox.style.width = '0';
                selectionBox.style.height = '0';
            });

            imageContainer.addEventListener('mousemove', (e) => {
                if (!startSelection) return;
                const { offsetX, offsetY } = e;
                const width = offsetX - parseFloat(selectionBox.style.left);
                const height = offsetY - parseFloat(selectionBox.style.top);
                selectionBox.style.width = width + 'px';
                selectionBox.style.height = height + 'px';
            });

            imageContainer.addEventListener('mouseup', () => {
                startSelection = false;
                getSpectrum();
            });
        };
    };

    reader.readAsDataURL(fileInput.files[0]);
}
function secondStep(event) {
    document.getElementById('image-container').remove();
    document.getElementById('image-upload').remove();
    document.getElementById('first-image-complete').remove();

    let files = document.createElement('input');
    files.type = 'file';
    files.id = 'images-upload';
    files.accept = 'image/*';
    files.multiple = true;
    document.body.appendChild(files);
    document.getElementById('images-upload').addEventListener('change', edit);

    let processedImages = [];

    function edit(event) {
        const images = event.target.files;
        const zip = new JSZip(); // JSZip 객체 생성

        let processedImageCount = 0;

        Array.from(images).forEach((image, index) => {
            const reader = new FileReader();
            reader.onload = function (e) {
                const img = new Image();
                img.src = e.target.result;
                img.onload = function () {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = img.width;
                    canvas.height = img.height;

                    // Draw the image on the canvas
                    ctx.drawImage(img, 0, 0);

                    // Access image data
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const data = imageData.data;

                    // Your spectrum logic to change pixel colors
                    for (let i = 0; i < data.length; i += 4) {
                        const pixel = {
                            R: data[i],
                            G: data[i + 1],
                            B: data[i + 2]
                        };

                        // Check if pixel color is within the spectrum range
                        if (
                            pixel.R >= spectrum.R.min && pixel.R <= spectrum.R.max &&
                            pixel.G >= spectrum.G.min && pixel.G <= spectrum.G.max &&
                            pixel.B >= spectrum.B.min && pixel.B <= spectrum.B.max
                        ) {
                            // Set pixel to white (255, 255, 255)
                            data[i] = 255;
                            data[i + 1] = 255;
                            data[i + 2] = 255;
                        }
                    }

                    // Put the modified image data back to the canvas
                    ctx.putImageData(imageData, 0, 0);

                    // Add the processed image to the array
                    processedImages.push({
                        name: `modified_image_${index + 1}.png`,
                        dataURL: canvas.toDataURL('image/png').split(',')[1] // Extract base64 data
                    });

                    processedImageCount++;

                    // If all images are processed, create and trigger the download link
                    if (processedImageCount === images.length) {
                        createDownloadLink(zip);
                    }
                };
            };
            reader.readAsDataURL(image);
        });

        // Remove the input element after processing
        files.remove();
    }

    function createDownloadLink(zip) {
        // Add each processed image to the zip file
        processedImages.forEach((processedImage) => {
            zip.file(processedImage.name, processedImage.dataURL, { base64: true });
        });

        // Generate the zip file and create a download link
        zip.generateAsync({ type: 'blob' }).then((blob) => {
            const downloadLink = document.createElement('a');
            downloadLink.href = URL.createObjectURL(blob);
            downloadLink.download = 'processed_images.zip';
            downloadLink.textContent = 'Download All Processed Images';
            document.body.appendChild(downloadLink);

            // Trigger the download link
            downloadLink.click();

            // Remove the download link from the DOM
            downloadLink.remove();
        });
    }
}
