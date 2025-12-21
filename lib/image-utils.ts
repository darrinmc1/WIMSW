
/**
 * Resizes an image (base64) to a maximum width/height while maintaining aspect ratio.
 * Returns a Promise that resolves to the resized image as a base64 string.
 */
export const resizeImage = (base64Str: string, maxWidth = 1024, quality = 0.8): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.src = base64Str
        img.onload = () => {
            const canvas = document.createElement('canvas')
            let width = img.width
            let height = img.height

            if (width > height) {
                if (width > maxWidth) {
                    height *= maxWidth / width
                    width = maxWidth
                }
            } else {
                if (height > maxWidth) {
                    width *= maxWidth / height
                    height = maxWidth
                }
            }

            canvas.width = width
            canvas.height = height
            const ctx = canvas.getContext('2d')
            if (!ctx) {
                reject('Canvas context not available')
                return
            }
            ctx.drawImage(img, 0, 0, width, height)
            resolve(canvas.toDataURL('image/jpeg', quality))
        }
        img.onerror = () => reject('Failed to load image')
    })
}
