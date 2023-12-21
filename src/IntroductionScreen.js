import React, { useState, useEffect } from "react";

function IntroductionScreen({ setShowIntro }) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [showHeadline, setShowHeadline] = useState(false);
  const [showParagraph, setShowParagraph] = useState(false);
  const [variableChanged, setVariableChanged] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentPosition = window.scrollY;

      setScrollPosition(currentPosition);

      if (currentPosition >= 100 && !showHeadline) {
        setShowHeadline(true);
      }

      if (currentPosition >= 200 && !showParagraph) {
        setShowParagraph(true);
      }

      if (currentPosition >= 300 && !variableChanged) {
        setVariableChanged(true);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [showHeadline, showParagraph, variableChanged]);

  return (
    <div
      className={"introduction-screen"}
      style={{ height: "100vh", overflowY: "scroll" }}
    >
      <div style={{}}>{<div style={{ height: "1000px" }} />}</div>
      {showHeadline && <h2>Scroll Position: {scrollPosition}</h2>}
      {showParagraph && <p>Headline is visible now!</p>}
      {variableChanged && <p>Variable has changed!</p>}
    </div>
  );
}
