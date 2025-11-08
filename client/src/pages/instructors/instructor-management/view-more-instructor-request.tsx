/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getAllInstructorRequests,
  acceptInstructorRequest,
} from "../../../api/endpoints/instructor-management";
import { toast } from "react-toastify";
import { getFullUrl, formatDate } from "../../../utils/helpers";
import Modal from "../../../components/common/modal-page";
import PDFLightbox from "../../../components/ui/PDFLightbox";
import {
  Button,
  Chip,
  Typography,
  Card,
  Tooltip,
  IconButton,
} from "@material-tailwind/react";
import {
  ArrowLeftIcon,
  EnvelopeIcon,
  PhoneIcon,
  DocumentIcon,
} from "@heroicons/react/24/outline";
import type { InstructorApiResponse } from "../../../api/types/apiResponses/api-response-instructors";

const ZOOM_LEVELS = ["page-width", "75", "90", "100", "125", "150"] as const;

const ViewMoreInstructorRequest: React.FC = () => {
  // Route: /admin/instructors/requests/:id
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [instructor, setInstructor] = useState<InstructorApiResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  const [openRejectModal, setOpenRejectModal] = useState(false);

  // PDF state handled by PDFLightbox
  const [pdfOpen, setPdfOpen] = useState(false);
  const [pdfSrc, setPdfSrc] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [pdfPage, setPdfPage] = useState(1);
  const [zoomIndex, setZoomIndex] = useState(0);

  // Normalize instructor object to always have arrays where expected
  const normalizeInstructor = (raw: any): InstructorApiResponse | null => {
    if (!raw || typeof raw !== "object") return null;
    return {
      certificates: Array.isArray(raw.certificates) ? raw.certificates : [],
      subjects: Array.isArray(raw.subjects) ? raw.subjects : [],
      interests: Array.isArray(raw.interests) ? raw.interests : [],
      coursesCreated: Array.isArray(raw.coursesCreated)
        ? raw.coursesCreated
        : [],
      coursesEnrolled: Array.isArray(raw.coursesEnrolled)
        ? raw.coursesEnrolled
        : [],
      ...raw,
    } as InstructorApiResponse;
  };

  // Load all pending requests and find the one with matching id
  const fetchInfo = async () => {
    try {
      if (!id) {
        setLoading(false);
        toast.error("Invalid instructor request id", {
          position: toast.POSITION.BOTTOM_RIGHT,
        });
        return;
      }

      const res = await getAllInstructorRequests();
      const list: any[] = res?.data?.data || res?.data || [];

      if (!Array.isArray(list)) {
        throw new Error("Invalid response format");
      }

      // we only care about pending requests
      const pending = list.filter(
        (r) => r && !r.isVerified && !r.isBlocked
      );

      const match = pending.find((item) => item?._id === id);
      setInstructor(match ? normalizeInstructor(match) : null);
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.data?.message ||
        "Failed to load instructor details";
      toast.error(msg, { position: toast.POSITION.BOTTOM_RIGHT });
      setInstructor(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInfo();
  }, [id]);

  // Open PDF inside lightbox using a safe, absolute URL
  const handleOpenPdf = (rawUrl?: string | null) => {
    if (!rawUrl) {
      setPdfError("PDF URL is missing.");
      setPdfSrc(null);
      setPdfOpen(true);
      return;
    }

    try {
      const full = getFullUrl(rawUrl);

      if (!full || !full.startsWith("http")) {
        throw new Error("Invalid PDF URL");
      }

      setPdfLoading(true);
      setPdfError(null);
      setPdfSrc(full);
      setPdfPage(1);
      setZoomIndex(0);
      setPdfOpen(true);

      // we can't reliably detect Chrome blocking via code,
      // so we optimistically stop loading after a short time
      setTimeout(() => setPdfLoading(false), 300);
    } catch {
      setPdfSrc(null);
      setPdfError(
        "Unable to load PDF. Please check the file URL or server configuration."
      );
      setPdfOpen(true);
    }
  };

  const handleApprove = async () => {
    if (!id) return;
    try {
      const res = await acceptInstructorRequest(id);
      toast.success(
        res?.data?.message || "Instructor approved successfully",
        { position: toast.POSITION.BOTTOM_RIGHT }
      );
      navigate("/admin/instructors/requests");
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.data?.message ||
        "Failed to approve instructor";
      toast.error(msg, { position: toast.POSITION.BOTTOM_RIGHT });
    }
  };

  const handleReject = () => {
    if (!id) return;
    setOpenRejectModal(true); // Modal uses rejectInstructorRequest internally
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="border-2 border-blue-500 rounded-full w-7 h-7 border-t-transparent animate-spin" />
        <span className="ml-2 text-xs text-gray-600">
          Loading instructor request...
        </span>
      </div>
    );
  }

  // Not found / already processed
  if (!id || !instructor) {
    return (
      <div className="flex justify-center">
        <Card className="w-full max-w-md p-4 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <div className="flex items-center gap-2 mb-1">
            <IconButton
              variant="text"
              color="blue-gray"
              onClick={() => navigate("/admin/instructors/requests")}
              className="p-1"
            >
              <ArrowLeftIcon className="w-4 h-4" />
            </IconButton>
            <Typography variant="h6" className="text-[13px]">
              Request not found
            </Typography>
          </div>
          <Typography className="mb-3 text-[10px] text-gray-600">
            This instructor request may have already been approved, rejected, or removed.
          </Typography>
          <Button
            color="blue"
            size="sm"
            onClick={() => navigate("/admin/instructors/requests")}
            className="normal-case text-[10px] px-3 py-1.5"
          >
            Back to Requests
          </Button>
        </Card>
      </div>
    );
  }

  const {
    _id,
    firstName,
    lastName,
    email,
    profilePic,
    mobile,
    qualification,
    subjects = [],
    experience,
    skills,
    about,
    dateJoined,
    certificates = [],
    isVerified,
    isBlocked,
  } = instructor;

  const effectiveId = _id || id;
  const fullNameRaw = `${firstName || ""} ${lastName || ""}`.trim();
  const fullName = fullNameRaw || email || "Instructor";
  const avatarSrc = profilePic?.url ? getFullUrl(profilePic.url) : "";

  const statusLabel = isBlocked
    ? "Blocked"
    : isVerified
    ? "Approved"
    : "Pending";
  const statusColor = isBlocked
    ? "red"
    : isVerified
    ? "green"
    : "amber";

  return (
    <>
      <div className="flex justify-center">
        <Card className="w-full max-w-3xl px-4 py-3 space-y-3 bg-white border border-gray-100 shadow-sm rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <IconButton
                variant="text"
                color="blue-gray"
                className="p-1"
                onClick={() => navigate("/admin/instructors/requests")}
              >
                <ArrowLeftIcon className="w-4 h-4" />
              </IconButton>
              <div>
                <Typography variant="h6" className="text-[13px]">
                  Instructor Application
                </Typography>
                <Typography className="text-[9px] text-gray-500">
                  Compact review of a pending instructor request.
                </Typography>
              </div>
            </div>
            <Chip
              value={statusLabel}
              color={statusColor}
              size="sm"
              variant="ghost"
              className="text-[9px] px-2 py-1"
            />
          </div>

          {/* Profile */}
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt={fullName}
                className="object-cover border border-gray-200 rounded-full w-11 h-11"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <div className="flex items-center justify-center text-xs font-semibold text-gray-700 bg-gray-200 rounded-full w-11 h-11">
                {fullName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <Typography className="text-sm font-semibold truncate">
                {fullName}
              </Typography>
              <Typography className="text-[9px] text-gray-500">
                Applied on {formatDate(dateJoined)}
              </Typography>
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-[10px]">
            {email && (
              <div className="flex items-center gap-1">
                <EnvelopeIcon className="w-3 h-3 text-gray-500" />
                <a
                  href={`mailto:${email}`}
                  className="text-blue-600 truncate hover:underline"
                >
                  {email}
                </a>
              </div>
            )}
            {mobile && (
              <div className="flex items-center gap-1">
                <PhoneIcon className="w-3 h-3 text-gray-500" />
                <a
                  href={`tel:${mobile}`}
                  className="text-gray-700 truncate hover:underline"
                >
                  {mobile}
                </a>
              </div>
            )}
            {qualification && (
              <div>
                <div className="text-[8px] text-gray-500 uppercase">
                  Qualification
                </div>
                <div className="text-[10px] text-gray-800">
                  {qualification}
                </div>
              </div>
            )}
            {subjects.length > 0 && (
              <div>
                <div className="text-[8px] text-gray-500 uppercase">
                  Subjects
                </div>
                <div className="text-[10px] text-gray-800">
                  {subjects.join(", ")}
                </div>
              </div>
            )}
            {experience && (
              <div>
                <div className="text-[8px] text-gray-500 uppercase">
                  Experience
                </div>
                <div className="text-[10px] text-gray-800">
                  {experience}
                </div>
              </div>
            )}
            {skills && (
              <div>
                <div className="text-[8px] text-gray-500 uppercase">
                  Skills
                </div>
                <div className="text-[10px] text-gray-800">
                  {skills}
                </div>
              </div>
            )}
          </div>

          {/* About */}
          {about && (
            <div className="pt-1">
              <div className="text-[8px] text-gray-500 uppercase">
                About
              </div>
              <p className="text-[10px] text-gray-800 leading-snug">
                {about}
              </p>
            </div>
          )}

          {/* Certificates / Documents */}
          {certificates.length > 0 && (
            <div className="pt-2 space-y-1">
              <div className="text-[8px] text-gray-500 uppercase">
                Certificates & Documents
              </div>
              <div className="flex flex-wrap gap-2">
                {certificates.map((cert, index) => {
                  const rawUrl = cert.url;
                  const name = cert.name || `File ${index + 1}`;
                  const lowerName = name.toLowerCase();
                  const isPdf =
                    /\.pdf(\?.*)?$/i.test(lowerName) ||
                    /\.pdf(\?.*)?$/i.test(rawUrl || "");
                  const fullUrl = rawUrl ? getFullUrl(rawUrl) : "";

                  if (isPdf) {
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleOpenPdf(rawUrl)}
                        className="flex items-center gap-1 px-2 py-1 transition-all border border-gray-200 rounded-md bg-gray-50 hover:bg-white hover:shadow-sm"
                      >
                        <DocumentIcon className="w-4 h-4 text-red-500" />
                        <span className="max-w-[120px] truncate text-[9px] text-gray-800">
                          {name}
                        </span>
                        <span className="text-[8px] text-blue-500 underline">
                          View
                        </span>
                      </button>
                    );
                  }

                  return (
                    <a
                      key={index}
                      href={fullUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-2 py-1 transition-all border border-gray-200 rounded-md bg-gray-50 hover:bg-white hover:shadow-sm"
                    >
                      <img
                        src={fullUrl}
                        alt={name}
                        className="object-cover rounded w-7 h-7"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                      <span className="max-w-[120px] truncate text-[9px] text-gray-800">
                        {name}
                      </span>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions - only when still Pending */}
          {!isVerified && !isBlocked && (
            <div className="flex justify-end gap-2 pt-2">
              <Tooltip content="Approve this instructor">
                <Button
                  size="sm"
                  color="green"
                  className="normal-case text-[10px] px-3 py-1.5"
                  onClick={handleApprove}
                  disabled={!effectiveId}
                >
                  Approve
                </Button>
              </Tooltip>
              <Tooltip content="Reject this request with a reason">
                <Button
                  size="sm"
                  color="red"
                  variant="outlined"
                  className="normal-case text-[10px] px-3 py-1.5"
                  onClick={handleReject}
                  disabled={!effectiveId}
                >
                  Reject
                </Button>
              </Tooltip>
            </div>
          )}

          {(isVerified || isBlocked) && (
            <div className="pt-1 text-[9px] text-right text-gray-500">
              This request has already been processed.
            </div>
          )}
        </Card>
      </div>

      {/* PDF Lightbox with proper src + fallback */}
      <PDFLightbox
        pdfOpen={pdfOpen}
        setPdfOpen={setPdfOpen}
        pdfLoading={pdfLoading}
        pdfError={pdfError || undefined}
        pdfSrc={pdfSrc || undefined}
        pdfPage={pdfPage}
        setPdfPage={setPdfPage}
        zoomLevels={ZOOM_LEVELS}
        zoomIndex={zoomIndex}
        setZoomIndex={setZoomIndex}
        courseId={effectiveId}
      />

      {/* Reject Modal */}
      {openRejectModal && effectiveId && (
        <Modal
          open={openRejectModal}
          setOpen={setOpenRejectModal}
          id={effectiveId}
        />
      )}
    </>
  );
};

export default ViewMoreInstructorRequest;
