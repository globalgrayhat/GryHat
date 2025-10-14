import React, { useEffect, useMemo, useState } from "react";
import { IoSend } from "react-icons/io5";
import { Tooltip, Card, CardBody, Button, Chip, Typography } from "@material-tailwind/react";
import DiscussionListEl from "./discussion-list";
import { addDiscussion, getDiscussionsByLesson } from "../../api/endpoints/course/discussion";
import { toast } from "react-toastify";
import { BeatLoader } from "react-spinners";
import { ApiResponseDiscussion } from "../../api/types/apiResponses/api-response-discussion";
import { useSelector } from "react-redux";
import { selectIsLoggedIn } from "../../redux/reducers/authSlice";

/**
 * Discussion — brand-aligned list + composer
 * - Clean card container with compact paddings
 * - "View more / Show less" with gentle styling
 * - Safe loading states and toasts
 */

const Discussion: React.FC<{ lessonId: string }> = ({ lessonId }) => {
  const isLoggedIn = useSelector(selectIsLoggedIn);

  const [discussionText, setDiscussionText] = useState("");
  const [discussions, setDiscussions] = useState<ApiResponseDiscussion[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [updated, setUpdated] = useState(false);
  const [visibleCount, setVisibleCount] = useState(3);

  const totalComments = discussions?.length ?? 0;
  const visibleCommentsList = useMemo(() => discussions?.slice(0, visibleCount) ?? [], [discussions, visibleCount]);

  const fetchDiscussions = async (id: string) => {
    try {
      const response = await getDiscussionsByLesson(id);
      setDiscussions(response.data ?? []);
    } catch {
      toast.error("Failed to load discussion", { position: toast.POSITION.BOTTOM_RIGHT });
    }
  };

  useEffect(() => {
    if (lessonId) fetchDiscussions(lessonId);
  }, [lessonId, updated]);

  const handlePostDiscussion = async () => {
    if (!discussionText.trim()) return;
    try {
      setIsLoading(true);
      const response = await addDiscussion(lessonId ?? "", discussionText.trim());
      toast.success(response?.message ?? "Posted", { position: toast.POSITION.BOTTOM_RIGHT });
      setDiscussionText("");
      setVisibleCount((c) => Math.max(3, c)); // keep minimum
      setUpdated((u) => !u);
    } catch {
      toast.error("Something went wrong", { position: toast.POSITION.BOTTOM_RIGHT });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewMore = () => setVisibleCount((prev) => prev + 3);
  const handleShowLess = () => setVisibleCount(3);

  return (
    <Card shadow={false} className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <CardBody className="p-4 sm:p-6">
        {/* Header */}
        <div className="mb-3 sm:mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Typography variant="h6" className="!m-0 text-gray-900 dark:text-white text-base sm:text-lg">
              Lesson Discussion
            </Typography>
            <Chip size="sm" value={totalComments} className="rounded-full text-xs" />
          </div>
        </div>

        {/* List */}
        <ul className="divide-y divide-gray-200 dark:divide-gray-700 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {visibleCommentsList.length > 0 ? (
            visibleCommentsList.map((item, index) => (
              <li key={`${item?._id ?? index}`} className="bg-white dark:bg-gray-800">
                <DiscussionListEl updated={updated} setUpdated={setUpdated} {...item} />
              </li>
            ))
          ) : (
            <li className="p-4 text-sm text-gray-500 dark:text-gray-400">No comments yet.</li>
          )}
        </ul>

        {/* Pagination controls */}
        <div className="mt-3 flex items-center gap-3">
          {visibleCount < totalComments && (
            <Button variant="text" size="sm" className="normal-case px-2 py-1" onClick={handleViewMore}>
              View more
            </Button>
          )}
          {visibleCount > 3 && (
            <Button variant="text" size="sm" className="normal-case px-2 py-1" onClick={handleShowLess}>
              Show less
            </Button>
          )}
        </div>

        {/* Composer */}
        {isLoggedIn && (
          <div className="mt-4">
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <input
                  type="text"
                  value={discussionText}
                  onChange={(e) => setDiscussionText(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your discussion"
                />
              </div>
              <div className="self-stretch">
                {isLoading ? (
                  <div className="h-full min-w-[80px] flex items-center justify-center px-2">
                    <BeatLoader color="#808080" size={8} />
                  </div>
                ) : (
                  <Tooltip
                    content="Post message"
                    placement="bottom"
                    animate={{ mount: { scale: 1, y: 0 }, unmount: { scale: 0, y: 25 } }}
                  >
                    <button
                      onClick={handlePostDiscussion}
                      disabled={!discussionText.trim()}
                      className={`rounded-md px-3 py-2 transition ${
                        !discussionText.trim()
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                    >
                      <IoSend className="text-xl" />
                    </button>
                  </Tooltip>
                )}
              </div>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default Discussion;
