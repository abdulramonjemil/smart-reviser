import * as pdfjsLib from "pdfjs-dist"

/** Set the worker source for PDFJS. This is required. It's not linked directly
 * to the worker file in node_modules because Next.js bundles the file with
 * webpack causing the link to break since the file itself is not been imported.
 * A CDN is used instead.
 */
const PDFJS_WORKER_SOURCE = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_SOURCE

// eslint-disable-next-line import/prefer-default-export
export const PDFJS = pdfjsLib
