import React, { Fragment, useState } from "react";
import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";
import StudentLoginModal from "../../pages/students/StudentLoginModal";

interface Props {
  show: boolean;
  onClose: () => void;
}

const SessionExpired: React.FC<Props> = ({ show, onClose }) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleConfirm = () => {
    onClose();                  // Close the session expired dialog
    setIsLoginModalOpen(true); // Open the login modal
  };

  return (
    <Fragment>
      {/* Session Expired Dialog */}
      <Dialog open={show} size="sm" handler={onClose}>
        <DialogHeader className="text-xl font-bold">Session Expired</DialogHeader>
        <DialogBody divider>
          <p className="text-gray-700">
            Your session has expired. To continue, please log in again.
          </p>
        </DialogBody>
        <DialogFooter>
          <Button variant="text" color="red" onClick={onClose} className="mr-1">
            <span>Cancel</span>
          </Button>
          <Button variant="filled" color="blue" onClick={handleConfirm} className="text-white">
            <span>Log In</span>
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Student Login Modal */}
      <StudentLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSwitchToRegister={() => {
          setIsLoginModalOpen(false);
          // Optional: Open register modal here if needed
        }}
      />
    </Fragment>
  );
};

export default SessionExpired;
