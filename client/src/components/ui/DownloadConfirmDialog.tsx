import React from "react";
import { Dialog, DialogBody, Button } from "@material-tailwind/react";
import { filenameFromUrl, formatBytes } from "./useViewCourseLogic";
import { toast } from "react-toastify";

// English comments: Confirm non-PDF downloads — identical behavior to original.
const DownloadConfirmDialog: React.FC<{
  downloadOpen: boolean;
  setDownloadOpen: (v: boolean) => void;
  downloadTargetUrl?: string | null;
  downloading: boolean;
  setDownloading: (v: boolean) => void;
  setDownloadSize: (n: number | null) => void;
  downloadSize?: number | null;
}> = ({ downloadOpen, setDownloadOpen, downloadTargetUrl, downloading, setDownloading, downloadSize }) => {
  return (
    <Dialog open={downloadOpen} handler={() => setDownloadOpen(false)} size="sm" className="bg-transparent shadow-none">
      <DialogBody className="p-2">
        <div className="mx-auto w-[92vw] max-w-md rounded-2xl bg-white dark:bg-gray-900 ring-1 ring-black/10 dark:ring-white/10 overflow-hidden">
          <div className="px-3 pt-3 text-base font-semibold">Confirm download</div>
          <div className="px-3 pb-2 text-sm text-gray-700 dark:text-gray-300">You are about to download <span className="font-medium">{filenameFromUrl(downloadTargetUrl || undefined)}</span>{downloadSize ? ` (${formatBytes(downloadSize)})` : ""}. Proceed?</div>
          <div className="flex items-center justify-end gap-2 px-3 py-2">
            <Button variant="text" size="sm" className="normal-case" onClick={() => setDownloadOpen(false)}>Cancel</Button>
            <Button color="blue" size="sm" className="normal-case" disabled={downloading} onClick={async () => {
              if (!downloadTargetUrl) return;
              setDownloading(true);
              try {
                const token = localStorage.getItem("token");
                const res = await fetch(downloadTargetUrl, { credentials: "include", headers: token ? { Authorization: `Bearer ${token}` } : {} });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = filenameFromUrl(downloadTargetUrl || undefined);
                document.body.appendChild(a);
                a.click();
                a.remove();
                setTimeout(() => URL.revokeObjectURL(url), 1000);
                setDownloadOpen(false);
              } catch {
                toast.error("Download failed.");
              } finally {
                setDownloading(false);
              }
            }}>{downloading ? (<span className="inline-flex items-center"><svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" aria-hidden="true"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>Downloading…</span>) : ("Download")}</Button>
          </div>
        </div>
      </DialogBody>
    </Dialog>
  );
};

export default DownloadConfirmDialog;
