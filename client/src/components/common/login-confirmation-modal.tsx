import { Fragment, useState } from "react";
import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";
import StudentLoginModal from "../../pages/students/StudentLoginModal";

interface Props {
  confirm: boolean;
  setConfirm: (value: boolean) => void;
}

const LoginConfirmation: React.FC<Props> = ({ confirm, setConfirm }) => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // Close confirmation dialog
  const handleCloseConfirm = () => setConfirm(false);

  // Show login modal
  const handleConfirm = () => {
    setConfirm(false);         // Close confirmation dialog
    setIsLoginOpen(true);      // Open login modal
  };

  return (
    <Fragment>
      {/* Confirmation Dialog */}
      <Dialog open={confirm} size="sm" handler={handleCloseConfirm}>
        <DialogHeader>Login Confirmation</DialogHeader>
        <DialogBody divider>
          To purchase this course, you need to be logged in. Please log in to continue.
        </DialogBody>
        <DialogFooter>
          <Button variant="text" color="red" onClick={handleCloseConfirm} className="mr-1">
            <span>Cancel</span>
          </Button>
          <Button variant="gradient" color="blue" onClick={handleConfirm}>
            <span>Proceed to Login</span>
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Student Login Modal */}
      <StudentLoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSwitchToRegister={() => {
          setIsLoginOpen(false);
          // Optionally open registration modal here if needed
        }}
      />
    </Fragment>
  );
};

export default LoginConfirmation;
