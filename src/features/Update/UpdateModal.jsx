import { useEffect, useRef, useState } from "react";
import styles from "./UpdateModal.module.css";
import Input from "../../shared/ui/Input";
import ModalOverlay from "../../shared/ui/ModalOverlay";
import Button from "../../shared/ui/Button";
import InputsContainer from "../../shared/container/InputsContainer";
import ButtonsContainer from "../../shared/container/ButtonsContainer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import {
  Form,
  useActionData,
  useNavigation,
  useOutletContext,
} from "react-router-dom";
import {
  getDownloadURL,
  ref,
  updateMetadata,
  uploadBytes,
} from "firebase/storage";
import { storage } from "../../config/firebase";
import defaultCover from "../../assets/default-album-cover.jpeg";

const UpdateModal = ({ showModal, setShowModal, songRef, metadata }) => {
  const { uid } = useOutletContext();
  const editError = useActionData();
  const navigation = useNavigation();

  const [albumCoverPreview, setAlbumCoverPreview] = useState(
    metadata.albumImgL
  );
  const [endOfUpdate, setEndOfUpdate] = useState(false);
  const [errorMessage, setErrorMessage] = useState(metadata.albumImgS);

  const titleRef = useRef();
  const artistRef = useRef();
  const albumRef = useRef();
  const imageRef = useRef();

  useEffect(() => {
    if (editError?.customMetadata) {
      setEndOfUpdate(true);
    }

    setErrorMessage(editError);
  }, [editError]);

  useEffect(() => {
    if (endOfUpdate && showModal) {
      setShowModal(false);
    } else {
      setEndOfUpdate(false);
    }
  }, [endOfUpdate]);

  const handleImageSelection = (e) => {
    if (e.target.files[0]) {
      const coverFile = e.target.files[0];
      const tempURL = URL.createObjectURL(coverFile);
      setAlbumCoverPreview(tempURL);
    }
  };

  const cancelEdit = () => {
    setErrorMessage(undefined);
    setShowModal(false);
  };

  return (
    <ModalOverlay zIndex="11">
      <Form
        method="POST"
        encType="multipart/form-data"
        className={styles["form-container"]}
      >
        <h1 className={styles["modal-title"]}>Update song</h1>
        <div className={styles["edit-inputs-container"]}>
          <div className={`${styles["cover-img-container"]}`}>
            <img src={albumCoverPreview || defaultCover} alt="album-cover" />
            <div className={styles["upload-image-btn--container"]}>
              <input
                ref={imageRef}
                type="file"
                id="file"
                name="file"
                multiple={false}
                accept=".jpg, .jpeg, .png"
                onChange={handleImageSelection}
              />
              <div className={styles["upload-image-btn--decoration"]}>
                <FontAwesomeIcon size="3x" icon={faPenToSquare} />
              </div>
            </div>
          </div>

          <InputsContainer>
            <Input
              ref={titleRef}
              label="Title"
              input={{
                type: "text",
                id: "title",
                name: "title",
                defaultValue: metadata.title,
                placeholder: "Edit song title",
              }}
            />
            <Input
              ref={artistRef}
              label="Artist"
              input={{
                type: "text",
                id: "artist",
                name: "artist",
                defaultValue: metadata.artist,
                placeholder: "Edit artist name",
              }}
            />
            <Input
              ref={albumRef}
              label="Album"
              input={{
                type: "text",
                id: "album",
                name: "album",
                defaultValue: metadata.album,
                placeholder: "Edit album title",
              }}
            />
            <input
              type="hidden"
              id="refPath"
              name="refPath"
              value={songRef._location.path}
            />
            <input type="hidden" id="uid" name="uid" value={uid} />
          </InputsContainer>
        </div>
        <ButtonsContainer>
          <Button
            label="Cancel"
            type="cancel-rectangle"
            attributes={{ onClick: cancelEdit }}
          />
          <Button label="Update" type="confirm-rectangle" />
        </ButtonsContainer>
      </Form>
    </ModalOverlay>
  );
};

export default UpdateModal;

export const action = async ({ request }) => {
  const data = await request.formData();
  const title = data.get("title").trim();
  const artist = data.get("artist").trim();

  if (!title || !artist) {
    return {
      description: "Invalid input",
      action: "Please fill in all fields",
    };
  }

  const uid = data.get("uid");
  const imgFile = data.get("file");

  let imgFullpath;
  if (imgFile.name) {
    const imgPath = `${uid}/images/${imgFile.name}`;
    const imgRef = ref(storage, imgPath);
    try {
      await uploadBytes(imgRef, imgFile);
      imgFullpath = await getDownloadURL(imgRef);
    } catch (err) {
      console.log(err);
    }
  }

  const formData = {
    title,
    artist,
    album: data.get("album").trim(),
    albumImgS: imgFullpath,
    albumImgL: imgFullpath,
  };

  const metadata = {
    customMetadata: Object.fromEntries(
      Object.entries(formData).filter(([_, value]) => value)
    ),
  };

  const songPath = data.get("refPath");
  const songRef = ref(storage, songPath);

  try {
    const updatedMetadata = await updateMetadata(songRef, metadata);
    return updatedMetadata;
  } catch (err) {
    console.log(err);
  }
};
