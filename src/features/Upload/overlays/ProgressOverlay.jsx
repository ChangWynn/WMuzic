import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./ProgressOverlay.module.css";
import { faSpinnerThird } from "@fortawesome/pro-duotone-svg-icons";
import ModalOverlay from "../../../shared/ui/ModalOverlay";

const ProgressOverlay = ({ message }) => {
  return (
    <ModalOverlay zIndex="21">
      <div className={styles["message"]}>
        <div>
          <FontAwesomeIcon
            icon={faSpinnerThird}
            spin
            size="4x"
            style={{
              "--fa-animation-duration": "1s",
              "--fa-primary-color": "#e822ee",
              "--fa-secondary-color": "#e822ee",
            }}
          />
        </div>
        <h3>{message?.description}</h3>
        <p>{message?.action}</p>
      </div>
    </ModalOverlay>
  );
};

export default ProgressOverlay;
