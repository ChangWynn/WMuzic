import styles from "./css/AudioDuration.module.css";
import { Context } from "./MusicPlayer";
import { formatDuration } from "../../utilities/formatDuration";

import { useContext, useEffect } from "react";

const AudioDuration = () => {
  const { currentSongRef } = useContext(Context);
  const songData = currentSongRef.current;

  const totalDuration = formatDuration(songData?.duration);
  const currentTime = formatDuration(songData?.currentTime);

  return (
    <div className={styles["container"]}>
      <h3>{currentTime}</h3>
      <h3>{totalDuration}</h3>
    </div>
  );
};

export default AudioDuration;