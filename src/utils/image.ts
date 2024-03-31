const BASE_URL = 'https://storage.googleapis.com/joorney-pictures/'

export function buildImageUrl(url: string) {
    return BASE_URL + url
}