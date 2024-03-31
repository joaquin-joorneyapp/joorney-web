export function parseHTTPErrors(error: any) {
    return error?.response?.data?.errors || []
}