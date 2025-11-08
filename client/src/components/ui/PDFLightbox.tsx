import React from "react";
import { Dialog, DialogBody, Button } from "@material-tailwind/react";

// English comments: PDF inline viewer using an iframe. Receives pdfSrc/page/zoom state.
const PDFLightbox: React.FC<{
  pdfOpen: boolean;
  setPdfOpen: (v: boolean) => void;
  pdfLoading: boolean;
  pdfError?: string | null;
  pdfSrc?: string | null;
  pdfPage: number;
  setPdfPage: (n: number) => void;
  zoomLevels: readonly string[];
  zoomIndex: number;
  setZoomIndex: (i: number) => void;
  courseId?: string | undefined;
}> = ({ pdfOpen, setPdfOpen, pdfLoading, pdfError, pdfSrc, pdfPage, setPdfPage, zoomLevels, zoomIndex, setZoomIndex, courseId }) => {
  return (
    <Dialog open={pdfOpen} handler={() => setPdfOpen(false)} size="xl" className="bg-transparent shadow-none">
      <DialogBody className="p-2">
        <div className="mx-auto w-[96vw] max-w-5xl rounded-2xl bg-white dark:bg-gray-900 ring-1 ring-black/10 dark:ring-white/10 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <Button variant="text" size="sm" className="px-2 py-1 normal-case" onClick={() => setPdfPage(Math.max(1, pdfPage - 1))}>Prev</Button>
              <div className="text-sm text-gray-700 dark:text-gray-300">Page {pdfPage}</div>
              <Button variant="text" size="sm" className="px-2 py-1 normal-case" onClick={() => setPdfPage(pdfPage + 1)}>Next</Button>
              <span className="w-px h-5 mx-2 bg-gray-200 dark:bg-gray-700" />
              <Button variant="text" size="sm" className="px-2 py-1 normal-case" onClick={() => setZoomIndex(Math.max(0, zoomIndex - 1))}>-</Button>
              <div className="text-sm text-gray-700 dark:text-gray-300 min-w-[52px] text-center">{zoomLevels[zoomIndex] === "page-width" ? "Fit" : `${zoomLevels[zoomIndex]}%`}</div>
              <Button variant="text" size="sm" className="px-2 py-1 normal-case" onClick={() => setZoomIndex(Math.min(zoomLevels.length - 1, zoomIndex + 1))}>+</Button>
              <Button variant="text" size="sm" className="px-2 py-1 normal-case" onClick={() => setZoomIndex(0)}>Fit</Button>
            </div>
            <Button variant="text" size="sm" className="px-2 py-1 normal-case" onClick={() => setPdfOpen(false)}>Close</Button>
          </div>

          <div className="h-[65vh] sm:h-[70vh] bg-gray-50 dark:bg-gray-800">
            {pdfLoading && <div className="flex items-center justify-center w-full h-full text-sm text-gray-500 dark:text-gray-400">Loading PDF…</div>}
            {!pdfLoading && pdfError && <div className="flex items-center justify-center w-full h-full p-4 text-sm text-center text-red-600 dark:text-red-400">{pdfError}</div>}
            {!pdfLoading && !pdfError && pdfSrc ? (
              <iframe key={`${pdfPage}-${zoomLevels[zoomIndex]}`} src={`${pdfSrc}#page=${pdfPage}&zoom=${zoomLevels[zoomIndex]}&pagemode=none`} title={`viewer-${courseId ?? ""}`} className="w-full h-full" />
            ) : null}
          </div>
        </div>
      </DialogBody>
    </Dialog>
  );
};

export default PDFLightbox;
